import { Head } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BiayaPrintProps {
    biaya: {
        id: number;
        uang_harian_hari: number;
        uang_harian_per_hari: number;
        uang_harian_total: number;
        biaya_transportasi: number;
        biaya_penginapan_malam: number;
        biaya_penginapan_per_malam: number;
        biaya_penginapan_total: number;
        biaya_lainnya: number;
        keterangan_biaya_lainnya?: string;
        total_biaya: number;
        status_pembayaran: string;
        tanggal_bayar?: string;
        metode_pembayaran?: string;
        nomor_bukti_kas?: string;
        catatan_bendahara?: string;
        anggaran?: {
            nama_anggaran: string;
            kode_rekening?: string;
        };
    };
    sppd: {
        id: number;
        nomor_sp: string;
        nomor_sppd: string;
        maksud_tujuan: string;
        tempat_berangkat: string;
        tempat_tujuan: string;
        tanggal_berangkat: string;
        tanggal_kembali: string;
        lama_hari: number;
        mata_anggaran: string;
        pegawai?: {
            nama: string;
            nip: string;
            nuptk?: string | null;
            golongan: string;
            jabatan: string;
            nama_bank: string;
            nomor_rekening: string;
        };
        pejabat_pemberi_perintah?: {
            nama: string;
            nip: string;
            jabatan: string;
        };
    };
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

function terbilang(n: number): string {
    const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    n = Math.floor(n);
    if (n < 12) return satuan[n];
    if (n < 20) return terbilang(n - 10) + ' Belas';
    if (n < 100) return terbilang(Math.floor(n / 10)) + ' Puluh ' + terbilang(n % 10);
    if (n < 200) return 'Seratus ' + terbilang(n - 100);
    if (n < 1000) return terbilang(Math.floor(n / 100)) + ' Ratus ' + terbilang(n % 100);
    if (n < 2000) return 'Seribu ' + terbilang(n - 1000);
    if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' Ribu ' + terbilang(n % 1000);
    if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' Juta ' + terbilang(n % 1000000);
    if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + ' Milyar ' + terbilang(n % 1000000000);
    return '';
}

export default function PrintKuitansiBayar({ biaya, sppd }: BiayaPrintProps) {
    const handlePrint = () => {
        window.print();
    };

    const tanggalBayarFormatted = biaya.tanggal_bayar
        ? new Date(biaya.tanggal_bayar).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          });

    return (
        <>
            <Head title={`Kuitansi Pembayaran SPPD - ${sppd.nomor_sppd}`} />

            {/* Screen Controls */}
            <div className="no-print bg-neutral-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali
                    </button>
                    <span className="text-neutral-500">|</span>
                    <span className="text-xs font-medium text-neutral-300">
                        Kuitansi Kas Keluar SPPD: {biaya.nomor_bukti_kas || sppd.nomor_sppd}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handlePrint}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4"
                    >
                        <Printer className="size-3.5 mr-1.5" />
                        Cetak Kuitansi Kas (A4)
                    </Button>
                </div>
            </div>

            {/* A4 Sheet Container */}
            <div className="min-h-screen bg-neutral-100 py-8 px-4 print:p-0 print:bg-white flex justify-center">
                <div className="w-full max-w-[210mm] bg-white p-8 md:p-12 shadow-md print:shadow-none print:p-6 text-black font-serif text-sm leading-normal border border-neutral-200 print:border-none">
                    {/* Official Kop SMK Budi Mulia */}
                    <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-6">
                        <div className="flex items-center gap-4">
                            <img
                                src="/images/logo-smk-budi-mulia.png"
                                alt="Logo SMK Budi Mulia"
                                className="h-20 w-20 object-contain"
                            />
                            <div>
                                <h3 className="text-xs uppercase font-bold tracking-wider">
                                    Yayasan Pendidikan Budi Mulia
                                </h3>
                                <h1 className="text-lg font-extrabold uppercase tracking-wide">
                                    SMK BUDI MULIA KARAWANG
                                </h1>
                                <p className="text-[11px] font-sans text-neutral-700">
                                    NPSN: 69947821 • Akreditasi "A" (Unggul) • Program Keahlian: TKJ, RPL, DKV, Akuntansi
                                </p>
                                <p className="text-[11px] font-sans text-neutral-600">
                                    Jl. Raya Budi Mulia No. 45, Telukjambe Timur, Karawang 41361 • Telp: (0267) 8451234
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Judul Dokumen */}
                    <div className="text-center mb-6">
                        <h2 className="text-base font-bold underline uppercase tracking-wider">
                            KUITANSI PENGELUARAN KAS / BUKTI PEMBAYARAN
                        </h2>
                        <div className="text-xs font-mono mt-1 font-semibold">
                            Nomor BKU: {biaya.nomor_bukti_kas || 'BKU-SPPD/2026/BM/001'}
                        </div>
                        <div className="text-[11px] text-neutral-600 mt-0.5">
                            Mata Anggaran: {biaya.anggaran?.nama_anggaran || sppd.mata_anggaran || '5.1.02.04.01.0001 (BOS / Rutin)'}
                        </div>
                    </div>

                    {/* Body Kuitansi */}
                    <div className="space-y-4 text-xs font-sans">
                        <table className="w-full border-collapse">
                            <tbody>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-2.5 w-44 font-semibold text-neutral-700">Sudah Diterima Dari</td>
                                    <td className="py-2.5 w-4">:</td>
                                    <td className="py-2.5 font-bold uppercase">Bendahara SMK Budi Mulia Karawang</td>
                                </tr>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-2.5 font-semibold text-neutral-700">Uang Sejumlah</td>
                                    <td className="py-2.5">:</td>
                                    <td className="py-2.5 font-extrabold italic bg-neutral-100 px-2 rounded">
                                        "{terbilang(biaya.total_biaya).trim()} Rupiah"
                                    </td>
                                </tr>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-2.5 font-semibold text-neutral-700">Untuk Keperluan</td>
                                    <td className="py-2.5">:</td>
                                    <td className="py-2.5 leading-relaxed">
                                        Pembayaran Biaya Perjalanan Dinas Kedinasan dalam rangka:{' '}
                                        <span className="font-semibold">{sppd.maksud_tujuan}</span>, dengan tujuan ke{' '}
                                        <span className="font-semibold">{sppd.tempat_tujuan}</span> selama {sppd.lama_hari} hari
                                        (berdasarkan Surat Tugas No: {sppd.nomor_sp} dan Lembar SPPD No: {sppd.nomor_sppd}).
                                    </td>
                                </tr>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-2.5 font-semibold text-neutral-700">Metode Penyaluran</td>
                                    <td className="py-2.5">:</td>
                                    <td className="py-2.5 font-medium">
                                        {biaya.metode_pembayaran || 'Transfer Bank'} ke Rekening{' '}
                                        <span className="font-bold">
                                            {sppd.pegawai?.nama_bank} No. {sppd.pegawai?.nomor_rekening}
                                        </span>{' '}
                                        a.n. <span className="font-bold">{sppd.pegawai?.nama}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Rincian Komponen Biaya */}
                        <div className="pt-2">
                            <h4 className="font-bold text-xs uppercase mb-1 text-neutral-800">
                                Rincian Perhitungan Biaya:
                            </h4>
                            <table className="w-full border border-neutral-300 text-xs">
                                <thead>
                                    <tr className="bg-neutral-100 border-b border-neutral-300 font-bold text-left">
                                        <th className="p-2 w-10 text-center">No</th>
                                        <th className="p-2">Uraian Komponen Biaya</th>
                                        <th className="p-2 text-right">Volume</th>
                                        <th className="p-2 text-right">Satuan Tarif</th>
                                        <th className="p-2 text-right">Jumlah (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-neutral-200">
                                        <td className="p-2 text-center">1</td>
                                        <td className="p-2">Uang Harian / Uang Saku Guru</td>
                                        <td className="p-2 text-right">{biaya.uang_harian_hari} Hari</td>
                                        <td className="p-2 text-right font-mono">{formatRupiah(biaya.uang_harian_per_hari)}</td>
                                        <td className="p-2 text-right font-bold font-mono">{formatRupiah(biaya.uang_harian_total)}</td>
                                    </tr>
                                    <tr className="border-b border-neutral-200">
                                        <td className="p-2 text-center">2</td>
                                        <td className="p-2">Biaya Tiket / Transportasi PP</td>
                                        <td className="p-2 text-right">1 Paket</td>
                                        <td className="p-2 text-right font-mono">-</td>
                                        <td className="p-2 text-right font-bold font-mono">{formatRupiah(biaya.biaya_transportasi)}</td>
                                    </tr>
                                    <tr className="border-b border-neutral-200">
                                        <td className="p-2 text-center">3</td>
                                        <td className="p-2">Biaya Penginapan / Akomodasi Hotel</td>
                                        <td className="p-2 text-right">{biaya.biaya_penginapan_malam} Malam</td>
                                        <td className="p-2 text-right font-mono">{formatRupiah(biaya.biaya_penginapan_per_malam)}</td>
                                        <td className="p-2 text-right font-bold font-mono">{formatRupiah(biaya.biaya_penginapan_total)}</td>
                                    </tr>
                                    <tr className="border-b border-neutral-200">
                                        <td className="p-2 text-center">4</td>
                                        <td className="p-2">Biaya Lainnya ({biaya.keterangan_biaya_lainnya || 'Registrasi/Materi'})</td>
                                        <td className="p-2 text-right">1 Kegiatan</td>
                                        <td className="p-2 text-right font-mono">-</td>
                                        <td className="p-2 text-right font-bold font-mono">{formatRupiah(biaya.biaya_lainnya)}</td>
                                    </tr>
                                    <tr className="bg-neutral-100 font-bold">
                                        <td colSpan={4} className="p-2 text-right uppercase">Total Dibayarkan:</td>
                                        <td className="p-2 text-right font-mono text-sm">{formatRupiah(biaya.total_biaya)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Nominal Box Besar */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="border-2 border-black px-4 py-2 text-base font-extrabold font-mono tracking-wider">
                                {formatRupiah(biaya.total_biaya)}
                            </div>
                            <div className="text-right text-xs">
                                Karawang, {tanggalBayarFormatted}
                            </div>
                        </div>

                        {/* Lembar Tanda Tangan 3 Pihak */}
                        <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs">
                            {/* Mengetahui Kepala Sekolah */}
                            <div className="space-y-16">
                                <div>
                                    <p className="font-semibold">Mengetahui,</p>
                                    <p className="text-neutral-700">Kepala SMK Budi Mulia</p>
                                </div>
                                <div>
                                    <p className="font-bold underline">
                                        {sppd.pejabat_pemberi_perintah?.nama || 'Dr. H. Ahmad Sudrajat, M.Pd.'}
                                    </p>
                                    <p className="text-[11px] text-neutral-600">
                                        NIP: {sppd.pejabat_pemberi_perintah?.nip || '19740512 200003 1 001'}
                                    </p>
                                </div>
                            </div>

                            {/* Bendahara Sekolah */}
                            <div className="space-y-16">
                                <div>
                                    <p className="font-semibold">Lunas Dibayarkan,</p>
                                    <p className="text-neutral-700">Bendahara Sekolah</p>
                                </div>
                                <div>
                                    <p className="font-bold underline">Hj. Siti Aminah, S.E.</p>
                                    <p className="text-[11px] text-neutral-600">NIP: 19821120 200604 2 015</p>
                                </div>
                            </div>

                            {/* Guru Penerima */}
                            <div className="space-y-16">
                                <div>
                                    <p className="font-semibold">Yang Menerima,</p>
                                    <p className="text-neutral-700">Guru Yang Ditugaskan</p>
                                </div>
                                <div>
                                    <p className="font-bold underline">{sppd.pegawai?.nama}</p>
                                    <p className="text-[11px] text-neutral-600">NIP: {sppd.pegawai?.nip}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; background: white; }
                    @page { size: A4 portrait; margin: 15mm; }
                }
            `}</style>
        </>
    );
}
