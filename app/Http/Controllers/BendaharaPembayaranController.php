<?php

namespace App\Http\Controllers;

use App\Models\SppdApproval;
use App\Models\SppdBiaya;
use App\Notifications\SppdStatusUpdatedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BendaharaPembayaranController extends Controller
{
    /**
     * Display travel expense disbursement queue with status filters.
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'semua');
        $search = $request->input('search');

        $query = SppdBiaya::with([
            'sppd.pegawai',
            'sppd.pejabatPemberiPerintah',
            'anggaran',
            'verifiedBy',
        ])
            ->whereHas('sppd', function ($q) {
                $q->whereIn('status', ['disetujui', 'selesai']);
            })
            ->latest();

        if ($status !== 'semua') {
            if ($status === 'sudah_dibayar') {
                $query->whereIn('status_pembayaran', ['sudah_dibayar', 'lunas']);
            } elseif ($status === 'diproses') {
                $query->whereIn('status_pembayaran', ['diproses', 'menunggu_pencairan']);
            } else {
                $query->where('status_pembayaran', $status);
            }
        }

        if ($search) {
            $query->whereHas('sppd', function ($q) use ($search) {
                $q->where('nomor_sppd', 'like', "%{$search}%")
                    ->orWhere('nomor_sp', 'like', "%{$search}%")
                    ->orWhere('tempat_tujuan', 'like', "%{$search}%")
                    ->orWhereHas('pegawai', function ($sub) use ($search) {
                        $sub->where('nama', 'like', "%{$search}%")
                            ->orWhere('nip', 'like', "%{$search}%");
                    });
            })->orWhere('nomor_bukti_kas', 'like', "%{$search}%");
        }

        $biayas = $query->paginate(12)->withQueryString();

        $counts = [
            'semua' => SppdBiaya::whereHas('sppd', function ($q) {
                $q->whereIn('status', ['disetujui', 'selesai']);
            })->count(),
            'belum_dibayar' => SppdBiaya::where('status_pembayaran', 'belum_dibayar')
                ->whereHas('sppd', fn ($q) => $q->whereIn('status', ['disetujui', 'selesai']))->count(),
            'diproses' => SppdBiaya::whereIn('status_pembayaran', ['diproses', 'menunggu_pencairan'])
                ->whereHas('sppd', fn ($q) => $q->whereIn('status', ['disetujui', 'selesai']))->count(),
            'sudah_dibayar' => SppdBiaya::whereIn('status_pembayaran', ['sudah_dibayar', 'lunas'])
                ->whereHas('sppd', fn ($q) => $q->whereIn('status', ['disetujui', 'selesai']))->count(),
            'ditunda' => SppdBiaya::where('status_pembayaran', 'ditunda')
                ->whereHas('sppd', fn ($q) => $q->whereIn('status', ['disetujui', 'selesai']))->count(),
        ];

        return Inertia::render('bendahara/pembayaran', [
            'biayas' => $biayas,
            'counts' => $counts,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display completed payment records archive.
     */
    public function riwayat(Request $request): Response
    {
        $search = $request->input('search');

        $query = SppdBiaya::with([
            'sppd.pegawai',
            'sppd.pejabatPemberiPerintah',
            'anggaran',
            'verifiedBy',
        ])
            ->whereIn('status_pembayaran', ['sudah_dibayar', 'lunas'])
            ->latest('tanggal_bayar');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_bukti_kas', 'like', "%{$search}%")
                    ->orWhere('metode_pembayaran', 'like', "%{$search}%")
                    ->orWhereHas('sppd', function ($sq) use ($search) {
                        $sq->where('nomor_sppd', 'like', "%{$search}%")
                            ->orWhere('nomor_sp', 'like', "%{$search}%")
                            ->orWhere('tempat_tujuan', 'like', "%{$search}%")
                            ->orWhereHas('pegawai', function ($sub) use ($search) {
                                $sub->where('nama', 'like', "%{$search}%")
                                    ->orWhere('nip', 'like', "%{$search}%");
                            });
                    });
            });
        }

        $riwayat = $query->paginate(12)->withQueryString();
        $totalDibayar = (float) SppdBiaya::whereIn('status_pembayaran', ['sudah_dibayar', 'lunas'])->sum('total_biaya');

        return Inertia::render('bendahara/riwayat-pembayaran', [
            'riwayat' => $riwayat,
            'total_dibayar' => $totalDibayar,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Process payment disbursement with optional proof slip upload.
     */
    public function process(Request $request, SppdBiaya $biaya): RedirectResponse
    {
        $validated = $request->validate([
            'status_pembayaran' => ['required', 'string', 'in:belum_dibayar,diproses,sudah_dibayar,ditunda'],
            'tanggal_bayar' => ['required_if:status_pembayaran,sudah_dibayar', 'nullable', 'date'],
            'metode_pembayaran' => ['nullable', 'string', 'max:50'],
            'nomor_bukti_kas' => ['required_if:status_pembayaran,sudah_dibayar', 'nullable', 'string', 'max:100'],
            'catatan_bendahara' => ['nullable', 'string', 'max:500'],
            'file_bukti_bayar' => ['nullable', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'],
        ]);

        $filePath = $biaya->file_bukti_bayar;
        if ($request->hasFile('file_bukti_bayar')) {
            $file = $request->file('file_bukti_bayar');
            $filePath = $file->store('bukti-bayar-sppd', 'public');
        }

        $biaya->update([
            'status_pembayaran' => $validated['status_pembayaran'],
            'tanggal_bayar' => $validated['tanggal_bayar'] ?? ($validated['status_pembayaran'] === 'sudah_dibayar' ? now()->toDateString() : null),
            'metode_pembayaran' => $validated['metode_pembayaran'] ?? 'Transfer Bank BJB',
            'nomor_bukti_kas' => $validated['nomor_bukti_kas'] ?? null,
            'catatan_bendahara' => $validated['catatan_bendahara'] ?? null,
            'file_bukti_bayar' => $filePath,
        ]);

        // Audit Trail log
        if ($validated['status_pembayaran'] === 'sudah_dibayar') {
            SppdApproval::create([
                'sppd_id' => $biaya->sppd_id,
                'user_id' => $request->user()->id,
                'role' => 'bendahara',
                'action' => 'dicairkan',
                'catatan' => 'Biaya perjalanan dinas telah dibayarkan (No Kas: '.($validated['nomor_bukti_kas'] ?? '-').').',
            ]);

            // Notify teacher
            $teacherUser = $biaya->sppd?->pegawai?->user ?? $biaya->sppd?->creator;
            if ($teacherUser) {
                $teacherUser->notify(new SppdStatusUpdatedNotification(
                    sppdId: $biaya->sppd_id,
                    nomorSp: $biaya->sppd->nomor_sp,
                    judul: 'Biaya SPPD Telah Dibayarkan',
                    pesan: "Biaya penugasan ke {$biaya->sppd->tempat_tujuan} telah dicairkan melalui {$biaya->metode_pembayaran} (No Kas: {$biaya->nomor_bukti_kas}).",
                    status: 'selesai',
                    actionUrl: "/sppd/{$biaya->sppd_id}",
                ));
            }
        }

        return redirect()->back()->with('success', 'Status pembayaran perjalanan dinas berhasil diproses.');
    }

    /**
     * Print official Cash Disbursement Receipt / Kuitansi Pembayaran SPPD.
     */
    public function printKuitansi(SppdBiaya $biaya): Response
    {
        $biaya->load([
            'sppd.pegawai',
            'sppd.pejabatPemberiPerintah',
            'anggaran',
            'verifiedBy',
        ]);

        return Inertia::render('dokumen/print-kuitansi-bayar', [
            'biaya' => $biaya,
            'sppd' => $biaya->sppd,
        ]);
    }
}
