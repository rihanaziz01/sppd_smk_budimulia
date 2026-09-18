<?php

use App\Models\Pegawai;
use App\Models\Sppd;
use App\Models\User;
use App\Notifications\SppdStatusUpdatedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function createGuruTestPegawai(array $attributes = []): Pegawai
{
    static $counter = 1;
    $counter++;

    return Pegawai::create(array_merge([
        'nip' => '19850101 201001 1 '.str_pad((string) $counter, 3, '0', STR_PAD_LEFT),
        'nama' => 'Guru Test '.$counter,
        'email' => 'guru'.$counter.'@smkbudimulia.sch.id',
        'jabatan' => 'Guru Produktif TKJ',
        'unit_kerja' => 'Tenaga Pendidik',
        'golongan' => 'Penata (III/c)',
        'nomor_rekening' => '00123456789'.$counter,
        'nama_bank' => 'Bank BJB',
        'status_aktif' => true,
    ], $attributes));
}

test('guru can view dashboard with 5 metrics', function () {
    $pegawai = createGuruTestPegawai(['nama' => 'Budi Santoso, S.Kom.']);

    $guruUser = User::factory()->create([
        'name' => $pegawai->nama,
        'email' => $pegawai->email,
        'role' => 'pegawai',
        'pegawai_id' => $pegawai->id,
    ]);

    // Create 1 diajukan, 1 disetujui, 1 ditolak
    Sppd::create([
        'nomor_sp' => 'SP/TEST/001',
        'nomor_sppd' => 'SPPD/TEST/001',
        'pegawai_id' => $pegawai->id,
        'created_by_user_id' => $guruUser->id,
        'maksud_tujuan' => 'Tugas 1',
        'tempat_berangkat' => 'Karawang',
        'tempat_tujuan' => 'Bandung',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Kereta',
        'tanggal_berangkat' => '2026-09-01',
        'tanggal_kembali' => '2026-09-03',
        'lama_hari' => 3,
        'status' => 'diajukan',
    ]);

    Sppd::create([
        'nomor_sp' => 'SP/TEST/002',
        'nomor_sppd' => 'SPPD/TEST/002',
        'pegawai_id' => $pegawai->id,
        'created_by_user_id' => $guruUser->id,
        'maksud_tujuan' => 'Tugas 2',
        'tempat_berangkat' => 'Karawang',
        'tempat_tujuan' => 'Jakarta',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Kereta',
        'tanggal_berangkat' => '2026-09-05',
        'tanggal_kembali' => '2026-09-06',
        'lama_hari' => 2,
        'status' => 'disetujui',
    ]);

    Sppd::create([
        'nomor_sp' => 'SP/TEST/003',
        'nomor_sppd' => 'SPPD/TEST/003',
        'pegawai_id' => $pegawai->id,
        'created_by_user_id' => $guruUser->id,
        'maksud_tujuan' => 'Tugas 3',
        'tempat_berangkat' => 'Karawang',
        'tempat_tujuan' => 'Bogor',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Mobil',
        'tanggal_berangkat' => '2026-09-08',
        'tanggal_kembali' => '2026-09-09',
        'lama_hari' => 2,
        'status' => 'ditolak',
    ]);

    $response = $this->actingAs($guruUser)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('my_stats', fn ($stats) => $stats
            ->where('total', 3)
            ->where('diajukan', 1)
            ->where('disetujui', 1)
            ->where('ditolak', 1)
            ->where('selesai', 0)
        )
    );
});

