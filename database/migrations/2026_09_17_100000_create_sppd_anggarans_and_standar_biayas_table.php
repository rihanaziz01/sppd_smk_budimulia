<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabel Alokasi Anggaran Perjalanan Dinas
        Schema::create('sppd_anggarans', function (Blueprint $table) {
            $table->id();
            $table->integer('tahun_anggaran')->default(2026);
            $table->string('nama_anggaran'); // e.g. Dana BOS Reguler - Transport Guru
            $table->string('kode_rekening')->nullable(); // e.g. 5.1.02.04.01.0001
            $table->decimal('total_anggaran', 15, 2)->default(0);
            $table->string('periode')->default('Tahun 2026');
            $table->text('keterangan')->nullable();
            $table->string('status')->default('aktif'); // aktif, nonaktif
            $table->timestamps();
        });

        // 2. Tabel Standar Tarif Biaya Kebijakan Sekolah (Standar Biaya Masukan / SBM)
        Schema::create('standar_biayas', function (Blueprint $table) {
            $table->id();
            $table->string('kategori'); // Uang Harian, Transportasi, Penginapan, Biaya Lainnya
            $table->string('tingkat_golongan')->default('Semua Golongan'); // Kepala Sekolah, Golongan IV, Golongan III, Guru/Staf, Semua Golongan
            $table->string('wilayah')->default('Dalam Kota'); // Dalam Kota Karawang, Luar Kota (Jawa Barat), Luar Provinsi / Nasional, DKI Jakarta
            $table->decimal('nominal_standar', 15, 2)->default(0);
            $table->string('satuan')->default('per hari'); // per hari, per malam, per tiket, per kegiatan
            $table->text('keterangan')->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
        });

        // 3. Tambahan kolom pada sppd_biayas untuk Verifikasi & Bukti Pembayaran
        Schema::table('sppd_biayas', function (Blueprint $table) {
            $table->string('status_verifikasi')->default('menunggu_verifikasi'); // menunggu_verifikasi, terverifikasi, perlu_perbaikan
            $table->text('catatan_verifikasi')->nullable();
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->string('file_bukti_bayar')->nullable(); // slip transfer / foto kuitansi
            $table->foreignId('anggaran_id')->nullable()->constrained('sppd_anggarans')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sppd_biayas', function (Blueprint $table) {
            $table->dropForeign(['anggaran_id']);
            $table->dropForeign(['verified_by_user_id']);
            $table->dropColumn([
                'status_verifikasi',
                'catatan_verifikasi',
                'verified_by_user_id',
                'verified_at',
                'file_bukti_bayar',
                'anggaran_id',
            ]);
        });

        Schema::dropIfExists('standar_biayas');
        Schema::dropIfExists('sppd_anggarans');
    }
};
