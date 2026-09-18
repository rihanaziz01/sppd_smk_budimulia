<?php

namespace App\Http\Controllers;

use App\Models\Pegawai;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PegawaiController extends Controller
{
    /**
     * Display a listing of employees.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $unitKerja = $request->input('unit_kerja');

        $query = Pegawai::withCount('sppds')->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%")
                    ->orWhere('nuptk', 'like', "%{$search}%")
                    ->orWhere('mata_pelajaran', 'like', "%{$search}%")
                    ->orWhere('jabatan', 'like', "%{$search}%");
            });
        }

        if ($unitKerja) {
            $query->where('unit_kerja', $unitKerja);
        }

        $pegawais = $query->paginate(15)->withQueryString();

        $unitKerjaList = Pegawai::select('unit_kerja')
            ->distinct()
            ->pluck('unit_kerja')
            ->filter()
            ->values();

        return Inertia::render('pegawai/index', [
            'pegawais' => $pegawais,
            'filters' => [
                'search' => $search,
                'unit_kerja' => $unitKerja,
            ],
            'unit_kerja_list' => $unitKerjaList,
        ]);
    }

    /**
     * Store a newly created employee in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        abort_if($request->user()->role === 'bendahara', 403, 'Bendahara tidak memiliki wewenang untuk mengelola data pegawai.');

        $validated = $request->validate([
            'nip' => ['required', 'string', 'max:50', 'unique:pegawais,nip'],
            'nik' => ['nullable', 'string', 'max:50'],
            'nuptk' => ['nullable', 'string', 'max:50'],
            'nama' => ['required', 'string', 'max:255'],
            'jabatan' => ['required', 'string', 'max:255'],
            'mata_pelajaran' => ['nullable', 'string', 'max:255'],
            'unit_kerja' => ['required', 'string', 'max:255'],
            'golongan' => ['required', 'string', 'max:50'],
            'status_guru' => ['nullable', 'string', 'max:100'],
            'nomor_rekening' => ['required', 'string', 'max:50'],
            'nama_bank' => ['required', 'string', 'max:50'],
            'telepon' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'status_aktif' => ['boolean'],
            'is_pejabat_penandatangan' => ['boolean'],
            'create_user_account' => ['boolean'],
        ]);

        $pegawai = Pegawai::create([
            'nip' => $validated['nip'],
            'nik' => $validated['nik'] ?? null,
            'nuptk' => $validated['nuptk'] ?? null,
            'nama' => $validated['nama'],
            'jabatan' => $validated['jabatan'],
            'mata_pelajaran' => $validated['mata_pelajaran'] ?? null,
            'unit_kerja' => $validated['unit_kerja'],
            'golongan' => $validated['golongan'],
            'status_guru' => $validated['status_guru'] ?? 'Guru Tetap Yayasan (GTY)',
            'nomor_rekening' => $validated['nomor_rekening'],
            'nama_bank' => $validated['nama_bank'],
            'telepon' => $validated['telepon'] ?? null,
            'email' => $validated['email'] ?? null,
            'status_aktif' => $validated['status_aktif'] ?? true,
            'is_pejabat_penandatangan' => $validated['is_pejabat_penandatangan'] ?? false,
        ]);

        if (! empty($validated['create_user_account']) && ! empty($validated['email'])) {
            $user = User::create([
                'name' => $pegawai->nama,
                'email' => $pegawai->email,
                'password' => Hash::make('password'),
                'role' => $pegawai->is_pejabat_penandatangan ? 'atasan' : 'pegawai',
                'nip' => $pegawai->nip,
                'phone' => $pegawai->telepon,
                'pegawai_id' => $pegawai->id,
                'email_verified_at' => now(),
            ]);

            $pegawai->update(['user_id' => $user->id]);
        }

        return redirect()->back()->with('success', 'Data guru/pegawai berhasil ditambahkan.');
    }

    /**
     * Update the specified employee in storage.
     */
    public function update(Request $request, Pegawai $pegawai): RedirectResponse
    {
        abort_if($request->user()->role === 'bendahara', 403, 'Bendahara tidak memiliki wewenang untuk mengelola data pegawai.');

        $validated = $request->validate([
            'nip' => ['required', 'string', 'max:50', Rule::unique('pegawais', 'nip')->ignore($pegawai->id)],
            'nik' => ['nullable', 'string', 'max:50'],
            'nuptk' => ['nullable', 'string', 'max:50'],
            'nama' => ['required', 'string', 'max:255'],
            'jabatan' => ['required', 'string', 'max:255'],
            'mata_pelajaran' => ['nullable', 'string', 'max:255'],
            'unit_kerja' => ['required', 'string', 'max:255'],
            'golongan' => ['required', 'string', 'max:50'],
            'status_guru' => ['nullable', 'string', 'max:100'],
            'nomor_rekening' => ['required', 'string', 'max:50'],
            'nama_bank' => ['required', 'string', 'max:50'],
            'telepon' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'status_aktif' => ['boolean'],
            'is_pejabat_penandatangan' => ['boolean'],
        ]);

        $pegawai->update($validated);

        if ($pegawai->user) {
            $pegawai->user->update([
                'name' => $pegawai->nama,
                'nip' => $pegawai->nip,
                'phone' => $pegawai->telepon,
            ]);
        }

        return redirect()->back()->with('success', 'Data guru/pegawai berhasil diperbarui.');
    }

    /**
     * Remove the specified employee from storage.
     */
    public function destroy(Request $request, Pegawai $pegawai): RedirectResponse
    {
        abort_if($request->user()->role === 'bendahara', 403, 'Bendahara tidak memiliki wewenang untuk mengelola data pegawai.');

        if ($pegawai->sppds()->count() > 0) {
            $pegawai->update(['status_aktif' => false]);

            return redirect()->back()->with('success', 'Pegawai telah memiliki riwayat perjalanan dinas, status diubah menjadi Non-Aktif.');
        }

        $pegawai->delete();

        return redirect()->back()->with('success', 'Data pegawai berhasil dihapus.');
    }
}
