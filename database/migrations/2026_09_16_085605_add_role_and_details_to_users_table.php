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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('pegawai')->after('email'); // admin, pegawai, atasan, bendahara
            $table->string('nip')->nullable()->after('role');
            $table->string('phone')->nullable()->after('nip');
            $table->unsignedBigInteger('pegawai_id')->nullable()->after('phone')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'nip', 'phone', 'pegawai_id']);
        });
    }
};
