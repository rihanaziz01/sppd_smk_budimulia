<?php

namespace App\Http\Controllers;

use App\Models\Sppd;
use App\Models\SppdDokumen;
use App\Models\SppdLaporan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuruLaporanController extends Controller
{
    /**
     * Display listing of trips ready for or with completed reports for the teacher.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Sppd::with(['pegawai', 'biaya', 'dokumens', 'laporan', 'pejabatPemberiPerintah'])
            ->latest();

        // Scope to current teacher
        if ($user && $user->isPegawai()) {
            if ($user->pegawai_id) {
                $query->where('pegawai_id', $user->pegawai_id);
            }
        }

        // Show trips that are approved or completed
        $sppds = $query->whereIn('status', ['disetujui', 'selesai', 'ditolak'])
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('guru/laporan', [
            'sppds' => $sppds,
        ]);
    }

    /**
     * Store or update trip report, proof documents, and realisasi biaya.
     */
    public function store(Request $request, Sppd $sppd): RedirectResponse
    {
        $validated = $request->validate([
            'ringkasan_kegiatan' => ['required', 'string'],
            'hasil_kegiatan' => ['required', 'string'],
            'kendala' => ['nullable', 'string'],
            'saran_tindak_lanjut' => ['nullable', 'string'],
            'tanggal_laporan' => ['required', 'date'],
            // Realisasi biaya (opsional)
            'realisasi_transportasi' => ['nullable', 'numeric', 'min:0'],
            'realisasi_penginapan' => ['nullable', 'numeric', 'min:0'],
            'realisasi_lainnya' => ['nullable', 'numeric', 'min:0'],
            'keterangan_biaya_lainnya' => ['nullable', 'string', 'max:255'],
            // Bukti file
            'bukti_file' => ['nullable', 'file', 'max:10240'], // 10MB
            'jenis_bukti' => ['nullable', 'string', 'in:tiket,boarding_pass,nota_hotel,foto_kegiatan,laporan_kegiatan,lainnya'],
            'nama_bukti' => ['nullable', 'string', 'max:255'],
        ]);

        // 1. Simpan atau perbarui laporan kegiatan
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

        // 2. Perbarui realisasi biaya jika diisi
        if ($sppd->biaya) {
            $biaya = $sppd->biaya;
            $transport = isset($validated['realisasi_transportasi']) ? (float) $validated['realisasi_transportasi'] : $biaya->biaya_transportasi;
            $hotel = isset($validated['realisasi_penginapan']) ? (float) $validated['realisasi_penginapan'] : $biaya->biaya_penginapan_total;
            $lainnya = isset($validated['realisasi_lainnya']) ? (float) $validated['realisasi_lainnya'] : $biaya->biaya_lainnya;
            $total = (float) $biaya->uang_harian_total + $transport + $hotel + $lainnya;

            $biaya->update([
                'biaya_transportasi' => $transport,
                'biaya_penginapan_total' => $hotel,
                'biaya_lainnya' => $lainnya,
                'keterangan_biaya_lainnya' => $validated['keterangan_biaya_lainnya'] ?? $biaya->keterangan_biaya_lainnya,
                'total_biaya' => $total,
            ]);
        }

        // 3. Simpan file bukti jika diunggah
        if ($request->hasFile('bukti_file')) {
            $file = $request->file('bukti_file');
            $filePath = $file->store('sppd-dokumen', 'public');
            $fileSize = $file->getSize();

            SppdDokumen::create([
                'sppd_id' => $sppd->id,
                'uploaded_by_user_id' => $request->user()->id,
                'jenis_dokumen' => $validated['jenis_bukti'] ?? 'foto_kegiatan',
                'nama_dokumen' => $validated['nama_bukti'] ?? ($file->getClientOriginalName() ?: 'Bukti_Kegiatan.pdf'),
                'file_path' => $filePath,
                'file_size' => $fileSize,
                'catatan' => 'Diupload melalui form laporan guru',
            ]);
        }

        // Set status SPPD menjadi selesai jika sebelumnya disetujui
        if ($sppd->status === 'disetujui') {
            $sppd->update(['status' => 'selesai']);
        }

        return redirect()->back()->with('success', 'Laporan perjalanan dinas dan bukti berhasil diserahkan.');
    }
}
