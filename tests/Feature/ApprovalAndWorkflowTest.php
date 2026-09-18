<?php

use App\Models\Pegawai;
use App\Models\Sppd;
use App\Models\User;
use Carbon\Carbon;

function getOrCreatePegawai(): Pegawai
{
    return Pegawai::first() ?? Pegawai::create([
        'nama' => 'Dr. Ir. Hendra Gunawan, M.Si.',
        'nip' => '19750812 199903 1 002',
        'jabatan' => 'Kepala Dinas',
        'unit_kerja' => 'Pimpinan Dinas Kominfo',
        'golongan' => 'Pembina Utama Muda (IV/c)',
        'nomor_rekening' => '1300012345678',
        'nama_bank' => 'Bank Mandiri',
        'status_aktif' => true,
    ]);
}

test('atasan can approve sppd and update status', function () {
    $atasan = User::factory()->create(['role' => 'atasan']);
    $pegawai = getOrCreatePegawai();

    $sppd = Sppd::create([
        'nomor_sp' => '090/APPR-01/SPT/2026',
        'nomor_sppd' => '090/APPR-01/SPPD/2026',
        'pegawai_id' => $pegawai->id,
        'created_by_user_id' => $atasan->id,
        'maksud_tujuan' => 'Rapat Evaluasi Anggaran',
        'tempat_berangkat' => 'Bandung',
        'tempat_tujuan' => 'Jakarta',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Mobil Dinas',
        'tanggal_berangkat' => Carbon::now()->addDay()->format('Y-m-d'),
        'tanggal_kembali' => Carbon::now()->addDays(2)->format('Y-m-d'),
        'lama_hari' => 2,
        'status' => 'diajukan',
    ]);

    $response = $this->actingAs($atasan)->post(route('persetujuan.store', $sppd->id), [
        'action' => 'disetujui',
        'catatan' => 'Disetujui. Harap jaga integritas dinas.',
    ]);

    $response->assertRedirect();
    $sppd->refresh();

    expect($sppd->status)->toBe('disetujui');
    expect($sppd->catatan_atasan)->toBe('Disetujui. Harap jaga integritas dinas.');

    $this->assertDatabaseHas('sppd_approvals', [
        'sppd_id' => $sppd->id,
        'action' => 'disetujui',
        'user_id' => $atasan->id,
    ]);
});

test('atasan can request revision with notes', function () {
    $atasan = User::factory()->create(['role' => 'atasan']);
    $pegawai = getOrCreatePegawai();

    $sppd = Sppd::create([
        'nomor_sp' => '090/REV-01/SPT/2026',
        'nomor_sppd' => '090/REV-01/SPPD/2026',
        'pegawai_id' => $pegawai->id,
        'created_by_user_id' => $atasan->id,
        'maksud_tujuan' => 'Konsultasi Perizinan',
        'tempat_berangkat' => 'Bandung',
        'tempat_tujuan' => 'Semarang',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Kereta Api',
        'tanggal_berangkat' => Carbon::now()->addDays(3)->format('Y-m-d'),
        'tanggal_kembali' => Carbon::now()->addDays(4)->format('Y-m-d'),
        'lama_hari' => 2,
        'status' => 'diajukan',
    ]);

    $response = $this->actingAs($atasan)->post(route('persetujuan.store', $sppd->id), [
        'action' => 'revisi',
        'catatan' => 'Mohon ubah moda transportasi menggunakan mobil dinas.',
    ]);

    $response->assertRedirect();
    $sppd->refresh();

    expect($sppd->status)->toBe('ditolak');
    expect($sppd->catatan_revisi)->toBe('Mohon ubah moda transportasi menggunakan mobil dinas.');
});
