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
        alat_angkut: string;
        tanggal_berangkat: string;
        tanggal_kembali: string;
        lama_hari: number;
        pegawai?: {
            nama: string;
            nip: string;
            nuptk?: string | null;
            mata_pelajaran?: string | null;
            status_guru?: string | null;
            jabatan: string;
            golongan: string;
            unit_kerja: string;
        };
        pejabat_pemberi_perintah?: {
            nama: string;
            nip: string;
            jabatan: string;
            golongan: string;
        };
        pengikuts?: {
            id: number;
            pegawai?: {
                nama: string;
                nip: string;
                nuptk?: string | null;
                mata_pelajaran?: string | null;
                jabatan: string;
            };
        }[];
        laporan?: {
            ringkasan_kegiatan: string;
            hasil_kegiatan: string;
            kendala?: string;
            saran_tindak_lanjut?: string;
            tanggal_laporan: string;
        };
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

export default function PrintLaporan({ sppd }: SppdPrintProps) {
    const handlePrint = () => {
        window.print();
    };

    const laporan = sppd.laporan;

    return (
        <>
            <Head title={`Laporan Perjalanan - ${sppd.nomor_sppd}`} />

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
                    Cetak Laporan Perjalanan
                </Button>
            </div>

            <div className="min-h-screen bg-neutral-100 py-8 text-neutral-900 print:bg-white print:py-0 print:text-black font-serif text-[12pt] leading-relaxed">
                <div className="mx-auto w-full max-w-[210mm] bg-white p-8 sm:p-12 md:p-16 shadow-md print:max-w-none print:p-0 print:shadow-none">
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
                            LAPORAN HASIL PELAKSANAAN PERJALANAN DINAS GURU
                        </h1>
                    </div>

                    {/* Metadata Header */}
                    <div className="border border-neutral-800 p-3 rounded text-xs space-y-1 mb-6 bg-neutral-50/50">
                        <div className="grid grid-cols-[160px_10px_1fr]">
                            <span>Kepada Yth</span>
                            <span>:</span>
                            <span className="font-semibold">{sppd.pejabat_pemberi_perintah?.jabatan || 'Kepala SMK Budi Mulia'}</span>
                        </div>
                        <div className="grid grid-cols-[160px_10px_1fr]">
                            <span>Dari Guru Pelapor</span>
                            <span>:</span>
                            <span className="font-semibold">
                                {sppd.pegawai?.nama} {sppd.pegawai?.mata_pelajaran ? `(Guru ${sppd.pegawai?.mata_pelajaran})` : `(${sppd.pegawai?.jabatan})`}
                            </span>
                        </div>
                        <div className="grid grid-cols-[160px_10px_1fr]">
                            <span>Dasar Surat Tugas</span>
                            <span>:</span>
                            <span className="font-mono">{sppd.nomor_sp}</span>
                        </div>
                        <div className="grid grid-cols-[160px_10px_1fr]">
                            <span>Nomor SPPD</span>
                            <span>:</span>
                            <span className="font-mono">{sppd.nomor_sppd}</span>
                        </div>
                        <div className="grid grid-cols-[160px_10px_1fr]">
                            <span>Tanggal Penyerahan</span>
                            <span>:</span>
                            <span>{formatDateIndo(laporan?.tanggal_laporan || sppd.tanggal_kembali)}</span>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-4 text-xs sm:text-sm">
                        <div>
                            <h3 className="font-bold text-neutral-900">I. MAKSUD DAN TUJUAN</h3>
                            <p className="mt-1 pl-4 text-justify">
                                {sppd.maksud_tujuan}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-neutral-900">II. WAKTU DAN TEMPAT PELAKSANAAN</h3>
                            <div className="mt-1 pl-4 space-y-1">
                                <div>• Tempat Tujuan : <strong>{sppd.tempat_tujuan}</strong></div>
                                <div>• Waktu Pelaksanaan : {formatDateIndo(sppd.tanggal_berangkat)} s.d. {formatDateIndo(sppd.tanggal_kembali)} ({sppd.lama_hari} hari kalender)</div>
                                <div>• Sarana Transportasi : {sppd.alat_angkut}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-neutral-900">III. PERSONEL GURU YANG DITUGASKAN</h3>
                            <div className="mt-1 pl-4 space-y-0.5">
                                <div>
                                    1. <strong>{sppd.pegawai?.nama}</strong> (NUPTK: {sppd.pegawai?.nuptk || '-'}, {sppd.pegawai?.mata_pelajaran || sppd.pegawai?.jabatan}) — Pelaksana Utama
                                </div>
                                {sppd.pengikuts && sppd.pengikuts.map((p, idx) => (
                                    <div key={p.id}>
                                        {idx + 2}. <strong>{p.pegawai?.nama}</strong> (NUPTK: {p.pegawai?.nuptk || '-'}, {p.pegawai?.mata_pelajaran || p.pegawai?.jabatan}) — Pendamping
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-neutral-900">IV. RINGKASAN PELAKSANAAN KEGIATAN</h3>
                            <p className="mt-1 pl-4 text-justify leading-relaxed whitespace-pre-line">
                                {laporan?.ringkasan_kegiatan || 'Pelaksanaan tugas dinas guru telah dilaksanakan dengan tertib dan lancar sesuai jadwal yang ditetapkan sekolah.'}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-neutral-900">V. HASIL KEGIATAN & KELUARAN (OUTPUT)</h3>
                            <p className="mt-1 pl-4 text-justify leading-relaxed whitespace-pre-line font-sans text-xs bg-neutral-50 p-3 rounded border">
                                {laporan?.hasil_kegiatan || 'Seluruh materi pelatihan/kegiatan telah diperoleh dan materi disiapkan untuk diseminasi kepada dewan guru SMK Budi Mulia.'}
                            </p>
                        </div>

                        {laporan?.kendala && (
                            <div>
                                <h3 className="font-bold text-neutral-900">VI. KENDALA YANG DIHADAPI</h3>
                                <p className="mt-1 pl-4 text-justify leading-relaxed">
                                    {laporan.kendala}
                                </p>
                            </div>
                        )}

                        {laporan?.saran_tindak_lanjut && (
                            <div>
                                <h3 className="font-bold text-neutral-900">
                                    {laporan?.kendala ? 'VII' : 'VI'}. SARAN & RENCANA TINDAK LANJUT DISEMINASI
                                </h3>
                                <p className="mt-1 pl-4 text-justify leading-relaxed">
                                    {laporan.saran_tindak_lanjut}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Signature */}
                    <div className="mt-10 grid grid-cols-2 gap-8 text-xs sm:text-sm">
                        <div className="space-y-1">
                            <div>Mengetahui:</div>
                            <div className="font-semibold">Kepala SMK Budi Mulia,</div>
                            <div className="h-20" />
                            <div className="font-bold underline uppercase">
                                {sppd.pejabat_pemberi_perintah?.nama || 'Dr. H. Ahmad Sudrajat, M.Pd'}
                            </div>
                            <div>NIP. {sppd.pejabat_pemberi_perintah?.nip || '19740510 199903 1 004'}</div>
                        </div>

                        <div className="space-y-1 text-left">
                            <div>Depok, {formatDateIndo(laporan?.tanggal_laporan || sppd.tanggal_kembali)}</div>
                            <div className="font-semibold">Guru Pelaksana / Pelapor,</div>
                            <div className="h-20" />
                            <div className="font-bold underline uppercase">{sppd.pegawai?.nama}</div>
                            <div>NUPTK/NIP. {sppd.pegawai?.nuptk || sppd.pegawai?.nip || '-'}</div>
                            <div>{sppd.pegawai?.mata_pelajaran ? `Guru ${sppd.pegawai?.mata_pelajaran}` : sppd.pegawai?.jabatan}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
