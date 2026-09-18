<?php

namespace App\Http\Controllers;

use App\Models\Pegawai;
use App\Models\Sppd;
use App\Models\SppdAnggaran;
use App\Models\SppdBiaya;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the application dashboard with KPI metrics and charts.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Base query
        $totalSppd = Sppd::count();
        $pendingSppd = Sppd::where('status', 'diajukan')->count();
        $approvedSppd = Sppd::where('status', 'disetujui')->count();
        $completedSppd = Sppd::where('status', 'selesai')->count();
        $rejectedSppd = Sppd::where('status', 'ditolak')->count();

        // Biaya
        $totalBiaya = (float) SppdBiaya::sum('total_biaya');
        $biayaLunas = (float) SppdBiaya::where('status_pembayaran', 'lunas')->sum('total_biaya');
        $biayaPending = (float) SppdBiaya::where('status_pembayaran', '!=', 'lunas')->sum('total_biaya');

        // Personal stats if logged in as employee / guru
        $myStats = null;
        if ($user && $user->pegawai_id) {
            $myStats = [
                'total' => Sppd::where('pegawai_id', $user->pegawai_id)->count(),
                'diajukan' => Sppd::where('pegawai_id', $user->pegawai_id)->where('status', 'diajukan')->count(),
                'disetujui' => Sppd::where('pegawai_id', $user->pegawai_id)->where('status', 'disetujui')->count(),
                'ditolak' => Sppd::where('pegawai_id', $user->pegawai_id)->where('status', 'ditolak')->count(),
                'selesai' => Sppd::where('pegawai_id', $user->pegawai_id)->where('status', 'selesai')->count(),
            ];
        }

        // Recent travel orders (scoped to guru if role is pegawai)
        $recentQuery = Sppd::with(['pegawai', 'biaya', 'pejabatPemberiPerintah'])->latest();
        if ($user && $user->isPegawai() && $user->pegawai_id) {
            $recentQuery->where('pegawai_id', $user->pegawai_id);
        }
        $recentSppds = $recentQuery->take(6)->get();

        // Transport breakdown
        $transportStats = Sppd::selectRaw('alat_angkut, count(*) as count')
            ->groupBy('alat_angkut')
            ->get();

        // Monthly trends for current year
        $monthlyTrends = [];
        $months = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];

        $currentYear = date('Y');
        $monthlyCounts = Sppd::whereYear('tanggal_berangkat', $currentYear)
            ->selectRaw('strftime("%m", tanggal_berangkat) as month, count(*) as count')
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();

        foreach ($months as $num => $label) {
            $key = str_pad((string) $num, 2, '0', STR_PAD_LEFT);
            $monthlyTrends[] = [
                'month' => $label,
                'count' => $monthlyCounts[$key] ?? 0,
            ];
        }

        // Bendahara specific metrics
        $bendaharaStats = null;
        $antreanVerifikasi = null;
        if ($user && $user->isBendahara()) {
            $totalAnggaranPagu = (float) SppdAnggaran::where('status', 'aktif')->sum('total_anggaran');
            $totalDibayar = (float) SppdBiaya::whereIn('status_pembayaran', ['sudah_dibayar', 'lunas'])->sum('total_biaya');
            $totalBelumDibayar = (float) SppdBiaya::whereIn('status_pembayaran', ['belum_dibayar', 'diproses', 'ditunda', 'menunggu_pencairan'])->sum('total_biaya');
            $pengeluaranBulanIni = (float) SppdBiaya::whereIn('status_pembayaran', ['sudah_dibayar', 'lunas'])
                ->whereYear('tanggal_bayar', date('Y'))
                ->whereMonth('tanggal_bayar', date('m'))
                ->sum('total_biaya');

            $menungguVerifikasiCount = Sppd::whereIn('status', ['disetujui', 'selesai'])
                ->whereHas('biaya', function ($q) {
                    $q->where('status_verifikasi', 'menunggu_verifikasi');
                })
                ->count();

            $bendaharaStats = [
                'total_sppd' => $totalSppd,
                'menunggu_verifikasi' => $menungguVerifikasiCount,
                'total_anggaran' => $totalAnggaranPagu,
                'total_dibayarkan' => $totalDibayar,
                'total_belum_dibayar' => $totalBelumDibayar,
                'pengeluaran_bulan_ini' => $pengeluaranBulanIni,
            ];

            $antreanVerifikasi = Sppd::with(['pegawai', 'biaya.anggaran', 'pejabatPemberiPerintah'])
                ->whereIn('status', ['disetujui', 'selesai'])
                ->latest()
                ->take(5)
                ->get();
        }

        return Inertia::render('dashboard', [
            'metrics' => [
                'total_sppd' => $totalSppd,
                'pending_sppd' => $pendingSppd,
                'approved_sppd' => $approvedSppd,
                'completed_sppd' => $completedSppd,
                'rejected_sppd' => $rejectedSppd,
                'total_biaya' => $totalBiaya,
                'biaya_lunas' => $biayaLunas,
                'biaya_pending' => $biayaPending,
                'total_pegawai' => Pegawai::where('status_aktif', true)->count(),
            ],
            'my_stats' => $myStats,
            'bendahara_stats' => $bendaharaStats,
            'antrean_verifikasi' => $antreanVerifikasi,
            'recent_sppds' => $recentSppds,
            'transport_stats' => $transportStats,
            'monthly_trends' => $monthlyTrends,
        ]);
    }
}
