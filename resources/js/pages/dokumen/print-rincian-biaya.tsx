import { Head } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SppdPrintProps {
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
            mata_pelajaran?: string | null;
            status_guru?: string | null;
            golongan: string;
            jabatan: string;
            nama_bank: string;
            nomor_rekening: string;
        };
        pejabat_pemberi_perintah?: {
            nama: string;
            nip: string;
            jabatan: string;
            golongan: string;
        };
        biaya?: {
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
            nomor_bukti_kas?: string;
            tanggal_bayar?: string;
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
    const angka = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    n = Math.floor(n);
    if (n < 12) return angka[n];
    if (n < 20) return terbilang(n - 10) + ' Belas';
    if (n < 100) return terbilang(Math.floor(n / 10)) + ' Puluh ' + terbilang(n % 10);
    if (n < 200) return 'Seratus ' + terbilang(n - 100);
    if (n < 1000) return terbilang(Math.floor(n / 100)) + ' Ratus ' + terbilang(n % 100);
    if (n < 2000) return 'Seribu ' + terbilang(n - 1000);
    if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' Ribu ' + terbilang(n % 1000);
    if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' Juta ' + terbilang(n % 1000000);
    return terbilang(Math.floor(n / 1000000000)) + ' Miliar ' + terbilang(n % 1000000000);
}

