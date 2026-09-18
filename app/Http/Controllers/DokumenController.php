<?php

namespace App\Http\Controllers;

use App\Models\Sppd;
use App\Models\SppdDokumen;
use App\Models\SppdLaporan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DokumenController extends Controller
{
    /**
     * Display the document center listing SPPDs with document print links.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = $request->input('search');
        $query = Sppd::with(['pegawai', 'biaya', 'pejabatPemberiPerintah', 'dokumens', 'laporan'])->latest();

        // Scope to teacher if role is pegawai
        if ($user && $user->isPegawai() && $user->pegawai_id) {
            $query->where('pegawai_id', $user->pegawai_id);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_sp', 'like', "%{$search}%")
                    ->orWhere('nomor_sppd', 'like', "%{$search}%")
                    ->orWhere('tempat_tujuan', 'like', "%{$search}%")
                    ->orWhereHas('pegawai', function ($sub) use ($search) {
                        $sub->where('nama', 'like', "%{$search}%");
                    });
            });
        }

        $sppds = $query->paginate(12)->withQueryString();

        return Inertia::render('dokumen/index', [
            'sppds' => $sppds,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Upload a travel proof receipt or attachment.
     */
    public function upload(Request $request, Sppd $sppd): RedirectResponse
    {
        $validated = $request->validate([
            'jenis_dokumen' => ['required', 'string', 'in:tiket,boarding_pass,nota_hotel,foto_kegiatan,laporan_kegiatan,lainnya'],
            'nama_dokumen' => ['required', 'string', 'max:255'],
            'file' => ['nullable', 'file', 'max:10240'], // max 10MB
            'catatan' => ['nullable', 'string', 'max:500'],
        ]);

        $filePath = 'dokumen/sample.pdf';
        $fileSize = 0;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filePath = $file->store('sppd-dokumen', 'public');
            $fileSize = $file->getSize();
        }

        SppdDokumen::create([
            'sppd_id' => $sppd->id,
            'uploaded_by_user_id' => $request->user()->id,
            'jenis_dokumen' => $validated['jenis_dokumen'],
            'nama_dokumen' => $validated['nama_dokumen'],
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'catatan' => $validated['catatan'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Bukti perjalanan berhasil diunggah.');
    }

    /**
     * Delete an uploaded travel proof attachment.
     */
    public function destroy(SppdDokumen $dokumen): RedirectResponse
    {
        if (Storage::disk('public')->exists($dokumen->file_path)) {
            Storage::disk('public')->delete($dokumen->file_path);
        }

        $dokumen->delete();

        return redirect()->back()->with('success', 'Dokumen berhasil dihapus.');
    }

    /**
     * Store or update trip report (Laporan Hasil Perjalanan Dinas).
     */
    public function storeLaporan(Request $request, Sppd $sppd): RedirectResponse
    {
        $validated = $request->validate([
            'ringkasan_kegiatan' => ['required', 'string'],
            'hasil_kegiatan' => ['required', 'string'],
            'kendala' => ['nullable', 'string'],
            'saran_tindak_lanjut' => ['nullable', 'string'],
            'tanggal_laporan' => ['required', 'date'],
        ]);

        SppdLaporan::updateOrCreate(
            ['sppd_id' => $sppd->id],
            [
                'ringkasan_kegiatan' => $validated['ringkasan_kegiatan'],
                'hasil_kegiatan' => $validated['hasil_kegiatan'],
                'kendala' => $validated['kendala'] ?? null,
                'saran_tindak_lanjut' => $validated['saran_tindak_lanjut'] ?? null,
                'tanggal_laporan' => $validated['tanggal_laporan'],
                'status' => 'diserahkan',
            ]
        );

        return redirect()->back()->with('success', 'Laporan perjalanan dinas berhasil disimpan.');
    }
}
