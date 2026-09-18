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
        Schema::table('pegawais', function (Blueprint $table) {
            $table->string('nuptk', 50)->nullable()->after('nik');
            $table->string('mata_pelajaran', 100)->nullable()->after('jabatan');
            $table->string('status_guru', 50)->default('Guru Tetap Yayasan (GTY)')->after('golongan');
        });

        Schema::table('sppds', function (Blueprint $table) {
            $table->text('keterangan')->nullable()->after('catatan_atasan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pegawais', function (Blueprint $table) {
            $table->dropColumn(['nuptk', 'mata_pelajaran', 'status_guru']);
        });

        Schema::table('sppds', function (Blueprint $table) {
            $table->dropColumn(['keterangan']);
        });
    }
};
