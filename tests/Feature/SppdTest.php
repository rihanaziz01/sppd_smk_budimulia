<?php

use App\Models\Pegawai;
use App\Models\Sppd;
use App\Models\User;
use Carbon\Carbon;

function createTestPegawai(): Pegawai
{
    return Pegawai::create([
        'nama' => 'Budi Pratama, S.T.',
        'nip' => '19920410 201502 1 003',
        'jabatan' => 'Pranata Komputer Ahli Muda',
        'unit_kerja' => 'Bidang Aplikasi Informatika',
        'golongan' => 'Penata (III/c)',
        'nomor_rekening' => '1300098765432',
        'nama_bank' => 'Bank Mandiri',
        'status_aktif' => true,
    ]);
}

test('authenticated user can view sppd list and create page', function () {
    $user = User::factory()->create(['role' => 'pegawai']);

    $response = $this->actingAs($user)->get(route('sppd.index'));
    $response->assertOk();

    $createResponse = $this->actingAs($user)->get(route('sppd.create'));
    $createResponse->assertOk();
});

test('user can submit a new sppd with automatic cost and duration calculations', function () {
    $user = User::factory()->create(['role' => 'pegawai']);
    $pegawai = createTestPegawai();

    $berangkat = Carbon::now()->addDays(2)->format('Y-m-d');
    $kembali = Carbon::now()->addDays(5)->format('Y-m-d'); // 4 days

    $response = $this->actingAs($user)->post(route('sppd.store'), [
        'nomor_sp' => '090/TEST-01/SPT/2026',
        'nomor_sppd' => '090/TEST-01/SPPD/2026',
        'pegawai_id' => $pegawai->id,
        'maksud_tujuan' => 'Koordinasi Evaluasi Penerapan SPBE Nasional',
        'tempat_berangkat' => 'Bandung',
        'tempat_tujuan' => 'Jakarta Pusat (KemenPAN-RB)',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Kereta Api',
        'tanggal_berangkat' => $berangkat,
        'tanggal_kembali' => $kembali,
        'instansi_pembebanan' => 'Dinas Komunikasi dan Informatika',
        'mata_anggaran' => '5.1.02.04.01.0001',
        'uang_harian_per_hari' => 400000,
        'biaya_transportasi' => 800000,
        'biaya_penginapan_malam' => 3,
        'biaya_penginapan_per_malam' => 600000,
        'biaya_lainnya' => 200000,
    ]);

    $response->assertRedirect(route('sppd.index'));

    $sppd = Sppd::where('nomor_sppd', '090/TEST-01/SPPD/2026')->first();
    expect($sppd)->not->toBeNull();
    expect($sppd->lama_hari)->toBe(4);
    expect($sppd->status)->toBe('diajukan');

    // Biaya calculation: (4 * 400k) + 800k + (3 * 600k) + 200k = 1.6m + 800k + 1.8m + 200k = 4.4m
    expect($sppd->biaya)->not->toBeNull();
    expect((float) $sppd->biaya->total_biaya)->toBe((float) 4400000);
});

test('user can view sppd details', function () {
    $user = User::factory()->create(['role' => 'pegawai']);
    $pegawai = createTestPegawai();

    $sppd = Sppd::create([
        'nomor_sp' => '090/TEST-SHOW/SPT/2026',
        'nomor_sppd' => '090/TEST-SHOW/SPPD/2026',
        'pegawai_id' => $pegawai->id,
        'created_by_user_id' => $user->id,
        'maksud_tujuan' => 'Maksud tugas detail',
        'tempat_berangkat' => 'Bandung',
        'tempat_tujuan' => 'Jakarta',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Pesawat',
        'tanggal_berangkat' => Carbon::now()->format('Y-m-d'),
        'tanggal_kembali' => Carbon::now()->addDays(2)->format('Y-m-d'),
        'lama_hari' => 3,
        'status' => 'diajukan',
    ]);

    $response = $this->actingAs($user)->get(route('sppd.show', $sppd->id));
    $response->assertOk();
});

test('user can submit sppd with teacher duty and keterangan', function () {
    $user = User::factory()->create(['role' => 'pegawai']);
    $guru = Pegawai::create([
        'nama' => 'Budi Santoso, S.Kom., Gr.',
        'nip' => '19850314 201001 1 012',
        'nuptk' => '8439762663130122',
        'jabatan' => 'Guru Produktif TKJ',
        'mata_pelajaran' => 'Teknologi Jaringan Komputer',
        'unit_kerja' => 'Program Keahlian TKJ',
        'golongan' => 'Penata (III/c)',
        'nomor_rekening' => '1320019283741',
        'nama_bank' => 'Bank Mandiri',
        'status_aktif' => true,
    ]);

    $response = $this->actingAs($user)->post(route('sppd.store'), [
        'nomor_sp' => '090/088/ST-GURU/SMK-BM/II/2026',
        'nomor_sppd' => '090/088/SPPD-GURU/SMK-BM/II/2026',
        'pegawai_id' => $guru->id,
        'maksud_tujuan' => 'Mengikuti Workshop Kurikulum Merdeka Vokasi',
        'tempat_berangkat' => 'SMK Budi Mulia',
        'tempat_tujuan' => 'BBPPMPV BMTI Bandung',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Kereta Api Cepat',
        'tanggal_berangkat' => Carbon::now()->addDays(1)->format('Y-m-d'),
        'tanggal_kembali' => Carbon::now()->addDays(2)->format('Y-m-d'),
        'instansi_pembebanan' => 'SMK Budi Mulia',
        'mata_anggaran' => 'BOS-2026',
        'keterangan' => 'Tugas peningkatan kompetensi guru SMK Pusat Keunggulan',
        'uang_harian_per_hari' => 400000,
        'biaya_transportasi' => 500000,
    ]);

    $response->assertRedirect(route('sppd.index'));
    $this->assertDatabaseHas('sppds', [
        'nomor_sppd' => '090/088/SPPD-GURU/SMK-BM/II/2026',
        'keterangan' => 'Tugas peningkatan kompetensi guru SMK Pusat Keunggulan',
        'instansi_pembebanan' => 'SMK Budi Mulia',
    ]);
});
