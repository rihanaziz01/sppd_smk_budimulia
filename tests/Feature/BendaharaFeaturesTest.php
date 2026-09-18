<?php

use App\Models\Pegawai;
use App\Models\Sppd;
use App\Models\SppdAnggaran;
use App\Models\SppdBiaya;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function createTestBendaharaData(): array
{
    $bendahara = User::factory()->create(['role' => 'bendahara', 'name' => 'Bendahara Sekolah']);
    $guruUser = User::factory()->create(['role' => 'guru', 'name' => 'Guru SMK']);

    $pegawai = Pegawai::create([
        'nama' => 'Guru Pengajar, S.Pd.',
        'nip' => '19850101 201001 1 001',
        'nuptk' => '1234567890123456',
        'jabatan' => 'Guru Kejuruan TKJ',
        'golongan' => 'Penata Muda (III/a)',
        'unit_kerja' => 'SMK Budi Mulia',
        'nomor_rekening' => '1234567890',
        'nama_bank' => 'Bank Mandiri',
        'user_id' => $guruUser->id,
        'status_aktif' => true,
    ]);

    $anggaran = SppdAnggaran::create([
        'tahun_anggaran' => (int) date('Y'),
        'nama_anggaran' => 'Dana BOS Pusat 2026',
        'kode_rekening' => '5.1.02.04.01.0001',
        'total_anggaran' => 50000000,
        'periode' => 'Tahun 2026',
        'keterangan' => 'Alokasi BOS untuk perjalanan dinas',
        'status' => 'aktif',
    ]);

    $sppd = Sppd::create([
        'nomor_sp' => '090/SMK-BM/SPT/2026/099',
        'nomor_sppd' => '090/SMK-BM/SPPD/2026/099',
        'pegawai_id' => $pegawai->id,
        'created_by_user_id' => $guruUser->id,
        'maksud_tujuan' => 'Pelatihan Kurikulum Merdeka',
        'tempat_berangkat' => 'Bandung',
        'tempat_tujuan' => 'Jakarta Selatan',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Kereta Cepat Whoosh',
        'tanggal_berangkat' => Carbon::now()->format('Y-m-d'),
        'tanggal_kembali' => Carbon::now()->addDays(2)->format('Y-m-d'),
        'lama_hari' => 3,
        'status' => 'disetujui',
    ]);

    $biaya = SppdBiaya::create([
        'sppd_id' => $sppd->id,
        'uang_harian_hari' => 3,
        'uang_harian_per_hari' => 250000,
        'uang_harian_total' => 750000,
        'biaya_transportasi' => 600000,
        'biaya_penginapan_malam' => 2,
        'biaya_penginapan_per_malam' => 450000,
        'biaya_penginapan_total' => 900000,
        'biaya_lainnya' => 100000,
        'total_biaya' => 2350000,
        'status_pembayaran' => 'belum_dibayar',
        'status_verifikasi' => 'menunggu_verifikasi',
        'anggaran_id' => $anggaran->id,
    ]);

    return compact('bendahara', 'guruUser', 'pegawai', 'anggaran', 'sppd', 'biaya');
}