test('guru can view and update their profile', function () {
    $pegawai = createGuruTestPegawai(['nama' => 'Guru Lama']);

    $guruUser = User::factory()->create([
        'name' => $pegawai->nama,
        'email' => $pegawai->email,
        'role' => 'pegawai',
        'pegawai_id' => $pegawai->id,
    ]);

    $viewResponse = $this->actingAs($guruUser)->get(route('guru.profil'));
    $viewResponse->assertOk();

    $updateResponse = $this->actingAs($guruUser)->put(route('guru.profil.update'), [
        'nama' => 'Budi Santoso, S.Kom., Gr.',
        'nip' => '19850314 201001 1 012',
        'nik' => '3276011403850002',
        'nuptk' => '8439762663130122',
        'jabatan' => 'Kepala Program TKJ',
        'mata_pelajaran' => 'Teknologi Jaringan',
        'telepon' => '081287654321',
        'email' => 'budi.baru@smkbudimulia.sch.id',
        'nomor_rekening' => '1320019283741',
        'nama_bank' => 'Bank Mandiri',
        'unit_kerja' => 'Program Keahlian TKJ',
        'golongan' => 'Penata (III/c)',
        'status_guru' => 'Guru Tetap Yayasan (GTY)',
    ]);

    $updateResponse->assertRedirect();

    $this->assertDatabaseHas('pegawais', [
        'id' => $pegawai->id,
        'nama' => 'Budi Santoso, S.Kom., Gr.',
        'nuptk' => '8439762663130122',
        'nama_bank' => 'Bank Mandiri',
    ]);

    $this->assertDatabaseHas('users', [
        'id' => $guruUser->id,
        'name' => 'Budi Santoso, S.Kom., Gr.',
        'email' => 'budi.baru@smkbudimulia.sch.id',
    ]);
});

