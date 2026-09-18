<?php

use App\Models\Pegawai;
use App\Models\User;

test('authenticated user can view pegawai list', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($user)->get(route('pegawai.index'));

    $response->assertOk();
});

test('user can create a new pegawai', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($user)->post(route('pegawai.store'), [
        'nama' => 'Ridwan Pratama, S.T.',
        'nip' => '19930812 201801 1 005',
        'jabatan' => 'Pranata Komputer Ahli Muda',
        'unit_kerja' => 'Bidang Aplikasi dan Informatika',
        'golongan' => 'Penata (III/c)',
        'nomor_rekening' => '00987654321',
        'nama_bank' => 'Bank BJB',
        'telepon' => '08122334455',
        'email' => 'ridwan@example.com',
        'status_aktif' => true,
        'is_pejabat_penandatangan' => false,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('pegawais', [
        'nip' => '19930812 201801 1 005',
        'nama' => 'Ridwan Pratama, S.T.',
    ]);
});

test('pegawai requires unique NIP', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $existing = Pegawai::first() ?? Pegawai::create([
        'nama' => 'Existing Pegawai',
        'nip' => '19850101 201001 1 001',
        'jabatan' => 'Staf',
        'unit_kerja' => 'Umum',
        'golongan' => 'III/a',
        'nomor_rekening' => '123',
        'nama_bank' => 'BJB',
    ]);

    $response = $this->actingAs($user)->post(route('pegawai.store'), [
        'nama' => 'Duplicate Pegawai',
        'nip' => $existing->nip,
        'jabatan' => 'Staf',
        'unit_kerja' => 'Umum',
        'golongan' => 'III/a',
        'nomor_rekening' => '123',
        'nama_bank' => 'BJB',
    ]);

    $response->assertSessionHasErrors('nip');
});

test('pegawai can be updated', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $pegawai = Pegawai::create([
        'nama' => 'Pegawai Lama',
        'nip' => '19900101 201501 1 099',
        'jabatan' => 'Staf',
        'unit_kerja' => 'Umum',
        'golongan' => 'III/a',
        'nomor_rekening' => '12345',
        'nama_bank' => 'BJB',
    ]);

    $response = $this->actingAs($user)->put(route('pegawai.update', $pegawai->id), [
        'nama' => 'Pegawai Baru Update',
        'nip' => $pegawai->nip,
        'jabatan' => 'Kepala Seksi',
        'unit_kerja' => 'Bidang Komunikasi',
        'golongan' => 'III/b',
        'nomor_rekening' => '54321',
        'nama_bank' => 'Bank Mandiri',
        'status_aktif' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('pegawais', [
        'id' => $pegawai->id,
        'nama' => 'Pegawai Baru Update',
        'jabatan' => 'Kepala Seksi',
    ]);
});

test('teacher fields nuptk and mata_pelajaran can be stored and searched', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($user)->post(route('pegawai.store'), [
        'nama' => 'Ahmad Fauzan, S.Pd.',
        'nip' => '19950101 202101 1 001',
        'nuptk' => '9988776655443322',
        'jabatan' => 'Guru Produktif TKJ',
        'mata_pelajaran' => 'Administrasi Server & Cloud',
        'unit_kerja' => 'Program Keahlian TKJ',
        'golongan' => 'Penata Muda (III/a)',
        'status_guru' => 'Guru Tetap Yayasan (GTY)',
        'nomor_rekening' => '0099887766',
        'nama_bank' => 'Bank Mandiri',
        'telepon' => '08123456789',
        'email' => 'fauzan@smkbudimulia.sch.id',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('pegawais', [
        'nama' => 'Ahmad Fauzan, S.Pd.',
        'nuptk' => '9988776655443322',
        'mata_pelajaran' => 'Administrasi Server & Cloud',
    ]);

    $searchResponse = $this->actingAs($user)->get(route('pegawai.index', ['search' => '9988776655443322']));
    $searchResponse->assertOk();
});
