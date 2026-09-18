<?php

namespace App\Http\Controllers;

use App\Models\Pegawai;
use App\Models\SppdApproval;
use App\Models\SppdBiaya;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KeuanganController extends Controller
{
    /**
     * Display financial verification dashboard and disbursement list.
     */
    public function index(Request $request): Response
    {
        $statusPembayaran = $request->input('status_pembayaran');
        $search = $request->input('search');

        $query = SppdBiaya::with(['sppd.pegawai', 'sppd.pejabatPemberiPerintah'])->latest();

        if ($statusPembayaran && in_array($statusPembayaran, ['belum_dibayar', 'menunggu_pencairan', 'lunas'])) {
            $query->where('status_pembayaran', $statusPembayaran);
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
            });
        }

        $biayas = $query->paginate(12)->withQueryString();

        $metrics = [
            'total_anggaran' => (float) SppdBiaya::sum('total_biaya'),
            'total_lunas' => (float) SppdBiaya::whereIn('status_pembayaran', ['lunas', 'sudah_dibayar'])->sum('total_biaya'),
            'total_uang_harian' => (float) SppdBiaya::sum('uang_harian_total'),
            'total_transportasi' => (float) SppdBiaya::sum('biaya_transportasi'),
            'total_penginapan' => (float) SppdBiaya::sum('biaya_penginapan_total'),
            'total_pembayaran' => (float) SppdBiaya::whereIn('status_pembayaran', ['lunas', 'sudah_dibayar'])->sum('total_biaya'),
            'menunggu_pencairan' => (float) SppdBiaya::whereIn('status_pembayaran', ['menunggu_pencairan', 'diproses'])->sum('total_biaya'),
            'belum_dibayar' => (float) SppdBiaya::where('status_pembayaran', 'belum_dibayar')->sum('total_biaya'),
            'count_menunggu' => SppdBiaya::whereIn('status_pembayaran', ['menunggu_pencairan', 'diproses'])->count(),
            'count_lunas' => SppdBiaya::whereIn('status_pembayaran', ['lunas', 'sudah_dibayar'])->count(),
        ];

        // Rekap per Guru
        $rekapGuru = Pegawai::whereHas('sppds.biaya')
            ->with(['sppds.biaya'])
            ->get()
            ->map(function ($guru) {
                $totalSppd = $guru->sppds->count();
                $totalBiaya = (float) $guru->sppds->sum(fn ($s) => $s->biaya?->total_biaya ?? 0);
                $totalDibayar = (float) $guru->sppds->sum(fn ($s) => in_array($s->biaya?->status_pembayaran, ['lunas', 'sudah_dibayar']) ? ($s->biaya?->total_biaya ?? 0) : 0);

                return [
                    'nama' => $guru->nama,
                    'nip' => $guru->nip,
                    'jabatan' => $guru->jabatan,
                    'nama_bank' => $guru->nama_bank,
                    'nomor_rekening' => $guru->nomor_rekening,
                    'total_perjalanan' => $totalSppd,
                    'total_biaya' => $totalBiaya,
                    'total_dibayar' => $totalDibayar,
                ];
            });

        // Rekap Bulanan
        $rekapBulanan = SppdBiaya::with('sppd')
            ->get()
            ->groupBy(function ($b) {
                return $b->sppd && $b->sppd->tanggal_berangkat
                    ? Carbon::parse($b->sppd->tanggal_berangkat)->format('Y-m')
                    : 'Lainnya';
            })
            ->map(function ($items, $bulan) {
                return [
                    'bulan' => $bulan,
                    'jumlah_perjalanan' => $items->count(),
                    'uang_harian' => (float) $items->sum('uang_harian_total'),
                    'transportasi' => (float) $items->sum('biaya_transportasi'),
                    'penginapan' => (float) $items->sum('biaya_penginapan_total'),
                    'biaya_lainnya' => (float) $items->sum('biaya_lainnya'),
                    'total' => (float) $items->sum('total_biaya'),
                ];
            })
            ->values();

        return Inertia::render('keuangan/index', [
            'biayas' => $biayas,
            'metrics' => $metrics,
            'rekap_guru' => $rekapGuru,
            'rekap_bulanan' => $rekapBulanan,
            'filters' => [
                'status_pembayaran' => $statusPembayaran ?? 'semua',
                'search' => $search,
            ],
        ]);
    }

    /**
     * Export financial recap to Excel/CSV.
     */
    public function exportExcel()
    {
        $biayas = SppdBiaya::with(['sppd.pegawai', 'anggaran'])->latest()->get();

        $filename = 'Rekap_Keuangan_SPPD_SMK_Budi_Mulia_'.date('Ymd_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($biayas) {
            $output = fopen('php://output', 'w');
            // Write UTF-8 BOM so Excel opens with proper Indonesian characters
            fwrite($output, "\xEF\xBB\xBF");

            // CSV Headers
            fputcsv($output, [
                'No',
                'Nomor SPPD',
                'Nomor Surat Perintah',
                'Nama Guru',
                'NIP',
                'Tujuan',
                'Tanggal Berangkat',
                'Tanggal Kembali',
                'Lama (Hari)',
                'Pos Anggaran',
                'Uang Harian (Rp)',
                'Biaya Transportasi (Rp)',
                'Biaya Penginapan (Rp)',
                'Biaya Lainnya (Rp)',
                'Total Biaya (Rp)',
                'Status Verifikasi',
                'Status Pembayaran',
                'Tanggal Bayar',
                'Metode Pembayaran',
                'Nomor Bukti Kas',
            ]);

            $no = 1;
            foreach ($biayas as $b) {
                fputcsv($output, [
                    $no++,
                    $b->sppd?->nomor_sppd ?? '-',
                    $b->sppd?->nomor_sp ?? '-',
                    $b->sppd?->pegawai?->nama ?? '-',
                    $b->sppd?->pegawai?->nip ?? '-',
                    $b->sppd?->tempat_tujuan ?? '-',
                    $b->sppd?->tanggal_berangkat?->format('d/m/Y') ?? '-',
                    $b->sppd?->tanggal_kembali?->format('d/m/Y') ?? '-',
                    $b->sppd?->lama_hari ?? 0,
                    $b->anggaran?->nama_anggaran ?? 'Kas Sekolah',
                    $b->uang_harian_total,
                    $b->biaya_transportasi,
                    $b->biaya_penginapan_total,
                    $b->biaya_lainnya,
                    $b->total_biaya,
                    ucfirst(str_replace('_', ' ', $b->status_verifikasi ?? 'menunggu')),
                    ucfirst(str_replace('_', ' ', $b->status_pembayaran)),
                    $b->tanggal_bayar?->format('d/m/Y') ?? '-',
                    $b->metode_pembayaran ?? '-',
                    $b->nomor_bukti_kas ?? '-',
                ]);
            }

            fclose($output);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Update disbursement and financial settlement.
     */
    public function update(Request $request, SppdBiaya $biaya): RedirectResponse
    {
        $validated = $request->validate([
            'uang_harian_hari' => ['required', 'integer', 'min:1'],
            'uang_harian_per_hari' => ['required', 'numeric', 'min:0'],
            'biaya_transportasi' => ['required', 'numeric', 'min:0'],
            'biaya_penginapan_malam' => ['required', 'integer', 'min:0'],
            'biaya_penginapan_per_malam' => ['required', 'numeric', 'min:0'],
            'biaya_lainnya' => ['nullable', 'numeric', 'min:0'],
            'keterangan_biaya_lainnya' => ['nullable', 'string', 'max:255'],
            'status_pembayaran' => ['required', 'string', 'in:belum_dibayar,menunggu_pencairan,lunas'],
            'tanggal_bayar' => ['nullable', 'date'],
            'metode_pembayaran' => ['nullable', 'string', 'max:50'],
            'nomor_bukti_kas' => ['nullable', 'string', 'max:100'],
            'catatan_bendahara' => ['nullable', 'string', 'max:500'],
        ]);

        $uangHarianTotal = $validated['uang_harian_hari'] * $validated['uang_harian_per_hari'];
        $hotelTotal = $validated['biaya_penginapan_malam'] * $validated['biaya_penginapan_per_malam'];
        $lainnya = (float) ($validated['biaya_lainnya'] ?? 0);
        $totalBiaya = $uangHarianTotal + $validated['biaya_transportasi'] + $hotelTotal + $lainnya;

        $biaya->update([
            'uang_harian_hari' => $validated['uang_harian_hari'],
            'uang_harian_per_hari' => $validated['uang_harian_per_hari'],
            'uang_harian_total' => $uangHarianTotal,
            'biaya_transportasi' => $validated['biaya_transportasi'],
            'biaya_penginapan_malam' => $validated['biaya_penginapan_malam'],
            'biaya_penginapan_per_malam' => $validated['biaya_penginapan_per_malam'],
            'biaya_penginapan_total' => $hotelTotal,
            'biaya_lainnya' => $lainnya,
            'keterangan_biaya_lainnya' => $validated['keterangan_biaya_lainnya'] ?? null,
            'total_biaya' => $totalBiaya,
            'status_pembayaran' => $validated['status_pembayaran'],
            'tanggal_bayar' => $validated['tanggal_bayar'] ?? ($validated['status_pembayaran'] === 'lunas' ? now()->toDateString() : null),
            'metode_pembayaran' => $validated['metode_pembayaran'] ?? 'Transfer Bank',
            'nomor_bukti_kas' => $validated['nomor_bukti_kas'] ?? null,
            'catatan_bendahara' => $validated['catatan_bendahara'] ?? null,
        ]);

        // Log action if marked lunas
        if ($validated['status_pembayaran'] === 'lunas') {
            SppdApproval::create([
                'sppd_id' => $biaya->sppd_id,
                'user_id' => $request->user()->id,
                'role' => $request->user()->role ?? 'bendahara',
                'action' => 'dicairkan',
                'catatan' => 'Biaya perjalanan dinas telah diverifikasi dan dicairkan (No Bukti Kas: '.($validated['nomor_bukti_kas'] ?? '-').').',
            ]);
        }

        return redirect()->back()->with('success', 'Rincian biaya dan status pembayaran berhasil diperbarui.');
    }
}