test('guru can submit sppd with optional file attachment', function () {
    Storage::fake('public');

    $pegawai = createGuruTestPegawai(['nama' => 'Rina Wulandari, S.Pd.']);

    $guruUser = User::factory()->create([
        'name' => $pegawai->nama,
        'email' => $pegawai->email,
        'role' => 'pegawai',
        'pegawai_id' => $pegawai->id,
    ]);

    $fakeFile = UploadedFile::fake()->create('surat_tugas.pdf', 500, 'application/pdf');

    $response = $this->actingAs($guruUser)->post(route('sppd.store'), [
        'nomor_sp' => '090/TEST/ST/2026',
        'nomor_sppd' => '090/TEST/SPPD/2026',
        'pegawai_id' => $pegawai->id,
        'maksud_tujuan' => 'Menghadiri Pelatihan Guru Bahasa Indonesia',
        'tempat_berangkat' => 'SMK Budi Mulia',
        'tempat_tujuan' => 'Balai Bahasa Bandung',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Kereta Api',
        'tanggal_berangkat' => '2026-10-01',
        'tanggal_kembali' => '2026-10-03',
        'uang_harian_per_hari' => 430000,
        'biaya_transportasi' => 500000,
        'lampiran_surat' => $fakeFile,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('sppds', [
        'nomor_sp' => '090/TEST/ST/2026',
        'tempat_tujuan' => 'Balai Bahasa Bandung',
        'status' => 'diajukan',
    ]);

    $this->assertDatabaseHas('sppd_dokumens', [
        'jenis_dokumen' => 'surat_undangan_tugas',
        'nama_dokumen' => 'surat_tugas.pdf',
    ]);

    // Check that notification is stored
    expect($guruUser->notifications()->count())->toBeGreaterThan(0);
});

test('approval action triggers notification to teacher', function () {
    $pegawai = createGuruTestPegawai(['nama' => 'Guru Dedi, M.T.']);

    $guruUser = User::factory()->create([
        'name' => $pegawai->nama,
        'email' => $pegawai->email,
        'role' => 'pegawai',
        'pegawai_id' => $pegawai->id,
    ]);

    $kepsekUser = User::factory()->create([
        'name' => 'Kepala Sekolah',
        'email' => 'kepsek@smkbudimulia.sch.id',
        'role' => 'atasan',
    ]);

    $sppd = Sppd::create([
        'nomor_sp' => 'SP/NOTIF/001',
        'nomor_sppd' => 'SPPD/NOTIF/001',
        'pegawai_id' => $pegawai->id,
        'created_by_user_id' => $guruUser->id,
        'maksud_tujuan' => 'Uji Notifikasi Approval',
        'tempat_berangkat' => 'Karawang',
        'tempat_tujuan' => 'Jakarta',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Kereta',
        'tanggal_berangkat' => '2026-10-10',
        'tanggal_kembali' => '2026-10-12',
        'lama_hari' => 3,
        'status' => 'diajukan',
    ]);

    $response = $this->actingAs($kepsekUser)->post(route('persetujuan.store', $sppd), [
        'action' => 'disetujui',
        'catatan' => 'Disetujui untuk meningkatkan mutu RPL.',
    ]);

    $response->assertRedirect();

    $notification = $guruUser->notifications()->latest()->first();
    expect($notification)->not->toBeNull();
    expect($notification->data['judul'])->toBe('Pengajuan SPPD Disetujui');
    expect($notification->data['sppd_id'])->toBe($sppd->id);
});

test('guru can view notifications and mark them as read', function () {
    $user = User::factory()->create();

    $user->notify(new SppdStatusUpdatedNotification(
        sppdId: 99,
        nomorSp: 'SP/99',
        judul: 'Pengajuan SPPD Disetujui',
        pesan: 'Tugas dinas telah disetujui.',
        status: 'disetujui'
    ));

    expect($user->unreadNotifications()->count())->toBe(1);

    $response = $this->actingAs($user)->get(route('notifikasi.index'));
    $response->assertOk();

    $notificationId = $user->unreadNotifications()->first()->id;

    $readResponse = $this->actingAs($user)->post(route('notifikasi.read', $notificationId));
    $readResponse->assertRedirect();

    expect($user->unreadNotifications()->count())->toBe(0);
});

test('guru can submit trip report and proofs', function () {
    Storage::fake('public');

    $pegawai = createGuruTestPegawai(['nama' => 'Guru Laporan']);

    $guruUser = User::factory()->create([
        'name' => $pegawai->nama,
        'email' => $pegawai->email,
        'role' => 'pegawai',
        'pegawai_id' => $pegawai->id,
    ]);

    $sppd = Sppd::create([
        'nomor_sp' => 'SP/LAP/001',
        'nomor_sppd' => 'SPPD/LAP/001',
        'pegawai_id' => $pegawai->id,
        'created_by_user_id' => $guruUser->id,
        'maksud_tujuan' => 'Tugas Selesai untuk Laporan',
        'tempat_berangkat' => 'Karawang',
        'tempat_tujuan' => 'Bandung',
        'tingkat_biaya' => 'Tingkat B',
        'alat_angkut' => 'Kereta',
        'tanggal_berangkat' => '2026-09-01',
        'tanggal_kembali' => '2026-09-03',
        'lama_hari' => 3,
        'status' => 'disetujui',
    ]);

    $fakeProof = UploadedFile::fake()->create('foto_kegiatan.jpg', 300, 'image/jpeg');

    $response = $this->actingAs($guruUser)->post(route('guru.laporan.store', $sppd), [
        'ringkasan_kegiatan' => 'Kegiatan workshop berlangsung sukses.',
        'hasil_kegiatan' => 'Memperoleh sertifikat kompetensi guru.',
        'kendala' => 'Jadwal padat.',
        'saran_tindak_lanjut' => 'Desiminasi ke dewan guru.',
        'tanggal_laporan' => '2026-09-04',
        'bukti_file' => $fakeProof,
        'jenis_bukti' => 'foto_kegiatan',
        'nama_bukti' => 'Foto_Sertifikat.jpg',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('sppd_laporans', [
        'sppd_id' => $sppd->id,
        'ringkasan_kegiatan' => 'Kegiatan workshop berlangsung sukses.',
    ]);

    $this->assertDatabaseHas('sppd_dokumens', [
        'sppd_id' => $sppd->id,
        'nama_dokumen' => 'Foto_Sertifikat.jpg',
    ]);

    expect($sppd->fresh()->status)->toBe('selesai');
});
