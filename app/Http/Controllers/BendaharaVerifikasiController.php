<?php

namespace App\Http\Controllers;

use App\Models\Sppd;
use App\Models\SppdAnggaran;
use App\Models\SppdApproval;
use App\Notifications\SppdStatusUpdatedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BendaharaVerifikasiController extends Controller
{
    /**
     * Display SPPDs approved by Principal for cost and report verification.
     */
    public function index(Request $request): Response
    {
        $statusVerifikasi = $request->input('status_verifikasi', 'semua');
        $search = $request->input('search');

        $query = Sppd::with([
            'pegawai',
            'biaya.anggaran',
            'dokumens',
            'laporan',
            'approvals.user',
        ])
            ->whereIn('status', ['disetujui', 'selesai'])
            ->latest();

        if ($statusVerifikasi !== 'semua') {
            $query->whereHas('biaya', function ($q) use ($statusVerifikasi) {
                $q->where('status_verifikasi', $statusVerifikasi);
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_sppd', 'like', "%{$search}%")
                    ->orWhere('nomor_sp', 'like', "%{$search}%")
                    ->orWhere('tempat_tujuan', 'like', "%{$search}%")
                    ->orWhere('maksud_tujuan', 'like', "%{$search}%")
                    ->orWhereHas('pegawai', function ($sub) use ($search) {
                        $sub->where('nama', 'like', "%{$search}%")
                            ->orWhere('nip', 'like', "%{$search}%");
                    });
            });
        }

        $sppds = $query->paginate(10)->withQueryString();

        $counts = [
            'total' => Sppd::whereIn('status', ['disetujui', 'selesai'])->count(),
            'menunggu' => Sppd::whereIn('status', ['disetujui', 'selesai'])
                ->whereHas('biaya', function ($q) {
                    $q->where('status_verifikasi', 'menunggu_verifikasi');
                })->count(),
            'terverifikasi' => Sppd::whereIn('status', ['disetujui', 'selesai'])
                ->whereHas('biaya', function ($q) {
                    $q->where('status_verifikasi', 'terverifikasi');
                })->count(),
            'perlu_perbaikan' => Sppd::whereIn('status', ['disetujui', 'selesai'])
                ->whereHas('biaya', function ($q) {
                    $q->where('status_verifikasi', 'perlu_perbaikan');
                })->count(),
        ];

        $anggarans = SppdAnggaran::where('status', 'aktif')->get();

        return Inertia::render('bendahara/verifikasi', [
            'sppds' => $sppds,
            'counts' => $counts,
            'anggarans' => $anggarans,
            'filters' => [
                'status_verifikasi' => $statusVerifikasi,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Process verification of SPPD costs and travel report.
     */
    public function verify(Request $request, Sppd $sppd): RedirectResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', 'in:terverifikasi,perlu_perbaikan'],
            'catatan_verifikasi' => ['nullable', 'string', 'max:1000'],
            'anggaran_id' => ['nullable', 'exists:sppd_anggarans,id'],
            'biaya_transportasi' => ['nullable', 'numeric', 'min:0'],
            'biaya_penginapan_total' => ['nullable', 'numeric', 'min:0'],
            'biaya_lainnya' => ['nullable', 'numeric', 'min:0'],
        ]);

        $biaya = $sppd->biaya;
        if (! $biaya) {
            return redirect()->back()->with('error', 'Rincian biaya SPPD tidak ditemukan.');
        }

        $user = $request->user();
        $isApproved = $validated['action'] === 'terverifikasi';

        // Update nominal if treasurer adjusted them
        $transportasi = isset($validated['biaya_transportasi']) ? (float) $validated['biaya_transportasi'] : $biaya->biaya_transportasi;
        $penginapanTotal = isset($validated['biaya_penginapan_total']) ? (float) $validated['biaya_penginapan_total'] : $biaya->biaya_penginapan_total;
        $biayaLainnya = isset($validated['biaya_lainnya']) ? (float) $validated['biaya_lainnya'] : $biaya->biaya_lainnya;
        $totalBiaya = $biaya->uang_harian_total + $transportasi + $penginapanTotal + $biayaLainnya;

        $biaya->update([
            'status_verifikasi' => $validated['action'],
            'catatan_verifikasi' => $validated['catatan_verifikasi'] ?? null,
            'verified_by_user_id' => $user->id,
            'verified_at' => now(),
            'anggaran_id' => $validated['anggaran_id'] ?? $biaya->anggaran_id,
            'biaya_transportasi' => $transportasi,
            'biaya_penginapan_total' => $penginapanTotal,
            'biaya_lainnya' => $biayaLainnya,
            'total_biaya' => $totalBiaya,
            'status_pembayaran' => $isApproved && $biaya->status_pembayaran === 'belum_dibayar'
                ? 'diproses'
                : $biaya->status_pembayaran,
        ]);

        // Record approval history
        SppdApproval::create([
            'sppd_id' => $sppd->id,
            'user_id' => $user->id,
            'role' => 'bendahara',
            'action' => $isApproved ? 'diverifikasi' : 'revisi_biaya',
            'catatan' => $validated['catatan_verifikasi'] ?? ($isApproved ? 'Biaya SPPD telah diperiksa dan diverifikasi oleh Bendahara.' : 'Catatan perbaikan rincian biaya / bukti pengeluaran.'),
        ]);

        // Send notification to teacher
        $teacherUser = $sppd->pegawai?->user ?? $sppd->creator;
        if ($teacherUser) {
            $teacherUser->notify(new SppdStatusUpdatedNotification(
                sppdId: $sppd->id,
                nomorSp: $sppd->nomor_sp,
                judul: $isApproved ? 'Biaya SPPD Terverifikasi' : 'Perbaikan Biaya / Laporan SPPD',
                pesan: $isApproved
                    ? "Rincian biaya dan bukti pengeluaran perjalanan dinas ke {$sppd->tempat_tujuan} telah diverifikasi oleh Bendahara."
                    : "Bendahara meminta perbaikan data biaya/laporan untuk penugasan ke {$sppd->tempat_tujuan}.",
                status: $isApproved ? 'diverifikasi' : 'perlu_perbaikan',
                catatan: $validated['catatan_verifikasi'] ?? null,
                actionUrl: "/sppd/{$sppd->id}",
            ));
        }

        $msg = $isApproved
            ? 'Biaya dan berkas SPPD berhasil diverifikasi.'
            : 'Permintaan perbaikan biaya telah dikirimkan kepada guru.';

        return redirect()->back()->with('success', $msg);
    }
}
