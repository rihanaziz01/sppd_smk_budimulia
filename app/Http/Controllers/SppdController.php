<?php

namespace App\Http\Controllers;

use App\Models\Pegawai;
use App\Models\Sppd;
use App\Models\SppdApproval;
use App\Models\SppdBiaya;
use App\Models\SppdDokumen;
use App\Models\SppdPengikut;
use App\Notifications\SppdStatusUpdatedNotification;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SppdController extends Controller
{
    /**
     * Display a listing of SPPD travel orders.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $status = $request->input('status');
        $search = $request->input('search');
        $filterRole = $request->input('my_only');

        $query = Sppd::with(['pegawai', 'biaya', 'pejabatPemberiPerintah', 'createdByUser'])->latest();

        if ($status && in_array($status, ['diajukan', 'disetujui', 'selesai', 'ditolak'])) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_sp', 'like', "%{$search}%")
                    ->orWhere('nomor_sppd', 'like', "%{$search}%")
                    ->orWhere('tempat_tujuan', 'like', "%{$search}%")
                    ->orWhere('maksud_tujuan', 'like', "%{$search}%")
                    ->orWhereHas('pegawai', function ($sub) use ($search) {
                        $sub->where('nama', 'like', "%{$search}%")
                            ->orWhere('nip', 'like', "%{$search}%");
                    });
            });
        }

        // If user is regular pegawai or selected my_only
        if (($user && $user->isPegawai()) || $filterRole) {
            if ($user && $user->pegawai_id) {
                $query->where('pegawai_id', $user->pegawai_id);
            }
        }

        $sppds = $query->paginate(12)->withQueryString();

        // Counts for tabs (scoped to teacher if user is pegawai)
        $countsQuery = Sppd::query();
        if (($user && $user->isPegawai()) || $filterRole) {
            if ($user && $user->pegawai_id) {
                $countsQuery->where('pegawai_id', $user->pegawai_id);
            }
        }

        $counts = [
            'semua' => (clone $countsQuery)->count(),
            'diajukan' => (clone $countsQuery)->where('status', 'diajukan')->count(),
            'disetujui' => (clone $countsQuery)->where('status', 'disetujui')->count(),
            'selesai' => (clone $countsQuery)->where('status', 'selesai')->count(),
            'ditolak' => (clone $countsQuery)->where('status', 'ditolak')->count(),
        ];

        return Inertia::render('sppd/index', [
            'sppds' => $sppds,
            'counts' => $counts,
            'filters' => [
                'status' => $status ?? 'semua',
                'search' => $search,
                'my_only' => (bool) $filterRole,
            ],
        ]);
    }

    /**
     * Show the form for creating a new SPPD.
     */
    public function create(Request $request): Response
    {
        $pegawais = Pegawai::where('status_aktif', true)->orderBy('nama')->get();
        $pejabats = Pegawai::where('status_aktif', true)
            ->where('is_pejabat_penandatangan', true)
            ->orderBy('nama')
            ->get();

        // If no specifically flagged pejabat, provide all active pegawais
        if ($pejabats->isEmpty()) {
            $pejabats = $pegawais;
        }

        $currentYear = date('Y');
        $romanMonth = $this->getRomanMonth((int) date('n'));
        $countThisYear = Sppd::whereYear('created_at', $currentYear)->count() + 1;
        $orderNumber = str_pad((string) $countThisYear, 3, '0', STR_PAD_LEFT);

        $defaultNomorSp = "090/{$orderNumber}/ST-GURU/SMK-BM/{$romanMonth}/{$currentYear}";
        $defaultNomorSppd = "090/{$orderNumber}/SPPD-GURU/SMK-BM/{$romanMonth}/{$currentYear}";

        return Inertia::render('sppd/create', [
            'pegawais' => $pegawais,
            'pejabats' => $pejabats,
            'default_nomor_sp' => $defaultNomorSp,
            'default_nomor_sppd' => $defaultNomorSppd,
        ]);
    }

    /**
     * Store a newly created SPPD.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nomor_sp' => ['required', 'string', 'unique:sppds,nomor_sp'],
            'nomor_sppd' => ['required', 'string', 'unique:sppds,nomor_sppd'],
            'pegawai_id' => ['required', 'exists:pegawais,id'],
            'pejabat_pemberi_perintah_id' => ['nullable', 'exists:pegawais,id'],
            'maksud_tujuan' => ['required', 'string'],
            'tempat_berangkat' => ['required', 'string', 'max:100'],
            'tempat_tujuan' => ['required', 'string', 'max:255'],
            'tingkat_biaya' => ['required', 'string', 'max:50'],
            'alat_angkut' => ['required', 'string', 'max:100'],
            'tanggal_berangkat' => ['required', 'date'],
            'tanggal_kembali' => ['required', 'date', 'after_or_equal:tanggal_berangkat'],
            'instansi_pembebanan' => ['nullable', 'string', 'max:255'],
            'mata_anggaran' => ['nullable', 'string', 'max:100'],
            'keterangan' => ['nullable', 'string'],
            'pengikut_ids' => ['nullable', 'array'],
            'pengikut_ids.*' => ['exists:pegawais,id'],
            'lampiran_surat' => ['nullable', 'file', 'max:10240'], // max 10MB
            // Biaya components
            'uang_harian_per_hari' => ['nullable', 'numeric', 'min:0'],
            'biaya_transportasi' => ['nullable', 'numeric', 'min:0'],
            'biaya_penginapan_malam' => ['nullable', 'integer', 'min:0'],
            'biaya_penginapan_per_malam' => ['nullable', 'numeric', 'min:0'],
            'biaya_lainnya' => ['nullable', 'numeric', 'min:0'],
            'keterangan_biaya_lainnya' => ['nullable', 'string', 'max:255'],
        ]);

        $startDate = Carbon::parse($validated['tanggal_berangkat'])->startOfDay();
        $endDate = Carbon::parse($validated['tanggal_kembali'])->startOfDay();
        $lamaHari = max(1, (int) abs($startDate->diffInDays($endDate)) + 1);

        $createdSppd = DB::transaction(function () use ($validated, $lamaHari, $request) {
            $sppd = Sppd::create([
                'nomor_sp' => $validated['nomor_sp'],
                'nomor_sppd' => $validated['nomor_sppd'],
                'pegawai_id' => $validated['pegawai_id'],
                'pejabat_pemberi_perintah_id' => $validated['pejabat_pemberi_perintah_id'] ?? null,
                'created_by_user_id' => $request->user()->id,
                'maksud_tujuan' => $validated['maksud_tujuan'],
                'tempat_berangkat' => $validated['tempat_berangkat'],
                'tempat_tujuan' => $validated['tempat_tujuan'],
                'tingkat_biaya' => $validated['tingkat_biaya'],
                'alat_angkut' => $validated['alat_angkut'],
                'tanggal_berangkat' => $validated['tanggal_berangkat'],
                'tanggal_kembali' => $validated['tanggal_kembali'],
                'lama_hari' => $lamaHari,
                'instansi_pembebanan' => $validated['instansi_pembebanan'] ?? 'SMK Budi Mulia',
                'mata_anggaran' => $validated['mata_anggaran'] ?? 'BOS/BOP-2026',
                'status' => 'diajukan',
                'keterangan' => $validated['keterangan'] ?? null,
            ]);

            // Pengikut
            if (! empty($validated['pengikut_ids'])) {
                foreach ($validated['pengikut_ids'] as $pengikutId) {
                    if ($pengikutId != $sppd->pegawai_id) {
                        SppdPengikut::create([
                            'sppd_id' => $sppd->id,
                            'pegawai_id' => $pengikutId,
                            'keterangan' => 'Pendamping Perjalanan Dinas',
                        ]);
                    }
                }
            }

            // Biaya
            $uangHarianPerHari = (float) ($validated['uang_harian_per_hari'] ?? 430000);
            $uangHarianTotal = $uangHarianPerHari * $lamaHari;
            $transportasi = (float) ($validated['biaya_transportasi'] ?? 0);
            $hotelMalam = (int) ($validated['biaya_penginapan_malam'] ?? max(0, $lamaHari - 1));
            $hotelPerMalam = (float) ($validated['biaya_penginapan_per_malam'] ?? 0);
            $hotelTotal = $hotelMalam * $hotelPerMalam;
            $lainnya = (float) ($validated['biaya_lainnya'] ?? 0);
            $totalBiaya = $uangHarianTotal + $transportasi + $hotelTotal + $lainnya;

            SppdBiaya::create([
                'sppd_id' => $sppd->id,
                'uang_harian_hari' => $lamaHari,
                'uang_harian_per_hari' => $uangHarianPerHari,
                'uang_harian_total' => $uangHarianTotal,
                'biaya_transportasi' => $transportasi,
                'biaya_penginapan_malam' => $hotelMalam,
                'biaya_penginapan_per_malam' => $hotelPerMalam,
                'biaya_penginapan_total' => $hotelTotal,
                'biaya_lainnya' => $lainnya,
                'keterangan_biaya_lainnya' => $validated['keterangan_biaya_lainnya'] ?? null,
                'total_biaya' => $totalBiaya,
                'status_pembayaran' => 'belum_dibayar',
            ]);

            // Lampiran surat undangan / surat tugas jika ada
            if ($request->hasFile('lampiran_surat')) {
                $file = $request->file('lampiran_surat');
                $filePath = $file->store('sppd-dokumen', 'public');
                SppdDokumen::create([
                    'sppd_id' => $sppd->id,
                    'uploaded_by_user_id' => $request->user()->id,
                    'jenis_dokumen' => 'surat_undangan_tugas',
                    'nama_dokumen' => $file->getClientOriginalName() ?: 'Lampiran_Surat_Tugas.pdf',
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'catatan' => 'Lampiran surat tugas / undangan saat pengajuan SPPD',
                ]);
            }

            // Initial Approval log
            SppdApproval::create([
                'sppd_id' => $sppd->id,
                'user_id' => $request->user()->id,
                'role' => $request->user()->role,
                'action' => 'diajukan',
                'catatan' => 'Pengajuan SPPD berhasil dibuat dan menunggu persetujuan atasan.',
            ]);

            return $sppd;
        });

        // Notifikasi konfirmasi pengajuan diterima
        $request->user()->notify(new SppdStatusUpdatedNotification(
            sppdId: $createdSppd->id,
            nomorSp: $createdSppd->nomor_sp,
            judul: 'Pengajuan SPPD Berhasil Diajukan',
            pesan: "Pengajuan perjalanan dinas ke {$createdSppd->tempat_tujuan} telah didaftarkan dan menunggu persetujuan Kepala Sekolah.",
            status: 'diajukan',
            actionUrl: "/sppd/{$createdSppd->id}",
        ));

        return redirect()->route('sppd.index')->with('success', 'Pengajuan SPPD berhasil dibuat dan menunggu persetujuan.');
    }

    /**
     * Display the specified SPPD details.
     */
    public function show(Sppd $sppd): Response
    {
        $sppd->load([
            'pegawai',
            'pejabatPemberiPerintah',
            'createdByUser',
            'pengikuts.pegawai',
            'biaya',
            'approvals.user',
            'dokumens.uploadedByUser',
            'laporan',
        ]);

        return Inertia::render('sppd/show', [
            'sppd' => $sppd,
        ]);
    }

    /**
     * Show the form for editing the specified SPPD.
     */
    public function edit(Sppd $sppd): Response
    {
        $sppd->load(['pengikuts', 'biaya']);

        $pegawais = Pegawai::where('status_aktif', true)->orderBy('nama')->get();
        $pejabats = Pegawai::where('status_aktif', true)
            ->where('is_pejabat_penandatangan', true)
            ->orderBy('nama')
            ->get();

        if ($pejabats->isEmpty()) {
            $pejabats = $pegawais;
        }

        return Inertia::render('sppd/edit', [
            'sppd' => $sppd,
            'pegawais' => $pegawais,
            'pejabats' => $pejabats,
            'selected_pengikut_ids' => $sppd->pengikuts->pluck('pegawai_id')->toArray(),
        ]);
    }

    /**
     * Update the specified SPPD in storage.
     */
    public function update(Request $request, Sppd $sppd): RedirectResponse
    {
        $validated = $request->validate([
            'nomor_sp' => ['required', 'string', 'max:100', 'unique:sppds,nomor_sp,'.$sppd->id],
            'nomor_sppd' => ['required', 'string', 'max:100', 'unique:sppds,nomor_sppd,'.$sppd->id],
            'pegawai_id' => ['required', 'exists:pegawais,id'],
            'pejabat_pemberi_perintah_id' => ['nullable', 'exists:pegawais,id'],
            'maksud_tujuan' => ['required', 'string'],
            'tempat_berangkat' => ['required', 'string', 'max:100'],
            'tempat_tujuan' => ['required', 'string', 'max:255'],
            'tingkat_biaya' => ['required', 'string', 'max:50'],
            'alat_angkut' => ['required', 'string', 'max:100'],
            'tanggal_berangkat' => ['required', 'date'],
            'tanggal_kembali' => ['required', 'date', 'after_or_equal:tanggal_berangkat'],
            'instansi_pembebanan' => ['nullable', 'string', 'max:255'],
            'mata_anggaran' => ['nullable', 'string', 'max:100'],
            'keterangan' => ['nullable', 'string'],
            'pengikut_ids' => ['nullable', 'array'],
            'pengikut_ids.*' => ['exists:pegawais,id'],
            'uang_harian_per_hari' => ['nullable', 'numeric', 'min:0'],
            'biaya_transportasi' => ['nullable', 'numeric', 'min:0'],
            'biaya_penginapan_malam' => ['nullable', 'integer', 'min:0'],
            'biaya_penginapan_per_malam' => ['nullable', 'numeric', 'min:0'],
            'biaya_lainnya' => ['nullable', 'numeric', 'min:0'],
            'keterangan_biaya_lainnya' => ['nullable', 'string', 'max:255'],
        ]);

        $startDate = Carbon::parse($validated['tanggal_berangkat'])->startOfDay();
        $endDate = Carbon::parse($validated['tanggal_kembali'])->startOfDay();
        $lamaHari = max(1, (int) abs($startDate->diffInDays($endDate)) + 1);

        DB::transaction(function () use ($validated, $lamaHari, $request, $sppd) {
            $newStatus = $sppd->status === 'ditolak' ? 'diajukan' : $sppd->status;

            $sppd->update([
                'nomor_sp' => $validated['nomor_sp'],
                'nomor_sppd' => $validated['nomor_sppd'],
                'pegawai_id' => $validated['pegawai_id'],
                'pejabat_pemberi_perintah_id' => $validated['pejabat_pemberi_perintah_id'] ?? null,
                'maksud_tujuan' => $validated['maksud_tujuan'],
                'tempat_berangkat' => $validated['tempat_berangkat'],
                'tempat_tujuan' => $validated['tempat_tujuan'],
                'tingkat_biaya' => $validated['tingkat_biaya'],
                'alat_angkut' => $validated['alat_angkut'],
                'tanggal_berangkat' => $validated['tanggal_berangkat'],
                'tanggal_kembali' => $validated['tanggal_kembali'],
                'lama_hari' => $lamaHari,
                'instansi_pembebanan' => $validated['instansi_pembebanan'] ?? $sppd->instansi_pembebanan,
                'mata_anggaran' => $validated['mata_anggaran'] ?? $sppd->mata_anggaran,
                'status' => $newStatus,
                'keterangan' => $validated['keterangan'] ?? $sppd->keterangan,
            ]);

            // Sync pengikut
            $sppd->pengikuts()->delete();
            if (! empty($validated['pengikut_ids'])) {
                foreach ($validated['pengikut_ids'] as $pengikutId) {
                    if ($pengikutId != $sppd->pegawai_id) {
                        SppdPengikut::create([
                            'sppd_id' => $sppd->id,
                            'pegawai_id' => $pengikutId,
                            'keterangan' => 'Pendamping Perjalanan Dinas',
                        ]);
                    }
                }
            }

            // Sync biaya
            $uangHarianPerHari = (float) ($validated['uang_harian_per_hari'] ?? 430000);
            $uangHarianTotal = $uangHarianPerHari * $lamaHari;
            $transportasi = (float) ($validated['biaya_transportasi'] ?? 0);
            $hotelMalam = (int) ($validated['biaya_penginapan_malam'] ?? max(0, $lamaHari - 1));
            $hotelPerMalam = (float) ($validated['biaya_penginapan_per_malam'] ?? 0);
            $hotelTotal = $hotelMalam * $hotelPerMalam;
            $lainnya = (float) ($validated['biaya_lainnya'] ?? 0);
            $totalBiaya = $uangHarianTotal + $transportasi + $hotelTotal + $lainnya;

            if ($sppd->biaya) {
                $sppd->biaya->update([
                    'uang_harian_hari' => $lamaHari,
                    'uang_harian_per_hari' => $uangHarianPerHari,
                    'uang_harian_total' => $uangHarianTotal,
                    'biaya_transportasi' => $transportasi,
                    'biaya_penginapan_malam' => $hotelMalam,
                    'biaya_penginapan_per_malam' => $hotelPerMalam,
                    'biaya_penginapan_total' => $hotelTotal,
                    'biaya_lainnya' => $lainnya,
                    'keterangan_biaya_lainnya' => $validated['keterangan_biaya_lainnya'] ?? null,
                    'total_biaya' => $totalBiaya,
                ]);
            }

            // Add approval log if resubmitted
            if ($newStatus === 'diajukan' && $sppd->wasChanged('status')) {
                SppdApproval::create([
                    'sppd_id' => $sppd->id,
                    'user_id' => $request->user()->id,
                    'role' => $request->user()->role,
                    'action' => 'diajukan',
                    'catatan' => 'Pengajuan SPPD telah diperbaiki/direvisi dan diajukan ulang.',
                ]);
            }
        });

        return redirect()->route('sppd.show', $sppd->id)->with('success', 'Data SPPD berhasil diperbarui.');
    }

    /**
     * Remove the specified SPPD.
     */
    public function destroy(Sppd $sppd): RedirectResponse
    {
        $sppd->delete();

        return redirect()->route('sppd.index')->with('success', 'Pengajuan SPPD berhasil dihapus.');
    }

    private function getRomanMonth(int $month): string
    {
        $romans = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII',
        ];

        return $romans[$month] ?? 'I';
    }
}
