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
        Schema::create('pegawais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nip', 50)->unique();
            $table->string('nik', 50)->nullable();
            $table->string('nama');
            $table->string('jabatan');
            $table->string('unit_kerja');
            $table->string('golongan', 50); // contoh: Pembina / IV/a, Penata / III/c, dll
            $table->string('nomor_rekening', 50);
            $table->string('nama_bank', 50);
            $table->string('telepon', 30)->nullable();
            $table->string('email')->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->boolean('is_pejabat_penandatangan')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pegawais');
    }
};
