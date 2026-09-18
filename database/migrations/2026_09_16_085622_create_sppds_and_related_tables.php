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
        Schema::create('sppds', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_sp')->unique();
            $table->string('nomor_sppd')->unique();
            $table->foreignId('pegawai_id')->constrained('pegawais')->cascadeOnDelete();
            $table->foreignId('pejabat_pemberi_perintah_id')->nullable()->constrained('pegawais')->nullOnDelete();
            $table->foreignId('created_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->text('maksud_tujuan');
            $table->string('tempat_berangkat')->default('Bandung');
            $table->string('tempat_tujuan');
            $table->string('tingkat_biaya')->default('Tingkat B');
            $table->string('alat_angkut'); // Pesawat Udara, Kereta Api, Mobil Dinas, Kendaraan Pribadi, Bus
            $table->date('tanggal_berangkat');
            $table->date('tanggal_kembali');
            $table->integer('lama_hari');
            $table->string('instansi_pembebanan')->default('Dinas Komunikasi dan Informatika');
            $table->string('mata_anggaran')->default('5.1.02.04.01.0001');
            $table->string('status')->default('diajukan'); // draft, diajukan, disetujui, ditolak, selesai
            $table->text('catatan_revisi')->nullable();
            $table->text('catatan_atasan')->nullable();
            $table->timestamps();
        });

        Schema::create('sppd_pengikuts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sppd_id')->constrained('sppds')->cascadeOnDelete();
            $table->foreignId('pegawai_id')->constrained('pegawais')->cascadeOnDelete();
            $table->string('keterangan')->nullable();
            $table->timestamps();
        });

        Schema::create('sppd_biayas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sppd_id')->constrained('sppds')->cascadeOnDelete()->unique();
            $table->integer('uang_harian_hari')->default(1);
            $table->decimal('uang_harian_per_hari', 15, 2)->default(0);
            $table->decimal('uang_harian_total', 15, 2)->default(0);
            $table->decimal('biaya_transportasi', 15, 2)->default(0);
            $table->integer('biaya_penginapan_malam')->default(0);
            $table->decimal('biaya_penginapan_per_malam', 15, 2)->default(0);
            $table->decimal('biaya_penginapan_total', 15, 2)->default(0);
            $table->decimal('biaya_lainnya', 15, 2)->default(0);
            $table->string('keterangan_biaya_lainnya')->nullable();
            $table->decimal('total_biaya', 15, 2)->default(0);
            $table->string('status_pembayaran')->default('belum_dibayar'); // belum_dibayar, menunggu_pencairan, lunas
            $table->date('tanggal_bayar')->nullable();
            $table->string('metode_pembayaran')->nullable(); // Transfer Bank, Kas
            $table->string('nomor_bukti_kas')->nullable();
            $table->text('catatan_bendahara')->nullable();
            $table->timestamps();
        });

        Schema::create('sppd_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sppd_id')->constrained('sppds')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role'); // atasan, bendahara, admin, pegawai
            $table->string('action'); // diajukan, disetujui, ditolak, revisi, dicairkan, selesai
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('sppd_dokumens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sppd_id')->constrained('sppds')->cascadeOnDelete();
            $table->foreignId('uploaded_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('jenis_dokumen'); // tiket, boarding_pass, nota_hotel, foto_kegiatan, laporan_kegiatan, lainnya
            $table->string('nama_dokumen');
            $table->string('file_path');
            $table->bigInteger('file_size')->nullable();
            $table->string('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('sppd_laporans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sppd_id')->constrained('sppds')->cascadeOnDelete()->unique();
            $table->text('ringkasan_kegiatan');
            $table->longText('hasil_kegiatan');
            $table->text('kendala')->nullable();
            $table->text('saran_tindak_lanjut')->nullable();
            $table->date('tanggal_laporan');
            $table->string('status')->default('diserahkan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sppd_laporans');
        Schema::dropIfExists('sppd_dokumens');
        Schema::dropIfExists('sppd_approvals');
        Schema::dropIfExists('sppd_biayas');
        Schema::dropIfExists('sppd_pengikuts');
        Schema::dropIfExists('sppds');
    }
};