function formatDateIndo(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function PrintRincianBiaya({ sppd }: SppdPrintProps) {
    const handlePrint = () => {
        window.print();
    };

    const total = sppd.biaya?.total_biaya || 0;
    const terbilangText = total > 0 ? terbilang(total).trim() + ' Rupiah' : 'Nol Rupiah';

    return (
        <>
            <Head title={`Rincian Biaya - ${sppd.nomor_sppd}`} />

            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-background/95 backdrop-blur-md p-2 rounded-xl shadow-lg border border-border print:hidden">
                <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                    <ArrowLeft className="size-4 mr-1.5" />
                    Kembali
                </Button>
                <Button
                    variant="default"
                    size="sm"
                    onClick={handlePrint}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-xs"
                >
                    <Printer className="size-4 mr-1.5" />
                    Cetak Kuitansi Biaya Riil
                </Button>
            </div>

            <div className="min-h-screen bg-neutral-100 py-8 text-neutral-900 print:bg-white print:py-0 print:text-black font-serif text-[12pt] leading-snug">
                <div className="mx-auto w-full max-w-[210mm] bg-white p-8 sm:p-12 md:p-14 shadow-md print:max-w-none print:p-0 print:shadow-none">
                    {/* Header Kop */}
                    <div className="flex items-center gap-4 border-b-4 border-double border-neutral-900 pb-2 mb-4">
                        <img
                            src="/images/logo-smk-budi-mulia.png"
                            alt="Logo SMK Budi Mulia Karawang"
                            className="size-16 object-contain shrink-0"
                        />
                        <div className="flex-1 text-center pr-16">
                            <h3 className="text-xs font-semibold tracking-wider uppercase font-sans">
                                Yayasan Pendidikan Budi Mulia
                            </h3>
                            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight font-sans text-neutral-950">
                                SMK BUDI MULIA KARAWANG
                            </h2>
                            <p className="text-[10pt] font-sans text-neutral-600">
                                Jl. Raya Kosambi - Telagasari, Kec. Klari, Kabupaten Karawang, Jawa Barat 41371 • Telp: (0267) 8616188
                            </p>
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <h1 className="text-base font-bold tracking-wider uppercase underline underline-offset-2">
                            RINCIAN BIAYA RIIL PERJALANAN DINAS GURU
                        </h1>
                        <p className="text-xs text-neutral-600 mt-0.5">
                            Lampiran SPPD Nomor: {sppd.nomor_sppd} • Surat Tugas: {sppd.nomor_sp}
                        </p>
                    </div>

                    <div className="mb-4 text-xs space-y-1">
                        <div className="grid grid-cols-[160px_10px_1fr]">
                            <span>Nama Guru Pelaksana</span>
                            <span>:</span>
                            <span className="font-bold">{sppd.pegawai?.nama}</span>
                        </div>
                        <div className="grid grid-cols-[160px_10px_1fr]">
                            <span>NIP / NUPTK</span>
                            <span>:</span>
                            <span>{sppd.pegawai?.nip || '-'} / NUPTK: {sppd.pegawai?.nuptk || '-'}</span>
                        </div>
                        <div className="grid grid-cols-[160px_10px_1fr]">
                            <span>Mata Pelajaran / Status</span>
                            <span>:</span>
                            <span>{sppd.pegawai?.mata_pelajaran || '-'} / {sppd.pegawai?.status_guru || 'GTY'}</span>
                        </div>
                        <div className="grid grid-cols-[160px_10px_1fr]">
                            <span>Tujuan / Jadwal</span>
                            <span>:</span>
                            <span>
                                {sppd.tempat_tujuan} ({sppd.lama_hari} hari, {formatDateIndo(sppd.tanggal_berangkat)} s.d. {formatDateIndo(sppd.tanggal_kembali)})
                            </span>
                        </div>
                        <div className="grid grid-cols-[160px_10px_1fr]">
                            <span>Pos Anggaran (RKAS)</span>
                            <span>:</span>
                            <span className="font-mono">{sppd.mata_anggaran}</span>
                        </div>
                        <div className="grid grid-cols-[160px_10px_1fr]">
                            <span>Rekening Pencairan</span>
                            <span>:</span>
                            <span>{sppd.pegawai?.nama_bank} - {sppd.pegawai?.nomor_rekening}</span>
                        </div>
                        {sppd.biaya?.nomor_bukti_kas && (
                            <div className="grid grid-cols-[160px_10px_1fr]">
                                <span>No. Bukti Kas (BKK)</span>
                                <span>:</span>
                                <span className="font-mono font-semibold">{sppd.biaya.nomor_bukti_kas}</span>
                            </div>
                        )}
                    </div>

                    {/* Table Rincian Biaya */}
                    <table className="w-full border-collapse border border-neutral-800 text-[10.5pt]">
                        <thead>
                            <tr className="bg-neutral-100 font-bold">
                                <th className="border border-neutral-800 p-2 text-center w-8">No</th>
                                <th className="border border-neutral-800 p-2">Rincian Pengeluaran</th>
                                <th className="border border-neutral-800 p-2 text-center w-32">Volume</th>
                                <th className="border border-neutral-800 p-2 text-right w-36">Tarif Satuan (Rp)</th>
                                <th className="border border-neutral-800 p-2 text-right w-36">Jumlah (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-neutral-800 p-2 text-center">1</td>
                                <td className="border border-neutral-800 p-2 font-medium">
                                    Uang Harian Guru
                                    <div className="text-[9.5pt] text-neutral-600">Uang saku, makan & konsumsi kegiatan dinas</div>
                                </td>
                                <td className="border border-neutral-800 p-2 text-center">{sppd.biaya?.uang_harian_hari} Hari</td>
                                <td className="border border-neutral-800 p-2 text-right">{formatRupiah(sppd.biaya?.uang_harian_per_hari || 0)}</td>
                                <td className="border border-neutral-800 p-2 text-right font-semibold">
                                    {formatRupiah(sppd.biaya?.uang_harian_total || 0)}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-neutral-800 p-2 text-center">2</td>
                                <td className="border border-neutral-800 p-2 font-medium">
                                    Biaya Transportasi
                                    <div className="text-[9.5pt] text-neutral-600">BBM / Tol / Tiket Kereta / Shuttle resmi PP</div>
                                </td>
                                <td className="border border-neutral-800 p-2 text-center">1 Paket</td>
                                <td className="border border-neutral-800 p-2 text-right">{formatRupiah(sppd.biaya?.biaya_transportasi || 0)}</td>
                                <td className="border border-neutral-800 p-2 text-right font-semibold">
                                    {formatRupiah(sppd.biaya?.biaya_transportasi || 0)}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-neutral-800 p-2 text-center">3</td>
                                <td className="border border-neutral-800 p-2 font-medium">
                                    Biaya Penginapan / Hotel
                                    <div className="text-[9.5pt] text-neutral-600">Tarif penginapan riil sesuai bukti kuitansi hotel</div>
                                </td>
                                <td className="border border-neutral-800 p-2 text-center">{sppd.biaya?.biaya_penginapan_malam} Malam</td>
                                <td className="border border-neutral-800 p-2 text-right">{formatRupiah(sppd.biaya?.biaya_penginapan_per_malam || 0)}</td>
                                <td className="border border-neutral-800 p-2 text-right font-semibold">
                                    {formatRupiah(sppd.biaya?.biaya_penginapan_total || 0)}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-neutral-800 p-2 text-center">4</td>
                                <td className="border border-neutral-800 p-2 font-medium">
                                    Biaya Lainnya
                                    <div className="text-[9.5pt] text-neutral-600">{sppd.biaya?.keterangan_biaya_lainnya || 'Registrasi / Taksi / Parkir'}</div>
                                </td>
                                <td className="border border-neutral-800 p-2 text-center">1 Paket</td>
                                <td className="border border-neutral-800 p-2 text-right">{formatRupiah(sppd.biaya?.biaya_lainnya || 0)}</td>
                                <td className="border border-neutral-800 p-2 text-right font-semibold">
                                    {formatRupiah(sppd.biaya?.biaya_lainnya || 0)}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-neutral-900 bg-neutral-50 font-bold">
                                <td colSpan={4} className="border border-neutral-800 p-2 text-right uppercase">
                                    Jumlah Total Biaya :
                                </td>
                                <td className="border border-neutral-800 p-2 text-right text-sm">
                                    {formatRupiah(total)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Terbilang Box */}
                    <div className="mt-3 p-2.5 border border-neutral-800 rounded bg-neutral-50 text-xs italic">
                        <strong>Terbilang :</strong> {terbilangText}
                    </div>

                    {/* Signature Parties */}
                    <div className="mt-8 grid grid-cols-2 gap-8 text-xs text-center">
                        <div className="space-y-1">
                            <div>Telah diverifikasi & dibayarkan:</div>
                            <div className="font-semibold">Bendahara Sekolah,</div>
                            <div className="h-20" />
                            <div className="font-bold underline uppercase">Hj. Siti Aminah, S.E.</div>
                            <div>NIP. 19850614 201001 2 003</div>
                        </div>

                        <div className="space-y-1">
                            <div>Depok, {formatDateIndo(sppd.biaya?.tanggal_bayar || sppd.tanggal_berangkat)}</div>
                            <div className="font-semibold">Guru yang menerima / pelaksana,</div>
                            <div className="h-20" />
                            <div className="font-bold underline uppercase">{sppd.pegawai?.nama}</div>
                            <div>NIP/NUPTK. {sppd.pegawai?.nuptk || sppd.pegawai?.nip || '-'}</div>
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-4 text-center text-xs space-y-1">
                        <div>Mengetahui / Menyetujui:</div>
                        <div className="font-semibold">Kepala SMK Budi Mulia,</div>
                        <div className="h-20" />
                        <div className="font-bold underline uppercase">
                            {sppd.pejabat_pemberi_perintah?.nama || 'Dr. H. Ahmad Sudrajat, M.Pd'}
                        </div>
                        <div>NIP. {sppd.pejabat_pemberi_perintah?.nip || '19740510 199903 1 004'}</div>
                    </div>
                </div>
            </div>
        </>
    );
}
