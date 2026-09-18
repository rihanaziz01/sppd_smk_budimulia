<?php

namespace App\Http\Controllers;

use App\Models\SppdBiaya;
use App\Models\StandarBiaya;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BendaharaDataBiayaController extends Controller
{
    /**
     * Display standard allowance rates and SPPD expense adjustments.
     */
    public function index(Request $request): Response
    {
        $kategori = $request->input('kategori', 'semua');
        $search = $request->input('search');

        $query = StandarBiaya::query()->latest();

        if ($kategori !== 'semua') {
            $query->where('kategori', $kategori);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('wilayah', 'like', "%{$search}%")
                    ->orWhere('tingkat_golongan', 'like', "%{$search}%")
                    ->orWhere('keterangan', 'like', "%{$search}%");
            });
        }

        $standarBiayas = $query->get();

        // Recent SPPD expenses that can be adjusted
        $sppdBiayas = SppdBiaya::with(['sppd.pegawai', 'anggaran'])
            ->whereHas('sppd', fn ($q) => $q->whereIn('status', ['disetujui', 'selesai']))
            ->latest()
            ->take(15)
            ->get();

        return Inertia::render('bendahara/data-biaya', [
            'standar_biayas' => $standarBiayas,
            'sppd_biayas' => $sppdBiayas,
            'filters' => [
                'kategori' => $kategori,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store new standard cost rate based on school policy.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kategori' => ['required', 'string', 'in:Uang Harian,Transportasi,Penginapan,Biaya Lainnya'],
            'tingkat_golongan' => ['required', 'string', 'max:100'],
            'wilayah' => ['required', 'string', 'max:100'],
            'nominal_standar' => ['required', 'numeric', 'min:0'],
            'satuan' => ['required', 'string', 'max:50'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'status_aktif' => ['required', 'boolean'],
        ]);

        StandarBiaya::create($validated);

        return redirect()->back()->with('success', 'Standar tarif biaya kebijakan sekolah berhasil ditambahkan.');
    }

    /**
     * Update standard cost rate.
     */
    public function update(Request $request, StandarBiaya $standarBiaya): RedirectResponse
    {
        $validated = $request->validate([
            'kategori' => ['required', 'string', 'in:Uang Harian,Transportasi,Penginapan,Biaya Lainnya'],
            'tingkat_golongan' => ['required', 'string', 'max:100'],
            'wilayah' => ['required', 'string', 'max:100'],
            'nominal_standar' => ['required', 'numeric', 'min:0'],
            'satuan' => ['required', 'string', 'max:50'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'status_aktif' => ['required', 'boolean'],
        ]);

        $standarBiaya->update($validated);

        return redirect()->back()->with('success', 'Standar biaya berhasil diperbarui.');
    }

    /**
     * Delete standard cost rate.
     */
    public function destroy(StandarBiaya $standarBiaya): RedirectResponse
    {
        $standarBiaya->delete();

        return redirect()->back()->with('success', 'Standar tarif biaya berhasil dihapus.');
    }

    /**
     * Adjust nominal costs of a specific SPPD according to school policy.
     */
    public function adjustSppdBiaya(Request $request, SppdBiaya $biaya): RedirectResponse
    {
        $validated = $request->validate([
            'uang_harian_per_hari' => ['required', 'numeric', 'min:0'],
            'biaya_transportasi' => ['required', 'numeric', 'min:0'],
            'biaya_penginapan_per_malam' => ['required', 'numeric', 'min:0'],
            'biaya_lainnya' => ['nullable', 'numeric', 'min:0'],
            'keterangan_biaya_lainnya' => ['nullable', 'string', 'max:255'],
            'catatan_bendahara' => ['nullable', 'string', 'max:500'],
        ]);

        $uangHarianTotal = $biaya->uang_harian_hari * $validated['uang_harian_per_hari'];
        $hotelTotal = $biaya->biaya_penginapan_malam * $validated['biaya_penginapan_per_malam'];
        $lainnya = (float) ($validated['biaya_lainnya'] ?? 0);
        $totalBiaya = $uangHarianTotal + $validated['biaya_transportasi'] + $hotelTotal + $lainnya;

        $biaya->update([
            'uang_harian_per_hari' => $validated['uang_harian_per_hari'],
            'uang_harian_total' => $uangHarianTotal,
            'biaya_transportasi' => $validated['biaya_transportasi'],
            'biaya_penginapan_per_malam' => $validated['biaya_penginapan_per_malam'],
            'biaya_penginapan_total' => $hotelTotal,
            'biaya_lainnya' => $lainnya,
            'keterangan_biaya_lainnya' => $validated['keterangan_biaya_lainnya'] ?? null,
            'total_biaya' => $totalBiaya,
            'catatan_bendahara' => $validated['catatan_bendahara'] ?? $biaya->catatan_bendahara,
        ]);

        return redirect()->back()->with('success', 'Komponen biaya SPPD berhasil disesuaikan dengan kebijakan sekolah.');
    }
}
