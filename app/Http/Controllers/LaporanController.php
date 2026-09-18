<?php

namespace App\Http\Controllers;

use App\Models\Pegawai;
use App\Models\Sppd;
use App\Models\SppdBiaya;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LaporanController extends Controller
{
    /**
     * Display reports and analytics.
     */
    public function index(Request $request): Response
    {
        $year = $request->input('tahun', date('Y'));
        $month = $request->input('bulan');
        $pegawaiId = $request->input('pegawai_id');
        $status = $request->input('status');

        $query = Sppd::with(['pegawai', 'biaya', 'pejabatPemberiPerintah'])
            ->whereYear('tanggal_berangkat', $year);

        if ($month && $month !== 'semua') {
            $query->whereMonth('tanggal_berangkat', $month);
        }

        if ($pegawaiId && $pegawaiId !== 'semua') {
            $query->where('pegawai_id', $pegawaiId);
        }

        if ($status && $status !== 'semua') {
            $query->where('status', $status);
        }

        $sppds = $query->latest('tanggal_berangkat')->get();

        // 1. Rekap Per Bulan
        $rekapBulanan = [];
        $monthsName = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        for ($m = 1; $m <= 12; $m++) {
            $monthTrips = Sppd::whereYear('tanggal_berangkat', $year)
                ->whereMonth('tanggal_berangkat', $m);

            $tripCount = $monthTrips->count();
            $biayaTotal = SppdBiaya::whereHas('sppd', function ($q) use ($year, $m) {
                $q->whereYear('tanggal_berangkat', $year)->whereMonth('tanggal_berangkat', $m);
            })->sum('total_biaya');

            $biayaLunas = SppdBiaya::where('status_pembayaran', 'lunas')
                ->whereHas('sppd', function ($q) use ($year, $m) {
                    $q->whereYear('tanggal_berangkat', $year)->whereMonth('tanggal_berangkat', $m);
                })->sum('total_biaya');

            $rekapBulanan[] = [
                'bulan' => $m,
                'nama_bulan' => $monthsName[$m],
                'jumlah_perjalanan' => $tripCount,
                'total_biaya' => (float) $biayaTotal,
                'biaya_lunas' => (float) $biayaLunas,
            ];
        }

        // 2. Rekap Per Pegawai
        $rekapPegawai = Pegawai::withCount(['sppds' => function ($q) use ($year) {
            $q->whereYear('tanggal_berangkat', $year);
        }])
            ->withSum(['sppds' => function ($q) use ($year) {
                $q->whereYear('tanggal_berangkat', $year);
            }], 'lama_hari')
            ->get()
            ->map(function ($pegawai) use ($year) {
                $totalBiaya = SppdBiaya::whereHas('sppd', function ($q) use ($pegawai, $year) {
                    $q->where('pegawai_id', $pegawai->id)->whereYear('tanggal_berangkat', $year);
                })->sum('total_biaya');

                return [
                    'id' => $pegawai->id,
                    'nama' => $pegawai->nama,
                    'nip' => $pegawai->nip,
                    'jabatan' => $pegawai->jabatan,
                    'unit_kerja' => $pegawai->unit_kerja,
                    'jumlah_perjalanan' => $pegawai->sppds_count,
                    'total_hari' => $pegawai->sppds_sum_lama_hari ?? 0,
                    'total_biaya' => (float) $totalBiaya,
                ];
            })
            ->sortByDesc('jumlah_perjalanan')
            ->values();

        // 3. Rekap Tujuan Terbanyak
        $rekapTujuan = Sppd::whereYear('tanggal_berangkat', $year)
            ->selectRaw('tempat_tujuan, count(*) as total, sum(lama_hari) as total_hari')
            ->groupBy('tempat_tujuan')
            ->orderByDesc('total')
            ->take(10)
            ->get();

        // Total metrics for filtered dataset
        $totalFilterBiaya = (float) $sppds->sum(fn ($item) => $item->biaya ? $item->biaya->total_biaya : 0);
        $totalFilterLunas = (float) $sppds->sum(fn ($item) => ($item->biaya && $item->biaya->status_pembayaran === 'lunas') ? $item->biaya->total_biaya : 0);

        return Inertia::render('laporan/index', [
            'sppds' => $sppds,
            'rekap_bulanan' => $rekapBulanan,
            'rekap_pegawai' => $rekapPegawai,
            'rekap_tujuan' => $rekapTujuan,
            'pegawais' => Pegawai::where('status_aktif', true)->orderBy('nama')->get(),
            'filters' => [
                'tahun' => (int) $year,
                'bulan' => $month ?? 'semua',
                'pegawai_id' => $pegawaiId ?? 'semua',
                'status' => $status ?? 'semua',
            ],
            'summary' => [
                'total_perjalanan' => $sppds->count(),
                'total_biaya' => $totalFilterBiaya,
                'total_lunas' => $totalFilterLunas,
                'total_belum_lunas' => $totalFilterBiaya - $totalFilterLunas,
            ],
        ]);
    }

    /**
     * Export SPPD reports to CSV (Excel compatible).
     */
    public function export(Request $request): StreamedResponse
    {
        $year = $request->input('tahun', date('Y'));
        $month = $request->input('bulan');
        $pegawaiId = $request->input('pegawai_id');
        $status = $request->input('status');

        $query = Sppd::with(['pegawai', 'biaya', 'pejabatPemberiPerintah'])
            ->whereYear('tanggal_berangkat', $year);

        if ($month && $month !== 'semua') {
            $query->whereMonth('tanggal_berangkat', $month);
        }

        if ($pegawaiId && $pegawaiId !== 'semua') {
            $query->where('pegawai_id', $pegawaiId);
        }

        if ($status && $status !== 'semua') {
            $query->where('status', $status);
        }

        $sppds = $query->latest('tanggal_berangkat')->get();

        $filename = "Laporan_SPPD_{$year}_".date('YmdHis').'.csv';

        return response()->streamDownload(function () use ($sppds) {
            $output = fopen('php://output', 'w');

            // UTF-8 BOM for Excel
            fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

            // CSV Header
            fputcsv($output, [
                'No',
                'Nomor SP',
                'Nomor SPPD',
                'Nama Pegawai',
                'NIP',
                'Pangkat / Golongan',
                'Jabatan',
                'Unit Kerja',
                'Tujuan',
                'Keperluan',
                'Alat Angkut',
                'Tgl Berangkat',
                'Tgl Kembali',
                'Lama (Hari)',
                'Uang Harian (Rp)',
                'Transportasi (Rp)',
                'Penginapan (Rp)',
                'Biaya Lainnya (Rp)',
                'Total Biaya (Rp)',
                'Status SPPD',
                'Status Pembayaran',
                'Tanggal Bayar',
                'No Bukti Kas',
            ]);

            $no = 1;
            foreach ($sppds as $sppd) {
                fputcsv($output, [
                    $no++,
                    $sppd->nomor_sp,
                    $sppd->nomor_sppd,
                    $sppd->pegawai->nama ?? '-',
                    $sppd->pegawai->nip ?? '-',
                    $sppd->pegawai->golongan ?? '-',
                    $sppd->pegawai->jabatan ?? '-',
                    $sppd->pegawai->unit_kerja ?? '-',
                    $sppd->tempat_tujuan,
                    $sppd->maksud_tujuan,
                    $sppd->alat_angkut,
                    $sppd->tanggal_berangkat->format('d/m/Y'),
                    $sppd->tanggal_kembali->format('d/m/Y'),
                    $sppd->lama_hari,
                    $sppd->biaya ? number_format($sppd->biaya->uang_harian_total, 0, ',', '.') : 0,
                    $sppd->biaya ? number_format($sppd->biaya->biaya_transportasi, 0, ',', '.') : 0,
                    $sppd->biaya ? number_format($sppd->biaya->biaya_penginapan_total, 0, ',', '.') : 0,
                    $sppd->biaya ? number_format($sppd->biaya->biaya_lainnya, 0, ',', '.') : 0,
                    $sppd->biaya ? number_format($sppd->biaya->total_biaya, 0, ',', '.') : 0,
                    strtoupper($sppd->status),
                    strtoupper(str_replace('_', ' ', $sppd->biaya->status_pembayaran ?? '-')),
                    $sppd->biaya && $sppd->biaya->tanggal_bayar ? $sppd->biaya->tanggal_bayar->format('d/m/Y') : '-',
                    $sppd->biaya->nomor_bukti_kas ?? '-',
                ]);
            }

            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
