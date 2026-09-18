<?php

namespace Database\Seeders;

use App\Models\Pegawai;
use App\Models\Sppd;
use App\Models\SppdAnggaran;
use App\Models\SppdApproval;
use App\Models\SppdBiaya;
use App\Models\SppdDokumen;
use App\Models\SppdLaporan;
use App\Models\SppdPengikut;
use App\Models\StandarBiaya;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database for SMK Budi Mulia.
     */
    public function run(): void
    {
        // Bersihkan data lama agar seeder bersifat idempoten
        StandarBiaya::query()->delete();
        SppdAnggaran::query()->delete();
        SppdDokumen::query()->delete();
        SppdLaporan::query()->delete();
        SppdBiaya::query()->delete();
        SppdApproval::query()->delete();
        SppdPengikut::query()->delete();
        Sppd::query()->delete();
        User::query()->delete();
        Pegawai::query()->delete();

        // 1. Data Master Guru & Pimpinan SMK Budi Mulia
        $guruData = [
            [
                'nip' => '19740512 200003 1 001',
                'nik' => '3276011205740001',
                'nuptk' => '4536751652200003',
                'nama' => 'Dr. H. Ahmad Sudrajat, M.Pd.',
                'jabatan' => 'Kepala Sekolah',
                'mata_pelajaran' => 'Manajemen Pendidikan Kejuruan',
                'unit_kerja' => 'Pimpinan SMK Budi Mulia',
                'golongan' => 'Pembina Tk. I (IV/b)',
                'status_guru' => 'Guru Tetap Yayasan (GTY)',
                'nomor_rekening' => '0012398471001',
                'nama_bank' => 'Bank BJB',
                'telepon' => '081211223344',
                'email' => 'atasan@sppd.local', // juga login sebagai Kepala Sekolah
                'status_aktif' => true,
                'is_pejabat_penandatangan' => true,
            ],
            [
                'nip' => '19821120 200604 2 015',
                'nik' => '3276012011820005',
                'nuptk' => '3345749651300045',
                'nama' => 'Hj. Siti Aminah, S.E.',
                'jabatan' => 'Bendahara Sekolah / Guru Akuntansi',
                'mata_pelajaran' => 'Akuntansi & Keuangan Lembaga',
                'unit_kerja' => 'Tata Usaha & Keuangan',
                'golongan' => 'Penata Tk. I (III/d)',
                'status_guru' => 'Guru Tetap Yayasan (GTY)',
                'nomor_rekening' => '0019876543210',
                'nama_bank' => 'Bank BJB',
                'telepon' => '081311223344',
                'email' => 'bendahara@sppd.local',
                'status_aktif' => true,
                'is_pejabat_penandatangan' => false,
            ],
            [
                'nip' => '19850314 201001 1 012',
                'nik' => '3276011403850002',
                'nuptk' => '8439762663130122',
                'nama' => 'Budi Santoso, S.Kom., Gr.',
                'jabatan' => 'Kepala Program Keahlian TKJ / Guru Produktif',
                'mata_pelajaran' => 'Teknologi Jaringan Komputer & Telekomunikasi',
                'unit_kerja' => 'Program Keahlian TKJ',
                'golongan' => 'Penata (III/c)',
                'status_guru' => 'Guru Tetap Yayasan (GTY)',
                'nomor_rekening' => '1320019283741',
                'nama_bank' => 'Bank Mandiri',
                'telepon' => '081287654321',
                'email' => 'pegawai@sppd.local', // demo guru
                'status_aktif' => true,
                'is_pejabat_penandatangan' => false,
            ],
            [
                'nip' => '19880721 201502 2 003',
                'nik' => '3276012107880004',
                'nuptk' => '1938746592200012',
                'nama' => 'Rina Wulandari, S.Pd.',
                'jabatan' => 'Guru Bahasa Indonesia / Pembina OSIS',
                'mata_pelajaran' => 'Bahasa Indonesia',
                'unit_kerja' => 'Kesiswaan',
                'golongan' => 'Penata Muda Tk. I (III/b)',
                'status_guru' => 'Guru Tetap Yayasan (GTY)',
                'nomor_rekening' => '5410982341',
                'nama_bank' => 'Bank BCA',
                'telepon' => '081398765432',
                'email' => 'rina.wulandari@smkbudimulia.sch.id',
                'status_aktif' => true,
                'is_pejabat_penandatangan' => false,
            ],
            [
                'nip' => '19800910 200801 1 005',
                'nik' => '3276011009800003',
                'nuptk' => '6245750651200032',
                'nama' => 'Ir. Dedi Kurniawan, M.T.',
                'jabatan' => 'Kepala Program Keahlian Rekayasa Perangkat Lunak',
                'mata_pelajaran' => 'Pemodelan Perangkat Lunak & Basis Data',
                'unit_kerja' => 'Program Keahlian RPL',
                'golongan' => 'Pembina (IV/a)',
                'status_guru' => 'PNS Dpk',
                'nomor_rekening' => '0432987123',
                'nama_bank' => 'Bank BNI',
                'telepon' => '081234567890',
                'email' => 'dedi.kurniawan@smkbudimulia.sch.id',
                'status_aktif' => true,
                'is_pejabat_penandatangan' => false,
            ],
            [
                'nip' => '19910408 201903 2 014',
                'nik' => '3276010804910006',
                'nuptk' => '7354763664200021',
                'nama' => 'Siti Fatimah, S.Pd.',
                'jabatan' => 'Guru Matematika Kejuruan',
                'mata_pelajaran' => 'Matematika Terapan',
                'unit_kerja' => 'Kurikulum',
                'golongan' => 'Penata Muda (III/a)',
                'status_guru' => 'PPPK Guru',
                'nomor_rekening' => '019201002345501',
                'nama_bank' => 'Bank BRI',
                'telepon' => '081298761234',
                'email' => 'siti.fatimah@smkbudimulia.sch.id',
                'status_aktif' => true,
                'is_pejabat_penandatangan' => false,
            ],
            [
                'nip' => '19930215 202012 1 008',
                'nik' => '3276011502930007',
                'nuptk' => '5142761662130098',
                'nama' => 'Hendra Pratama, S.Pd.',
                'jabatan' => 'Guru Bimbingan Konseling / Penelusuran Karir & BKK',
                'mata_pelajaran' => 'Bimbingan & Konseling (BK)',
                'unit_kerja' => 'Bimbingan Karir & Bursa Kerja Khusus',
                'golongan' => 'Golongan IX (PPPK)',
                'status_guru' => 'Guru Tidak Tetap (GTT)',
                'nomor_rekening' => '0023456789001',
                'nama_bank' => 'Bank BJB',
                'telepon' => '085712345678',
                'email' => 'hendra.pratama@smkbudimulia.sch.id',
                'status_aktif' => true,
                'is_pejabat_penandatangan' => false,
            ],
        ];

        $createdPegawais = [];
        foreach ($guruData as $data) {
            $createdPegawais[] = Pegawai::create($data);
        }

        $kepsek = $createdPegawais[0];
        $bendahara = $createdPegawais[1];
        $guruBudi = $createdPegawais[2];
        $guruRina = $createdPegawais[3];
        $guruDedi = $createdPegawais[4];
        $guruSiti = $createdPegawais[5];
        $guruHendra = $createdPegawais[6];

        // 2. Akun Pengguna Sistem (Admin, Kepala Sekolah, Bendahara, Guru)
        $adminUser = User::create([
            'name' => 'Administrator SMK Budi Mulia',
            'username' => 'admin',
            'email' => 'admin@sppd.local',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'nip' => '19800101 200501 1 001',
            'phone' => '081299887766',
            'email_verified_at' => now(),
        ]);

        $kepsekUser = User::create([
            'name' => $kepsek->nama,
            'username' => 'kepsek',
            'email' => 'atasan@sppd.local',
            'password' => Hash::make('kepsek123'),
            'role' => 'atasan', // wewenang Kepala Sekolah
            'nip' => $kepsek->nip,
            'phone' => $kepsek->telepon,
            'pegawai_id' => $kepsek->id,
            'email_verified_at' => now(),
        ]);
        $kepsek->update(['user_id' => $kepsekUser->id]);

        $bendaharaUser = User::create([
            'name' => $bendahara->nama,
            'username' => 'bendahara',
            'email' => 'bendahara@sppd.local',
            'password' => Hash::make('bendahara123'),
            'role' => 'bendahara',
            'nip' => $bendahara->nip,
            'phone' => $bendahara->telepon,
            'pegawai_id' => $bendahara->id,
            'email_verified_at' => now(),
        ]);
        $bendahara->update(['user_id' => $bendaharaUser->id]);

        $guruUser = User::create([
            'name' => $guruBudi->nama,
            'username' => 'guru',
            'email' => 'pegawai@sppd.local',
            'password' => Hash::make('guru123'),
            'role' => 'pegawai', // wewenang Guru
            'nip' => $guruBudi->nip,
            'phone' => $guruBudi->telepon,
            'pegawai_id' => $guruBudi->id,
            'email_verified_at' => now(),
        ]);
        $guruBudi->update(['user_id' => $guruUser->id]);

        // 3. Pos Anggaran Sekolah
        $anggaranBos = SppdAnggaran::create([
            'tahun_anggaran' => 2026,
            'nama_anggaran' => 'Dana BOS Reguler - Perjalanan Dinas Guru',
            'kode_rekening' => '5.1.02.04.01.0001',
            'total_anggaran' => 45000000,
            'periode' => 'Tahun Anggaran 2026',
            'keterangan' => 'Alokasi penugasan diklat kurikulum merdeka & workshop kejuruan',
            'status' => 'aktif',
        ]);

        $anggaranYayasan = SppdAnggaran::create([
            'tahun_anggaran' => 2026,
            'nama_anggaran' => 'Kas Rutin Yayasan Budi Mulia',
            'kode_rekening' => '5.1.02.04.01.0002',
            'total_anggaran' => 30000000,
            'periode' => 'Tahun Anggaran 2026',
            'keterangan' => 'Penugasan manajerial, koordinasi dinas, dan perizinan sekolah',
            'status' => 'aktif',
        ]);

        $anggaranLks = SppdAnggaran::create([
            'tahun_anggaran' => 2026,
            'nama_anggaran' => 'Dana LKS & Sertifikasi Kompetensi Siswa/Guru',
            'kode_rekening' => '5.1.02.04.01.0003',
            'total_anggaran' => 25000000,
            'periode' => 'Tahun Anggaran 2026',
            'keterangan' => 'Pembimbingan Lomba Kompetensi Siswa dan asesi sertifikasi BNSP',
            'status' => 'aktif',
        ]);

        // 4. Standar Biaya Masukan (SBM) Kebijakan Sekolah
        $standarBiayas = [
            [
                'kategori' => 'Uang Harian',
                'tingkat_golongan' => 'Semua Golongan',
                'wilayah' => 'Dalam Kota Karawang',
                'nominal_standar' => 150000,
                'satuan' => 'per hari',
                'keterangan' => 'Uang saku harian kegiatan kedinasan lokal Karawang',
            ],
            [
                'kategori' => 'Uang Harian',
                'tingkat_golongan' => 'Golongan III / Guru',
                'wilayah' => 'Luar Kota (Jawa Barat)',
                'nominal_standar' => 350000,
                'satuan' => 'per hari',
                'keterangan' => 'Uang harian penugasan Bandung, Bekasi, Bogor, Cirebon',
            ],
            [
                'kategori' => 'Uang Harian',
                'tingkat_golongan' => 'Semua Golongan',
                'wilayah' => 'DKI Jakarta',
                'nominal_standar' => 400000,
                'satuan' => 'per hari',
                'keterangan' => 'Uang harian kegiatan kementerian/instansi pusat di Jakarta',
            ],
            [
                'kategori' => 'Uang Harian',
                'tingkat_golongan' => 'Semua Golongan',
                'wilayah' => 'Luar Provinsi / Nasional',
                'nominal_standar' => 500000,
                'satuan' => 'per hari',
                'keterangan' => 'Uang harian pelatihan nasional di luar Jawa Barat/DKI',
            ],
            [
                'kategori' => 'Penginapan',
                'tingkat_golongan' => 'Guru / Staf',
                'wilayah' => 'Luar Kota (Jawa Barat)',
                'nominal_standar' => 450000,
                'satuan' => 'per malam',
                'keterangan' => 'Batas maksimal biaya hotel bintang 3 / wisma kedinasan',
            ],
            [
                'kategori' => 'Penginapan',
                'tingkat_golongan' => 'Kepala Sekolah',
                'wilayah' => 'Luar Kota (Jawa Barat)',
                'nominal_standar' => 700000,
                'satuan' => 'per malam',
                'keterangan' => 'Standar akomodasi pimpinan sekolah',
            ],
            [
                'kategori' => 'Transportasi',
                'tingkat_golongan' => 'Semua Golongan',
                'wilayah' => 'Dalam Kota Karawang',
                'nominal_standar' => 150000,
                'satuan' => 'per perjalanan',
                'keterangan' => 'Penggantian BBM / operasional lokal',
            ],
            [
                'kategori' => 'Transportasi',
                'tingkat_golongan' => 'Semua Golongan',
                'wilayah' => 'Luar Kota (Jawa Barat)',
                'nominal_standar' => 350000,
                'satuan' => 'per perjalanan',
                'keterangan' => 'Tiket Kereta Cepat / Argo Parahyangan / Travel PP',
            ],
            [
                'kategori' => 'Biaya Lainnya',
                'tingkat_golongan' => 'Semua Golongan',
                'wilayah' => 'Luar Kota (Jawa Barat)',
                'nominal_standar' => 500000,
                'satuan' => 'per kegiatan',
                'keterangan' => 'Kontribusi pendaftaran seminar/diklat kedinasan',
            ],
        ];

        foreach ($standarBiayas as $sb) {
            StandarBiaya::create($sb);
        }

        // 5. Sample SPPD dengan Biaya & Status untuk Demo Bendahara
        $sppd1 = Sppd::create([
            'nomor_sp' => '090/012/SMK-BM/SP/2026',
            'nomor_sppd' => '090/012/SMK-BM/SPPD/2026',
            'pegawai_id' => $guruBudi->id,
            'pejabat_pemberi_perintah_id' => $kepsek->id,
            'created_by_user_id' => $guruUser->id,
            'maksud_tujuan' => 'Workshop Sinkronisasi Kurikulum Industri Teknik Jaringan Komputer dengan PT Telkom Indonesia',
            'tempat_berangkat' => 'SMK Budi Mulia Karawang',
            'tempat_tujuan' => 'Bandung Technopark, Kota Bandung',
            'tingkat_biaya' => 'Tingkat B',
            'alat_angkut' => 'Kereta Api',
            'tanggal_berangkat' => now()->subDays(5)->toDateString(),
            'tanggal_kembali' => now()->subDays(3)->toDateString(),
            'lama_hari' => 3,
            'instansi_pembebanan' => 'Dana BOS Reguler',
            'mata_anggaran' => '5.1.02.04.01.0001',
            'status' => 'disetujui',
            'catatan_atasan' => 'Disetujui. Mohon koordinasi kurikulum mikrotik & fiber optik.',
        ]);

        SppdBiaya::create([
            'sppd_id' => $sppd1->id,
            'anggaran_id' => $anggaranBos->id,
            'uang_harian_hari' => 3,
            'uang_harian_per_hari' => 350000,
            'uang_harian_total' => 1050000,
            'biaya_transportasi' => 500000,
            'biaya_penginapan_malam' => 2,
            'biaya_penginapan_per_malam' => 450000,
            'biaya_penginapan_total' => 900000,
            'biaya_lainnya' => 250000,
            'keterangan_biaya_lainnya' => 'Registrasi materi kit kurikulum',
            'total_biaya' => 2700000,
            'status_verifikasi' => 'menunggu_verifikasi',
            'status_pembayaran' => 'belum_dibayar',
        ]);

        $sppd2 = Sppd::create([
            'nomor_sp' => '090/015/SMK-BM/SP/2026',
            'nomor_sppd' => '090/015/SMK-BM/SPPD/2026',
            'pegawai_id' => $guruRina->id,
            'pejabat_pemberi_perintah_id' => $kepsek->id,
            'created_by_user_id' => $adminUser->id,
            'maksud_tujuan' => 'Pelatihan Penulisan Modul Ajar dan Pembelajaran Terdiferensiasi Kurikulum Merdeka',
            'tempat_berangkat' => 'SMK Budi Mulia Karawang',
            'tempat_tujuan' => 'Balai Besar Guru Penggerak (BBGP) Jawa Barat, Kota Bandung',
            'tingkat_biaya' => 'Tingkat B',
            'alat_angkut' => 'Mobil Operasional Sekolah',
            'tanggal_berangkat' => now()->subDays(12)->toDateString(),
            'tanggal_kembali' => now()->subDays(10)->toDateString(),
            'lama_hari' => 3,
            'instansi_pembebanan' => 'Dana BOS Reguler',
            'mata_anggaran' => '5.1.02.04.01.0001',
            'status' => 'selesai',
            'catatan_atasan' => 'Disetujui.',
        ]);

        SppdBiaya::create([
            'sppd_id' => $sppd2->id,
            'anggaran_id' => $anggaranBos->id,
            'uang_harian_hari' => 3,
            'uang_harian_per_hari' => 350000,
            'uang_harian_total' => 1050000,
            'biaya_transportasi' => 450000,
            'biaya_penginapan_malam' => 2,
            'biaya_penginapan_per_malam' => 400000,
            'biaya_penginapan_total' => 800000,
            'biaya_lainnya' => 200000,
            'keterangan_biaya_lainnya' => 'Sertifikat pelatihan',
            'total_biaya' => 2500000,
            'status_verifikasi' => 'terverifikasi',
            'verified_by_user_id' => $bendaharaUser->id,
            'verified_at' => now()->subDays(8),
            'status_pembayaran' => 'sudah_dibayar',
            'tanggal_bayar' => now()->subDays(8)->toDateString(),
            'metode_pembayaran' => 'Transfer Bank BJB',
            'nomor_bukti_kas' => 'BKU-SPPD/2026/03/001',
            'catatan_bendahara' => 'Biaya telah ditransfer ke rekening Guru BJB a.n. Rina Wulandari.',
        ]);
    }
}
