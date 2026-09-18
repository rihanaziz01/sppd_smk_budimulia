<?php

namespace App\Http\Controllers;

use App\Models\SppdAnggaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BendaharaAnggaranController extends Controller
{
    /**
     * Display budget allocations, absorption metrics, and transactions.
     */
    public function index(Request $request): Response
    {
        $tahun = $request->input('tahun', date('Y'));

        $anggarans = SppdAnggaran::with(['biayas.sppd.pegawai'])
            ->where('tahun_anggaran', $tahun)
            ->latest()
            ->get()
            ->map(function ($anggaran) {
                return [
                    'id' => $anggaran->id,
                    'tahun_anggaran' => $anggaran->tahun_anggaran,
                    'nama_anggaran' => $anggaran->nama_anggaran,
                    'kode_rekening' => $anggaran->kode_rekening,
                    'total_anggaran' => $anggaran->total_anggaran,
                    'periode' => $anggaran->periode,
                    'keterangan' => $anggaran->keterangan,
                    'status' => $anggaran->status,
                    'terpakai' => $anggaran->terpakai,
                    'sisa_anggaran' => $anggaran->sisa_anggaran,
                    'persentase_serapan' => $anggaran->persentase_serapan,
                    'transaksi_count' => $anggaran->biayas->count(),
                ];
            });

        $totalPagu = $anggarans->sum('total_anggaran');
        $totalTerpakai = $anggarans->sum('terpakai');
        $totalSisa = max(0, $totalPagu - $totalTerpakai);
        $serapanGlobal = $totalPagu > 0 ? round(($totalTerpakai / $totalPagu) * 100, 1) : 0;

        return Inertia::render('bendahara/anggaran', [
            'anggarans' => $anggarans,
            'summary' => [
                'total_pagu' => $totalPagu,
                'total_terpakai' => $totalTerpakai,
                'total_sisa' => $totalSisa,
                'serapan_persen' => $serapanGlobal,
                'tahun' => (int) $tahun,
            ],
        ]);
    }

    /**
     * Store a newly created budget allocation.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tahun_anggaran' => ['required', 'integer', 'min:2020', 'max:2035'],
            'nama_anggaran' => ['required', 'string', 'max:255'],
            'kode_rekening' => ['nullable', 'string', 'max:100'],
            'total_anggaran' => ['required', 'numeric', 'min:0'],
            'periode' => ['required', 'string', 'max:100'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'string', 'in:aktif,nonaktif'],
        ]);

        SppdAnggaran::create($validated);

        return redirect()->back()->with('success', 'Alokasi anggaran perjalanan dinas berhasil ditambahkan.');
    }

    /**
     * Update the specified budget allocation.
     */
    public function update(Request $request, SppdAnggaran $anggaran): RedirectResponse
    {
        $validated = $request->validate([
            'tahun_anggaran' => ['required', 'integer', 'min:2020', 'max:2035'],
            'nama_anggaran' => ['required', 'string', 'max:255'],
            'kode_rekening' => ['nullable', 'string', 'max:100'],
            'total_anggaran' => ['required', 'numeric', 'min:0'],
            'periode' => ['required', 'string', 'max:100'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'string', 'in:aktif,nonaktif'],
        ]);

        $anggaran->update($validated);

        return redirect()->back()->with('success', 'Data alokasi anggaran berhasil diperbarui.');
    }

    /**
     * Remove the specified budget allocation.
     */
    public function destroy(SppdAnggaran $anggaran): RedirectResponse
    {
        if ($anggaran->biayas()->exists()) {
            return redirect()->back()->with('error', 'Anggaran tidak dapat dihapus karena sudah memiliki transaksi rincian biaya SPPD.');
        }

        $anggaran->delete();

        return redirect()->back()->with('success', 'Pos anggaran berhasil dihapus.');
    }
}
