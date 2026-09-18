<?php

namespace App\Http\Controllers;

use App\Models\Sppd;
use App\Models\SppdApproval;
use App\Notifications\SppdStatusUpdatedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SppdApprovalController extends Controller
{
    /**
     * Display the list of SPPDs awaiting approval.
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'diajukan');

        $query = Sppd::with(['pegawai', 'biaya', 'pejabatPemberiPerintah', 'approvals.user'])->latest();

        if ($status !== 'semua') {
            $query->where('status', $status);
        }

        $sppds = $query->paginate(12)->withQueryString();

        $counts = [
            'diajukan' => Sppd::where('status', 'diajukan')->count(),
            'disetujui' => Sppd::where('status', 'disetujui')->count(),
            'ditolak' => Sppd::where('status', 'ditolak')->count(),
            'selesai' => Sppd::where('status', 'selesai')->count(),
        ];

        return Inertia::render('persetujuan/index', [
            'sppds' => $sppds,
            'counts' => $counts,
            'current_status' => $status,
        ]);
    }

    /**
     * Process approval, rejection, revision, or completion of an SPPD.
     */
    public function store(Request $request, Sppd $sppd): RedirectResponse
    {
        abort_if($request->user()->role === 'bendahara', 403, 'Bendahara tidak memiliki wewenang untuk menyetujui pengajuan perjalanan dinas.');

        $validated = $request->validate([
            'action' => ['required', 'string', 'in:disetujui,ditolak,revisi,selesai'],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ]);

        $action = $validated['action'];
        $catatan = $validated['catatan'] ?? null;
        $user = $request->user();

        if ($action === 'disetujui') {
            $sppd->update([
                'status' => 'disetujui',
                'catatan_atasan' => $catatan,
                'catatan_revisi' => null,
            ]);

            if ($sppd->biaya && $sppd->biaya->status_pembayaran === 'belum_dibayar') {
                $sppd->biaya->update([
                    'status_pembayaran' => 'menunggu_pencairan',
                ]);
            }

            $message = 'Pengajuan SPPD berhasil disetujui.';
        } elseif ($action === 'ditolak' || $action === 'revisi') {
            $sppd->update([
                'status' => 'ditolak',
                'catatan_revisi' => $catatan,
            ]);

            $message = $action === 'revisi'
                ? 'Catatan revisi telah dikirimkan kepada pegawai.'
                : 'Pengajuan SPPD telah ditolak.';
        } elseif ($action === 'selesai') {
            $sppd->update([
                'status' => 'selesai',
            ]);

            $message = 'Status perjalanan dinas berhasil ditandai sebagai Selesai.';
        }

        // Record history
        SppdApproval::create([
            'sppd_id' => $sppd->id,
            'user_id' => $user->id,
            'role' => $user->role,
            'action' => $action,
            'catatan' => $catatan,
        ]);

        // Kirim notifikasi ke guru / pemohon
        $targetUser = $sppd->createdByUser ?? $sppd->pegawai?->user;
        if ($targetUser) {
            $notificationTitle = match ($action) {
                'disetujui' => 'Pengajuan SPPD Disetujui',
                'ditolak' => 'Pengajuan SPPD Ditolak',
                'revisi' => 'Laporan / Pengajuan Perlu Diperbaiki',
                'selesai' => 'Perjalanan Dinas Selesai & Dokumen Diterbitkan',
                default => 'Status Pengajuan SPPD Diperbarui',
            };

            $notificationMessage = match ($action) {
                'disetujui' => "Pengajuan tugas dinas ke {$sppd->tempat_tujuan} telah disetujui Kepala Sekolah. Dokumen SPPD dan Surat Tugas siap dicetak.",
                'ditolak' => "Pengajuan tugas dinas ke {$sppd->tempat_tujuan} ditolak. Catatan: ".($catatan ?: 'Tidak ada catatan tambahan.'),
                'revisi' => "Pengajuan tugas dinas ke {$sppd->tempat_tujuan} memerlukan perbaikan. Catatan: ".($catatan ?: 'Silakan periksa detail.'),
                'selesai' => "Perjalanan dinas ke {$sppd->tempat_tujuan} telah dinyatakan selesai.",
                default => "Status perjalanan dinas Anda kini: {$sppd->status}.",
            };

            $targetUser->notify(new SppdStatusUpdatedNotification(
                sppdId: $sppd->id,
                nomorSp: $sppd->nomor_sp,
                judul: $notificationTitle,
                pesan: $notificationMessage,
                status: $sppd->status,
                catatan: $catatan,
                actionUrl: "/sppd/{$sppd->id}",
            ));
        }

        return redirect()->back()->with('success', $message);
    }
}
