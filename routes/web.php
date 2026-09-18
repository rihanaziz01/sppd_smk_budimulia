<?php

use App\Http\Controllers\BendaharaAnggaranController;
use App\Http\Controllers\BendaharaDataBiayaController;
use App\Http\Controllers\BendaharaPembayaranController;
use App\Http\Controllers\BendaharaVerifikasiController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DokumenController;
use App\Http\Controllers\DokumenPrintController;
use App\Http\Controllers\GuruLaporanController;
use App\Http\Controllers\GuruProfileController;
use App\Http\Controllers\KeuanganController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\SppdApprovalController;
use App\Http\Controllers\SppdController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // 1. Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 2. Profil Guru (Profil Saya)
    Route::get('guru/profil', [GuruProfileController::class, 'index'])->name('guru.profil');
    Route::put('guru/profil', [GuruProfileController::class, 'update'])->name('guru.profil.update');

    // 3. Data Pegawai / Guru (Kelola oleh Admin/Kepsek)
    Route::get('pegawai', [PegawaiController::class, 'index'])->name('pegawai.index');
    Route::post('pegawai', [PegawaiController::class, 'store'])->name('pegawai.store');
    Route::put('pegawai/{pegawai}', [PegawaiController::class, 'update'])->name('pegawai.update');
    Route::delete('pegawai/{pegawai}', [PegawaiController::class, 'destroy'])->name('pegawai.destroy');

    // 4. Pengajuan & Riwayat SPPD
    Route::resource('sppd', SppdController::class);

    // 5. Persetujuan SPPD (Kepala Sekolah)
    Route::get('persetujuan', [SppdApprovalController::class, 'index'])->name('persetujuan.index');
    Route::post('persetujuan/{sppd}', [SppdApprovalController::class, 'store'])->name('persetujuan.store');

    // 6. Keuangan & Laporan Keuangan
    Route::get('keuangan', [KeuanganController::class, 'index'])->name('keuangan.index');
    Route::get('keuangan/export-excel', [KeuanganController::class, 'exportExcel'])->name('keuangan.export-excel');
    Route::put('keuangan/{biaya}', [KeuanganController::class, 'update'])->name('keuangan.update');

    // 7. Modul Khusus Bendahara
    Route::prefix('bendahara')->name('bendahara.')->group(function () {
        // Verifikasi Biaya SPPD & Laporan Guru
        Route::get('verifikasi', [BendaharaVerifikasiController::class, 'index'])->name('verifikasi.index');
        Route::post('verifikasi/{sppd}', [BendaharaVerifikasiController::class, 'verify'])->name('verifikasi.store');

        // Pengelolaan Anggaran Perjalanan Dinas
        Route::get('anggaran', [BendaharaAnggaranController::class, 'index'])->name('anggaran.index');
        Route::post('anggaran', [BendaharaAnggaranController::class, 'store'])->name('anggaran.store');
        Route::put('anggaran/{anggaran}', [BendaharaAnggaranController::class, 'update'])->name('anggaran.update');
        Route::delete('anggaran/{anggaran}', [BendaharaAnggaranController::class, 'destroy'])->name('anggaran.destroy');

        // Pembayaran Perjalanan Dinas
        Route::get('pembayaran', [BendaharaPembayaranController::class, 'index'])->name('pembayaran.index');
        Route::get('riwayat-pembayaran', [BendaharaPembayaranController::class, 'riwayat'])->name('riwayat-pembayaran');
        Route::post('pembayaran/{biaya}', [BendaharaPembayaranController::class, 'process'])->name('pembayaran.process');
        Route::get('pembayaran/{biaya}/kuitansi', [BendaharaPembayaranController::class, 'printKuitansi'])->name('pembayaran.kuitansi');

        // Data Biaya & Standar Tarif Kebijakan Sekolah
        Route::get('data-biaya', [BendaharaDataBiayaController::class, 'index'])->name('data-biaya.index');
        Route::post('data-biaya', [BendaharaDataBiayaController::class, 'store'])->name('data-biaya.store');
        Route::put('data-biaya/{standarBiaya}', [BendaharaDataBiayaController::class, 'update'])->name('data-biaya.update');
        Route::delete('data-biaya/{standarBiaya}', [BendaharaDataBiayaController::class, 'destroy'])->name('data-biaya.destroy');
        Route::put('data-biaya/adjust/{biaya}', [BendaharaDataBiayaController::class, 'adjustSppdBiaya'])->name('data-biaya.adjust');
    });

    // 8. Dokumen Perjalanan Dinas & Cetak
    Route::get('dokumen', [DokumenController::class, 'index'])->name('dokumen.index');
    Route::post('dokumen/{sppd}/upload', [DokumenController::class, 'upload'])->name('dokumen.upload');
    Route::delete('dokumen/{dokumen}', [DokumenController::class, 'destroy'])->name('dokumen.destroy');
    Route::post('dokumen/{sppd}/laporan', [DokumenController::class, 'storeLaporan'])->name('dokumen.store-laporan');

    // Cetak Dokumen Resmi
    Route::get('dokumen/print/surat-tugas/{sppd}', [DokumenPrintController::class, 'printSuratTugas'])->name('dokumen.print-surat-tugas');
    Route::get('dokumen/print/sppd/{sppd}', [DokumenPrintController::class, 'printSppd'])->name('dokumen.print-sppd');
    Route::get('dokumen/print/rincian-biaya/{sppd}', [DokumenPrintController::class, 'printRincianBiaya'])->name('dokumen.print-rincian-biaya');
    Route::get('dokumen/print/laporan/{sppd}', [DokumenPrintController::class, 'printLaporan'])->name('dokumen.print-laporan');

    // 9. Laporan Perjalanan Guru (Form penyerahan laporan & bukti kegiatan)
    Route::get('laporan-perjalanan', [GuruLaporanController::class, 'index'])->name('guru.laporan.index');
    Route::post('laporan-perjalanan/{sppd}', [GuruLaporanController::class, 'store'])->name('guru.laporan.store');

    // 10. Laporan Global & Rekap Ekspor (Admin / Pimpinan)
    Route::get('laporan', [LaporanController::class, 'index'])->name('laporan.index');
    Route::get('laporan/export', [LaporanController::class, 'export'])->name('laporan.export');

    // 11. Pusat Notifikasi
    Route::get('notifikasi', [NotificationController::class, 'index'])->name('notifikasi.index');
    Route::post('notifikasi/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifikasi.read-all');
    Route::post('notifikasi/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifikasi.read');
});

require __DIR__.'/settings.php';
