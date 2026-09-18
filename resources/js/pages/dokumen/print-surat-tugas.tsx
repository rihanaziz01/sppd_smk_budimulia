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
        tingkat_biaya: string;
        alat_angkut: string;
        tanggal_berangkat: string;
        tanggal_kembali: string;
        lama_hari: number;
        instansi_pembebanan: string;
        mata_anggaran: string;
        keterangan?: string | null;
        pegawai?: {
            nama: string;
            nip: string;
            nuptk?: string | null;
            mata_pelajaran?: string | null;
            status_guru?: string | null;
            jabatan: string;
            unit_kerja: string;
            golongan: string;
        };
        pejabat_pemberi_perintah?: {
            nama: string;
            nip: string;
            jabatan: string;
            golongan: string;
        };
        pengikuts?: {
            id: number;
            keterangan?: string;
            pegawai?: {
                nama: string;
                nip: string;
                nuptk?: string | null;
                mata_pelajaran?: string | null;
                jabatan: string;
                golongan: string;
            };
        }[];
    };
}

function formatDateIndo(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function PrintSuratTugas({ sppd }: SppdPrintProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Surat Tugas - ${sppd.nomor_sp}`} />

            {/* Screen Floating Action Bar (Hidden on Print) */}
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
                    Cetak / Simpan PDF
                </Button>
            </div>

            {/* Document Sheet Layout (A4 format styled) */}
            <div className="min-h-screen bg-neutral-100 py-8 text-neutral-900 print:bg-white print:py-0 print:text-black">
                <div className="mx-auto w-full max-w-[210mm] bg-white p-8 sm:p-12 md:p-16 shadow-md print:max-w-none print:p-0 print:shadow-none font-serif text-[12pt] leading-relaxed">
                    {/* KOP SURAT SMK BUDI MULIA KARAWANG */}
                    <div className="flex items-center gap-4 border-b-4 border-double border-neutral-900 pb-3 mb-6">
                        <img
                            src="/images/logo-smk-budi-mulia.png"
                            alt="Logo SMK Budi Mulia Karawang"
                            className="size-20 object-contain shrink-0"
                        />
                        <div className="flex-1 text-center pr-20">
                            <h3 className="text-sm font-semibold tracking-wider uppercase font-sans">
                                Yayasan Pendidikan Budi Mulia
                            </h3>
                            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight font-sans mt-0.5 text-neutral-950">
                                SMK BUDI MULIA KARAWANG
                            </h2>
                            <p className="text-xs font-sans text-neutral-600 mt-1">
                                Jl. Raya Kosambi - Telagasari, Kec. Klari, Kabupaten Karawang, Jawa Barat 41371
                            </p>
                            <p className="text-xs font-sans text-neutral-600">
                                Telepon: (0267) 8616188 • Email: smkbudimulia.krw@gmail.com • Website: smkbudimuliakarawang.sch.id
                            </p>
                        </div>
                    </div>

                    {/* JUDUL SURAT */}
                    <div className="text-center mb-6">
                        <h1 className="text-base sm:text-lg font-bold tracking-wider uppercase underline underline-offset-4">
                            SURAT PERINTAH TUGAS
                        </h1>
                        <p className="text-xs sm:text-sm font-mono mt-1 font-semibold">
                            Nomor: {sppd.nomor_sp}
                        </p>
                    </div>

                    {/* DASAR HUKUM */}
                    <div className="mb-4 text-xs sm:text-sm space-y-1.5">
                        <div className="flex items-start">
                            <span className="w-20 font-semibold shrink-0">Dasar :</span>
                            <ol className="list-decimal pl-4 space-y-1">
                                <li>Program Kerja Pembinaan dan Peningkatan Kompetensi Guru SMK Budi Mulia Tahun Pelajaran 2026/2027.</li>
                                <li>
                                    Rencana Kegiatan dan Anggaran Sekolah (RKAS) SMK Budi Mulia Tahun Anggaran 2026 pada Pos {sppd.mata_anggaran}.
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* MEMERINTAHKAN */}
                    <div className="text-center my-4">
                        <span className="font-bold tracking-widest text-sm uppercase">MEMERINTAHKAN :</span>
                    </div>

                    {/* KEPADA */}
                    <div className="mb-4 text-xs sm:text-sm">
                        <div className="flex items-start mb-2">
                            <span className="w-20 font-semibold shrink-0">Kepada :</span>
                            <div className="flex-1 space-y-1">
                                <div className="grid grid-cols-[160px_10px_1fr]">
                                    <span>1. Nama Guru</span>
                                    <span>:</span>
                                    <span className="font-bold">{sppd.pegawai?.nama}</span>
                                </div>
                                <div className="grid grid-cols-[160px_10px_1fr]">
                                    <span>&nbsp;&nbsp;&nbsp;NIP / NIK</span>
                                    <span>:</span>
                                    <span>{sppd.pegawai?.nip || '-'}</span>
                                </div>
                                <div className="grid grid-cols-[160px_10px_1fr]">
                                    <span>&nbsp;&nbsp;&nbsp;NUPTK</span>
                                    <span>:</span>
                                    <span className="font-mono">{sppd.pegawai?.nuptk || '-'}</span>
                                </div>
                                <div className="grid grid-cols-[160px_10px_1fr]">
                                    <span>&nbsp;&nbsp;&nbsp;Mata Pelajaran / Keahlian</span>
                                    <span>:</span>
                                    <span>{sppd.pegawai?.mata_pelajaran || '-'}</span>
                                </div>
                                <div className="grid grid-cols-[160px_10px_1fr]">
                                    <span>&nbsp;&nbsp;&nbsp;Status Kepegawaian</span>
                                    <span>:</span>
                                    <span>{sppd.pegawai?.status_guru || 'GTY'}</span>
                                </div>
                                <div className="grid grid-cols-[160px_10px_1fr]">
                                    <span>&nbsp;&nbsp;&nbsp;Jabatan</span>
                                    <span>:</span>
                                    <span>{sppd.pegawai?.jabatan}</span>
                                </div>
                                <div className="grid grid-cols-[160px_10px_1fr]">
                                    <span>&nbsp;&nbsp;&nbsp;Unit Kerja</span>
                                    <span>:</span>
                                    <span>{sppd.pegawai?.unit_kerja || 'SMK Budi Mulia'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Pengikut jika ada */}
                        {sppd.pengikuts && sppd.pengikuts.length > 0 && (
                            <div className="ml-20 mt-3">
                                <span className="font-semibold block mb-1">Rekan Guru Pendamping / Pengikut :</span>
                                <table className="w-full border-collapse border border-neutral-800 text-[10pt]">
                                    <thead>
                                        <tr className="bg-neutral-100 font-semibold">
                                            <th className="border border-neutral-800 p-1.5 text-center w-8">No</th>
                                            <th className="border border-neutral-800 p-1.5">Nama Guru / NUPTK</th>
                                            <th className="border border-neutral-800 p-1.5">Mata Pelajaran</th>
                                            <th className="border border-neutral-800 p-1.5">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sppd.pengikuts.map((item, idx) => (
                                            <tr key={item.id}>
                                                <td className="border border-neutral-800 p-1.5 text-center">{idx + 1}</td>
                                                <td className="border border-neutral-800 p-1.5">
                                                    <div className="font-semibold">{item.pegawai?.nama}</div>
                                                    <div className="text-[9pt] text-neutral-600">NUPTK: {item.pegawai?.nuptk || item.pegawai?.nip || '-'}</div>
                                                </td>
                                                <td className="border border-neutral-800 p-1.5">{item.pegawai?.mata_pelajaran || item.pegawai?.jabatan}</td>
                                                <td className="border border-neutral-800 p-1.5">{item.keterangan || 'Pendamping'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* UNTUK */}
                    <div className="mb-6 text-xs sm:text-sm">
                        <div className="flex items-start">
                            <span className="w-20 font-semibold shrink-0">Untuk :</span>
                            <ol className="list-decimal pl-4 space-y-1.5 flex-1">
                                <li>
                                    Melaksanakan perjalanan dinas guru dalam rangka: <strong className="font-semibold">{sppd.maksud_tujuan}</strong>.
                                </li>
                                <li>
                                    Tempat tujuan penugasan ke: <strong>{sppd.tempat_tujuan}</strong>.
                                </li>
                                <li>
                                    Lama penugasan selama <strong>{sppd.lama_hari} (hari)</strong>, terhitung mulai tanggal{' '}
                                    <strong>{formatDateIndo(sppd.tanggal_berangkat)}</strong> sampai dengan tanggal{' '}
                                    <strong>{formatDateIndo(sppd.tanggal_kembali)}</strong>.
                                </li>
                                <li>
                                    Alat transportasi yang digunakan adalah: <strong>{sppd.alat_angkut}</strong>.
                                </li>
                                <li>
                                    Biaya perjalanan dinas dibebankan pada Anggaran <strong>{sppd.instansi_pembebanan}</strong> ({sppd.mata_anggaran}).
                                </li>
                                {sppd.keterangan && (
                                    <li>
                                        Catatan khusus: <em>{sppd.keterangan}</em>.
                                    </li>
                                )}
                                <li>
                                    Setelah selesai melaksanakan tugas, segera melaporkan hasil pelaksanaan tugas dan menyerahkan bukti pertanggungjawaban kepada Kepala Sekolah.
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* PENUTUP & TANDA TANGAN */}
                    <div className="mt-8 flex justify-end text-xs sm:text-sm">
                        <div className="w-72 text-left space-y-1">
                            <div>Dikeluarkan di : {sppd.tempat_berangkat || 'Depok'}</div>
                            <div>Pada tanggal &nbsp;: {formatDateIndo(sppd.tanggal_berangkat)}</div>
                            <div className="pt-2 font-semibold">
                                {sppd.pejabat_pemberi_perintah?.jabatan || 'Kepala SMK Budi Mulia'},
                            </div>

                            {/* Spacing for physical signature & school seal */}
                            <div className="h-20" />

                            <div className="font-bold underline uppercase">
                                {sppd.pejabat_pemberi_perintah?.nama || 'Dr. H. Ahmad Sudrajat, M.Pd'}
                            </div>
                            <div>{sppd.pejabat_pemberi_perintah?.golongan || 'Pembina Tk. I (IV/b)'}</div>
                            <div>NIP. {sppd.pejabat_pemberi_perintah?.nip || '19740510 199903 1 004'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
