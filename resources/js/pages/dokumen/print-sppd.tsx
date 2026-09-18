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

export default function PrintSppd({ sppd }: SppdPrintProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Form SPPD - ${sppd.nomor_sppd}`} />

            {/* Screen Floating Action Bar */}
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
                    Cetak SPPD (Lembar I & II)
                </Button>
            </div>

            <div className="min-h-screen bg-neutral-100 py-8 text-neutral-900 print:bg-white print:py-0 print:text-black font-serif text-[11pt] leading-snug">
                {/* LEMBAR 1: FORM SPPD 9 POIN */}
                <div className="mx-auto w-full max-w-[210mm] bg-white p-8 sm:p-12 md:p-14 shadow-md print:max-w-none print:p-0 print:shadow-none mb-8 print:mb-0 print:break-after-page">
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

                    {/* Judul & Nomor Lembar I */}
                    <div className="flex justify-between items-start mb-3 text-xs">
                        <div />
                        <div className="space-y-0.5">
                            <div>Lembar ke &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: I (Satu)</div>
                            <div>Pos Anggaran &nbsp;&nbsp;: {sppd.mata_anggaran}</div>
                            <div>Nomor SPPD : <strong>{sppd.nomor_sppd}</strong></div>
                        </div>
                    </div>

                    <div className="text-center mb-4">
                        <h1 className="text-base font-bold tracking-wider uppercase underline underline-offset-2">
                            SURAT PERINTAH PERJALANAN DINAS (SPPD)
                        </h1>
                    </div>

                    {/* Table 9 Poin Standar Perpres / PMK Diselaraskan dengan Guru SMK */}
                    <table className="w-full border-collapse border border-neutral-800 text-[10.5pt]">
                        <tbody>
                            <tr>
                                <td className="border border-neutral-800 p-1.5 text-center w-8 font-semibold">1.</td>
                                <td className="border border-neutral-800 p-1.5 w-60">Pejabat Berwenang yang Memberi Perintah</td>
                                <td className="border border-neutral-800 p-1.5">
                                    {sppd.pejabat_pemberi_perintah?.jabatan || 'Kepala SMK Budi Mulia'}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-neutral-800 p-1.5 text-center font-semibold">2.</td>
                                <td className="border border-neutral-800 p-1.5">Nama Guru yang diperintahkan</td>
                                <td className="border border-neutral-800 p-1.5 font-bold">
                                    {sppd.pegawai?.nama}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-neutral-800 p-1.5 text-center font-semibold">3.</td>
                                <td className="border border-neutral-800 p-1.5">
                                    a. NIP / NUPTK<br />
                                    b. Mata Pelajaran / Status Guru<br />
                                    c. Jabatan / Unit Kerja<br />
                                    d. Tingkat Biaya Perjalanan Dinas
                                </td>
                                <td className="border border-neutral-800 p-1.5">
                                    a. {sppd.pegawai?.nip || '-'} / NUPTK: {sppd.pegawai?.nuptk || '-'}<br />
                                    b. {sppd.pegawai?.mata_pelajaran || '-'} / {sppd.pegawai?.status_guru || 'GTY'}<br />
                                    c. {sppd.pegawai?.jabatan} / {sppd.pegawai?.unit_kerja || 'SMK Budi Mulia'}<br />
                                    d. {sppd.tingkat_biaya}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-neutral-800 p-1.5 text-center font-semibold">4.</td>
                                <td className="border border-neutral-800 p-1.5">Maksud Perjalanan Dinas</td>
                                <td className="border border-neutral-800 p-1.5 font-medium">
                                    {sppd.maksud_tujuan}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-neutral-800 p-1.5 text-center font-semibold">5.</td>
                                <td className="border border-neutral-800 p-1.5">Alat angkutan yang dipergunakan</td>
                                <td className="border border-neutral-800 p-1.5">
                                    {sppd.alat_angkut}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-neutral-800 p-1.5 text-center font-semibold">6.</td>
                                <td className="border border-neutral-800 p-1.5">
                                    a. Tempat berangkat<br />
                                    b. Tempat tujuan
                                </td>
                                <td className="border border-neutral-800 p-1.5">
                                    a. {sppd.tempat_berangkat}<br />
                                    b. <strong>{sppd.tempat_tujuan}</strong>
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-neutral-800 p-1.5 text-center font-semibold">7.</td>
                                <td className="border border-neutral-800 p-1.5">
                                    a. Lamanya Perjalanan Dinas<br />
                                    b. Tanggal berangkat<br />
                                    c. Tanggal harus kembali / tiba
                                </td>
                                <td className="border border-neutral-800 p-1.5">
                                    a. {sppd.lama_hari} (hari)<br />
                                    b. {formatDateIndo(sppd.tanggal_berangkat)}<br />
                                    c. {formatDateIndo(sppd.tanggal_kembali)}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-neutral-800 p-1.5 text-center font-semibold">8.</td>
                                <td className="border border-neutral-800 p-1.5">
                                    Pengikut / Rekan Guru Pendamping
                                </td>
                                <td className="border border-neutral-800 p-1.5">
                                    {sppd.pengikuts && sppd.pengikuts.length > 0 ? (
                                        <ol className="list-decimal pl-4 space-y-0.5">
                                            {sppd.pengikuts.map((p) => (
                                                <li key={p.id}>
                                                    {p.pegawai?.nama} ({p.pegawai?.mata_pelajaran || p.pegawai?.jabatan})
                                                </li>
                                            ))}
                                        </ol>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-neutral-800 p-1.5 text-center font-semibold">9.</td>
                                <td className="border border-neutral-800 p-1.5">
                                    Pembebanan Anggaran<br />
                                    a. Instansi / Sekolah<br />
                                    b. Pos Anggaran / Akun
                                </td>
                                <td className="border border-neutral-800 p-1.5">
                                    <br />
                                    a. {sppd.instansi_pembebanan}<br />
                                    b. {sppd.mata_anggaran}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-neutral-800 p-1.5 text-center font-semibold">10.</td>
                                <td className="border border-neutral-800 p-1.5">Keterangan lain-lain</td>
                                <td className="border border-neutral-800 p-1.5 text-xs text-neutral-600">
                                    Surat Tugas: {sppd.nomor_sp} {sppd.keterangan ? `• ${sppd.keterangan}` : ''}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* TTD Kepala Sekolah */}
                    <div className="mt-6 flex justify-end text-xs sm:text-sm">
                        <div className="w-72 text-left space-y-1">
                            <div>Dikeluarkan di : {sppd.tempat_berangkat || 'Depok'}</div>
                            <div>Pada tanggal &nbsp;: {formatDateIndo(sppd.tanggal_berangkat)}</div>
                            <div className="pt-1 font-semibold">
                                {sppd.pejabat_pemberi_perintah?.jabatan || 'Kepala SMK Budi Mulia'},
                            </div>
                            <div className="h-20" />
                            <div className="font-bold underline uppercase">
                                {sppd.pejabat_pemberi_perintah?.nama || 'Dr. H. Ahmad Sudrajat, M.Pd'}
                            </div>
                            <div>{sppd.pejabat_pemberi_perintah?.golongan || 'Pembina Tk. I (IV/b)'}</div>
                            <div>NIP. {sppd.pejabat_pemberi_perintah?.nip || '19740510 199903 1 004'}</div>
                        </div>
                    </div>
                </div>

                {/* LEMBAR 2: LEMBAR VISUM (CAP & TANDA TANGAN KEDATANGAN / KEPULANGAN) */}
                <div className="mx-auto w-full max-w-[210mm] bg-white p-8 sm:p-12 md:p-14 shadow-md print:max-w-none print:p-0 print:shadow-none">
                    <div className="text-center mb-4">
                        <h2 className="text-sm font-bold tracking-wider uppercase underline underline-offset-2">
                            LEMBAR VISUM PERJALANAN DINAS
                        </h2>
                        <p className="text-xs text-neutral-600 mt-0.5">SPPD Nomor: {sppd.nomor_sppd}</p>
                    </div>

                    <table className="w-full border-collapse border border-neutral-800 text-[10pt]">
                        <tbody>
                            {/* Kotak I: Berangkat dari sekolah */}
                            <tr>
                                <td className="border border-neutral-800 p-2 w-1/2 align-top h-36">
                                    <div className="space-y-1">
                                        <div className="font-semibold">I. Berangkat dari : {sppd.tempat_berangkat || 'SMK Budi Mulia, Depok'}</div>
                                        <div>Pada tanggal &nbsp;&nbsp;&nbsp;&nbsp;: {formatDateIndo(sppd.tanggal_berangkat)}</div>
                                        <div>Ke &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {sppd.tempat_tujuan}</div>
                                        <div className="pt-2 font-semibold">{sppd.pejabat_pemberi_perintah?.jabatan || 'Kepala SMK Budi Mulia'},</div>
                                        <div className="h-12" />
                                        <div className="font-bold underline uppercase">
                                            {sppd.pejabat_pemberi_perintah?.nama || 'Dr. H. Ahmad Sudrajat, M.Pd'}
                                        </div>
                                        <div>NIP. {sppd.pejabat_pemberi_perintah?.nip || '19740510 199903 1 004'}</div>
                                    </div>
                                </td>
                                <td className="border border-neutral-800 p-2 w-1/2 align-top h-36">
                                    <div className="space-y-1">
                                        <div className="font-semibold">II. Tiba di &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {sppd.tempat_tujuan}</div>
                                        <div>Pada tanggal &nbsp;: ....................................................</div>
                                        <div className="pt-2 font-semibold">Pejabat / Penyelenggara yang mengesahkan kedatangan,</div>
                                        <div className="h-12" />
                                        <div>(...................................................................)</div>
                                        <div>NIP / Cap Instansi. ...........................................................</div>
                                    </div>
                                </td>
                            </tr>

                            {/* Kotak II: Berangkat dari tempat tujuan */}
                            <tr>
                                <td className="border border-neutral-800 p-2 w-1/2 align-top h-36">
                                    <div className="space-y-1">
                                        <div className="font-semibold">Berangkat dari : {sppd.tempat_tujuan}</div>
                                        <div>Ke &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {sppd.tempat_berangkat || 'SMK Budi Mulia, Depok'}</div>
                                        <div>Pada tanggal &nbsp;&nbsp;&nbsp;&nbsp;: {formatDateIndo(sppd.tanggal_kembali)}</div>
                                        <div className="pt-2 font-semibold">Pejabat / Penyelenggara yang mengesahkan,</div>
                                        <div className="h-12" />
                                        <div>(...................................................................)</div>
                                        <div>NIP / Cap Instansi. ...........................................................</div>
                                    </div>
                                </td>
                                <td className="border border-neutral-800 p-2 w-1/2 align-top h-36">
                                    <div className="space-y-1">
                                        <div className="font-semibold">III. Tiba kembali di : {sppd.tempat_berangkat || 'SMK Budi Mulia, Depok'}</div>
                                        <div>Pada tanggal &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {formatDateIndo(sppd.tanggal_kembali)}</div>
                                        <div className="pt-2 font-semibold">{sppd.pejabat_pemberi_perintah?.jabatan || 'Kepala SMK Budi Mulia'},</div>
                                        <div className="h-12" />
                                        <div className="font-bold underline uppercase">
                                            {sppd.pejabat_pemberi_perintah?.nama || 'Dr. H. Ahmad Sudrajat, M.Pd'}
                                        </div>
                                        <div>NIP. {sppd.pejabat_pemberi_perintah?.nip || '19740510 199903 1 004'}</div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-4 text-[10pt] text-neutral-600 italic border p-2.5 rounded bg-neutral-50">
                        Catatan: Lembar Visum ini wajib dibubuhi stempel/cap dan tanda tangan dari pejabat atau panitia penyelenggara di tempat tujuan sebagai bukti sah kehadiran pelaksanaan perjalanan dinas guru.
                    </div>
                </div>
            </div>
        </>
    );
}
