<?php

namespace App\Http\Controllers;

use App\Models\Sppd;
use Inertia\Inertia;
use Inertia\Response;

class DokumenPrintController extends Controller
{
    /**
     * Print Surat Perintah Tugas (SPT).
     */
    public function printSuratTugas(Sppd $sppd): Response
    {
        $sppd->load(['pegawai', 'pejabatPemberiPerintah', 'pengikuts.pegawai']);

        return Inertia::render('dokumen/print-surat-tugas', [
            'sppd' => $sppd,
        ]);
    }

    /**
     * Print official 9-point SPPD Form (Lembar I & Lembar II Visum).
     */
    public function printSppd(Sppd $sppd): Response
    {
        $sppd->load(['pegawai', 'pejabatPemberiPerintah', 'pengikuts.pegawai', 'biaya']);

        return Inertia::render('dokumen/print-sppd', [
            'sppd' => $sppd,
        ]);
    }

    /**
     * Print Kuitansi / Rincian Biaya Riil Perjalanan Dinas.
     */
    public function printRincianBiaya(Sppd $sppd): Response
    {
        $sppd->load(['pegawai', 'pejabatPemberiPerintah', 'biaya']);

        return Inertia::render('dokumen/print-rincian-biaya', [
            'sppd' => $sppd,
        ]);
    }

    /**
     * Print Laporan Hasil Pelaksanaan Perjalanan Dinas.
     */
    public function printLaporan(Sppd $sppd): Response
    {
        $sppd->load(['pegawai', 'pejabatPemberiPerintah', 'pengikuts.pegawai', 'laporan']);

        return Inertia::render('dokumen/print-laporan', [
            'sppd' => $sppd,
        ]);
    }
}