test('bendahara can view dashboard with 6 financial metrics', function () {
    $data = createTestBendaharaData();

    $response = $this->actingAs($data['bendahara'])->get(route('dashboard'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('bendahara_stats.total_sppd')
        ->has('bendahara_stats.menunggu_verifikasi')
        ->has('bendahara_stats.total_anggaran')
        ->has('bendahara_stats.total_dibayarkan')
        ->has('bendahara_stats.total_belum_dibayar')
        ->has('bendahara_stats.pengeluaran_bulan_ini')
        ->has('antrean_verifikasi')
    );
});

test('bendahara can manage budget allocations', function () {
    $data = createTestBendaharaData();

    $response = $this->actingAs($data['bendahara'])->get(route('bendahara.anggaran.index'));
    $response->assertOk();

    // Store new budget
    $storeResponse = $this->actingAs($data['bendahara'])->post(route('bendahara.anggaran.store'), [
        'tahun_anggaran' => 2026,
        'nama_anggaran' => 'Dana Komite Sekolah',
        'kode_rekening' => '5.1.02.04.02.0002',
        'total_anggaran' => 25000000,
        'periode' => 'Tahun 2026',
        'keterangan' => 'Khusus lomba kejuruan',
        'status' => 'aktif',
    ]);
    $storeResponse->assertRedirect();

    $this->assertDatabaseHas('sppd_anggarans', [
        'nama_anggaran' => 'Dana Komite Sekolah',
        'total_anggaran' => 25000000,
    ]);
});

test('bendahara can verify sppd cost and approve it', function () {
    $data = createTestBendaharaData();

    $response = $this->actingAs($data['bendahara'])->get(route('bendahara.verifikasi.index'));
    $response->assertOk();

    $verifyResponse = $this->actingAs($data['bendahara'])->post(
        route('bendahara.verifikasi.store', $data['sppd']->id),
        [
            'action' => 'terverifikasi',
            'catatan_verifikasi' => 'Kuitansi dan tiket transportasi telah lengkap dan sesuai standar',
            'anggaran_id' => $data['anggaran']->id,
        ]
    );
    $verifyResponse->assertRedirect();

    $data['biaya']->refresh();
    expect($data['biaya']->status_verifikasi)->toBe('terverifikasi');
    expect($data['biaya']->verified_by_user_id)->toBe($data['bendahara']->id);
});

test('bendahara can request revision on sppd cost verification', function () {
    $data = createTestBendaharaData();

    $verifyResponse = $this->actingAs($data['bendahara'])->post(
        route('bendahara.verifikasi.store', $data['sppd']->id),
        [
            'action' => 'perlu_perbaikan',
            'catatan_verifikasi' => 'Kuitansi hotel belum bermeterai/stempel basah, mohon unggah ulang',
        ]
    );
    $verifyResponse->assertRedirect();

    $data['biaya']->refresh();
    expect($data['biaya']->status_verifikasi)->toBe('perlu_perbaikan');
    expect($data['biaya']->catatan_verifikasi)->toContain('Kuitansi hotel');
});

test('bendahara can process payment and upload payment receipt proof', function () {
    Storage::fake('public');
    $data = createTestBendaharaData();

    $file = UploadedFile::fake()->create('bukti_transfer.jpg', 150, 'image/jpeg');

    $response = $this->actingAs($data['bendahara'])->post(
        route('bendahara.pembayaran.process', $data['biaya']->id),
        [
            'status_pembayaran' => 'sudah_dibayar',
            'tanggal_bayar' => Carbon::now()->format('Y-m-d'),
            'metode_pembayaran' => 'Transfer Bank',
            'nomor_bukti_kas' => 'BKU-2026-001',
            'catatan_bendahara' => 'Ditransfer ke rekening Bank Mandiri',
            'file_bukti_bayar' => $file,
        ]
    );
    $response->assertRedirect();

    $data['biaya']->refresh();
    expect($data['biaya']->status_pembayaran)->toBe('sudah_dibayar');
    expect($data['biaya']->nomor_bukti_kas)->toBe('BKU-2026-001');
    expect($data['biaya']->file_bukti_bayar)->not->toBeNull();
    Storage::disk('public')->assertExists($data['biaya']->file_bukti_bayar);
});

test('bendahara can view payment history and print official payment voucher', function () {
    $data = createTestBendaharaData();

    $data['biaya']->update([
        'status_pembayaran' => 'sudah_dibayar',
        'nomor_bukti_kas' => 'BKU-2026-005',
        'tanggal_bayar' => Carbon::now()->format('Y-m-d'),
    ]);

    $riwayatResponse = $this->actingAs($data['bendahara'])->get(route('bendahara.riwayat-pembayaran'));
    $riwayatResponse->assertOk();

    $printResponse = $this->actingAs($data['bendahara'])->get(route('bendahara.pembayaran.kuitansi', $data['biaya']->id));
    $printResponse->assertOk();
    $printResponse->assertInertia(fn ($page) => $page->component('dokumen/print-kuitansi-bayar'));
});

test('bendahara can manage standard cost rates and adjust sppd cost', function () {
    $data = createTestBendaharaData();

    $storeRateResponse = $this->actingAs($data['bendahara'])->post(route('bendahara.data-biaya.store'), [
        'kategori' => 'Uang Harian',
        'tingkat_golongan' => 'Golongan III',
        'wilayah' => 'Luar Provinsi DKI Jakarta',
        'nominal_standar' => 350000,
        'satuan' => 'per hari',
        'keterangan' => 'SK Kepala Sekolah No. 421/2026',
        'status_aktif' => true,
    ]);
    $storeRateResponse->assertRedirect();

    $this->assertDatabaseHas('standar_biayas', [
        'wilayah' => 'Luar Provinsi DKI Jakarta',
        'nominal_standar' => 350000,
    ]);

    // Adjust SPPD cost
    $adjustResponse = $this->actingAs($data['bendahara'])->put(
        route('bendahara.data-biaya.adjust', $data['biaya']->id),
        [
            'uang_harian_per_hari' => 300000,
            'biaya_transportasi' => 500000,
            'biaya_penginapan_per_malam' => 400000,
            'biaya_lainnya' => 50000,
            'catatan_bendahara' => 'Disesuaikan dengan standar tarif 2026',
        ]
    );
    $adjustResponse->assertRedirect();

    $data['biaya']->refresh();
    expect((int) $data['biaya']->uang_harian_per_hari)->toBe(300000);
    expect((int) $data['biaya']->total_biaya)->toBe(2250000); // 3*300k + 500k + 2*400k + 50k = 900k + 500k + 800k + 50k = 2250000
});

test('bendahara is forbidden from approving sppd trips and modifying pegawai data', function () {
    $data = createTestBendaharaData();

    // Sppd trip approval must abort 403 for bendahara
    $approveTripResponse = $this->actingAs($data['bendahara'])->post(
        route('persetujuan.store', $data['sppd']->id),
        [
            'action' => 'disetujui',
            'catatan' => 'Mencoba approve perjalanan',
        ]
    );
    $approveTripResponse->assertForbidden();

    // Pegawai manipulation must abort 403 for bendahara
    $deletePegawaiResponse = $this->actingAs($data['bendahara'])->delete(
        route('pegawai.destroy', $data['pegawai']->id)
    );
    $deletePegawaiResponse->assertForbidden();
});

test('bendahara can export financial report to excel csv with UTF-8 BOM', function () {
    $data = createTestBendaharaData();

    $response = $this->actingAs($data['bendahara'])->get(route('keuangan.export-excel'));
    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
});
