<?php

use App\Models\Pegawai;
use App\Models\Sppd;
use App\Models\SppdBiaya;
use App\Models\User;
use Carbon\Carbon;

function getOrCreateSampleSppd(): Sppd
{
    $pegawai = Pegawai::create([
        'nama' => 'Budi Pratama, S.T.',
        'nip' => '19920410 201502 1 003',
        'jabatan' => 'Pranata Komputer Ahli Muda',
        'unit_kerja' => 'Bidang Aplikasi Informatika',
        'golongan' => 'Penata (III/c)',
        'nomor_rekening' => '1300098765432',
        'nama_bank' => 'Bank Mandiri',
        'status_aktif' => true,
    ]);

    $user = User::factory()->create(['role' => 'admin']);

    $sppd = Sppd::create([
        'nomor_sp' => '090/SAMPLE-KEU/SPT/2026',
        'nomor_sppd' => '090/SAMPLE-KEU/SPPD/2026',
        'pegawai_id' => $pegawai->id,
        'created_by_user_id' => $user->id,
        'maksud_tujuan' => 'Tugas Keuangan Sample',
        'tempat_berangkat' => 'Bandung',
        'tempat_tujuan' => 'Jakarta',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Pesawat',
        'tanggal_berangkat' => Carbon::now()->format('Y-m-d'),
        'tanggal_kembali' => Carbon::now()->addDays(2)->format('Y-m-d'),
        'lama_hari' => 3,
        'status' => 'disetujui',
    ]);

    SppdBiaya::create([
        'sppd_id' => $sppd->id,
        'uang_harian_hari' => 3,
        'uang_harian_per_hari' => 400000,
        'uang_harian_total' => 1200000,
        'biaya_transportasi' => 500000,
        'biaya_penginapan_malam' => 2,
        'biaya_penginapan_per_malam' => 600000,
        'biaya_penginapan_total' => 1200000,
        'biaya_lainnya' => 100000,
        'total_biaya' => 3000000,
        'status_pembayaran' => 'menunggu_pencairan',
    ]);

    return $sppd;
}

test('bendahara can view keuangan index and update disbursement to lunas', function () {
    $bendahara = User::factory()->create(['role' => 'bendahara']);
    $sppd = getOrCreateSampleSppd();

    $response = $this->actingAs($bendahara)->get(route('keuangan.index'));
    $response->assertOk();

    $updateResponse = $this->actingAs($bendahara)->put(route('keuangan.update', $sppd->biaya->id), [
        'uang_harian_hari' => $sppd->biaya->uang_harian_hari,
        'uang_harian_per_hari' => $sppd->biaya->uang_harian_per_hari,
        'biaya_transportasi' => $sppd->biaya->biaya_transportasi,
        'biaya_penginapan_malam' => $sppd->biaya->biaya_penginapan_malam,
        'biaya_penginapan_per_malam' => $sppd->biaya->biaya_penginapan_per_malam,
        'biaya_lainnya' => $sppd->biaya->biaya_lainnya,
        'status_pembayaran' => 'lunas',
        'metode_pembayaran' => 'Transfer Bank',
        'nomor_bukti_kas' => 'BKU-TEST-999',
        'catatan_bendahara' => 'Telah ditransfer',
    ]);

    $updateResponse->assertRedirect();
    $sppd->biaya->refresh();
    expect($sppd->biaya->status_pembayaran)->toBe('lunas');
    expect($sppd->biaya->nomor_bukti_kas)->toBe('BKU-TEST-999');
});

test('user can view printable documents', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $sppd = getOrCreateSampleSppd();

    $st = $this->actingAs($user)->get(route('dokumen.print-surat-tugas', $sppd->id));
    $st->assertOk();

    $form = $this->actingAs($user)->get(route('dokumen.print-sppd', $sppd->id));
    $form->assertOk();

    $kuitansi = $this->actingAs($user)->get(route('dokumen.print-rincian-biaya', $sppd->id));
    $kuitansi->assertOk();

    $laporanPrint = $this->actingAs($user)->get(route('dokumen.print-laporan', $sppd->id));
    $laporanPrint->assertOk();
});

test('user can view laporan page and export csv', function () {
    $user = User::factory()->create(['role' => 'admin']);
    getOrCreateSampleSppd();

    $laporanResponse = $this->actingAs($user)->get(route('laporan.index'));
    $laporanResponse->assertOk();

    $exportResponse = $this->actingAs($user)->get(route('laporan.export'));
    $exportResponse->assertOk();
    expect($exportResponse->headers->get('content-type'))->toContain('text/csv');
});
