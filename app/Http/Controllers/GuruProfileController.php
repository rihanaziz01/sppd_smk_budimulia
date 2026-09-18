<?php

namespace App\Http\Controllers;

use App\Models\Pegawai;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuruProfileController extends Controller
{
    /**
     * Display the teacher's profile view.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $pegawai = $user->pegawai;

        // Auto-create or link if teacher does not have a linked pegawai record yet
        if (! $pegawai) {
            $pegawai = Pegawai::where('email', $user->email)
                ->orWhere('user_id', $user->id)
                ->first();

            if (! $pegawai) {
                $pegawai = Pegawai::create([
                    'user_id' => $user->id,
                    'nip' => $user->nip ?: 'NIP-'.date('YmdHis').'-'.rand(10, 99),
                    'nama' => $user->name,
                    'email' => $user->email,
                    'telepon' => $user->phone,
                    'jabatan' => 'Guru Mata Pelajaran',
                    'unit_kerja' => 'Tenaga Pendidik',
                    'golongan' => 'Penata Muda (III/a)',
                    'nomor_rekening' => '-',
                    'nama_bank' => 'Bank BJB',
                    'status_guru' => 'Guru Tetap Yayasan (GTY)',
                    'status_aktif' => true,
                ]);
            }

            $user->update(['pegawai_id' => $pegawai->id]);
        }

        return Inertia::render('guru/profil', [
            'guru' => $pegawai,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Update the teacher's profile data.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $pegawai = $user->pegawai;

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:50'],
            'nik' => ['nullable', 'string', 'max:30'],
            'nuptk' => ['nullable', 'string', 'max:30'],
            'jabatan' => ['required', 'string', 'max:255'],
            'mata_pelajaran' => ['nullable', 'string', 'max:255'],
            'telepon' => ['nullable', 'string', 'max:25'],
            'email' => ['required', 'email', 'max:255'],
            'nomor_rekening' => ['nullable', 'string', 'max:50'],
            'nama_bank' => ['nullable', 'string', 'max:100'],
            'unit_kerja' => ['nullable', 'string', 'max:255'],
            'golongan' => ['nullable', 'string', 'max:50'],
            'status_guru' => ['nullable', 'string', 'max:100'],
        ]);

        if ($pegawai) {
            $pegawai->update($validated);
        } else {
            $pegawai = Pegawai::create(array_merge($validated, [
                'user_id' => $user->id,
                'status_aktif' => true,
            ]));
            $user->update(['pegawai_id' => $pegawai->id]);
        }

        // Sync with users table
        $user->update([
            'name' => $validated['nama'],
            'email' => $validated['email'],
            'phone' => $validated['telepon'],
            'nip' => $validated['nip'],
        ]);

        return redirect()->back()->with('success', 'Data profil guru berhasil diperbarui.');
    }
}
