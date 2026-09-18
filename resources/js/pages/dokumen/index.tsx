import { Head, Link, router } from '@inertiajs/react';
import {
    Coins,
    Download,
    Eye,
    FileCheck,
    FileText,
    MapPin,
    Printer,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SppdRow {
    id: number;
    nomor_sp: string;
    nomor_sppd: string;
    maksud_tujuan: string;
    tempat_tujuan: string;
    tanggal_berangkat: string;
    tanggal_kembali: string;
    lama_hari: number;
    status: string;
    pegawai?: {
        nama: string;
        nip: string;
        nuptk?: string | null;
        mata_pelajaran?: string | null;
        golongan: string;
        jabatan: string;
    };
    laporan?: {
        id: number;
    };
    dokumens?: {
        id: number;
    }[];
}

interface DokumenProps {
    sppds: {
        data: SppdRow[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
    };
}

export default function DokumenIndex({ sppds, filters }: DokumenProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dokumen', { search }, { preserveState: true });
    };

    return (
        <>
            <Head title="Surat Tugas & SPPD Guru - SMK Budi Mulia" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Surat Tugas & SPPD Guru
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pusat pencetakan berkas resmi penugasan dinas: Surat Tugas Guru (SPT), Lembar SPPD 9-Poin & Visum, Kuitansi Riil, dan Laporan Perjalanan Dinas SMK Budi Mulia.
                    </p>
                </div>

                {/* Search Bar */}
                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nomor SPPD, nama guru, mata pelajaran, atau tujuan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-full"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Cari Dokumen
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Document Cards / Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Daftar Dokumen Siap Cetak</CardTitle>
                        <CardDescription>
                            Format cetak A4 resmi berlogo Yayasan Pendidikan Budi Mulia - SMK Budi Mulia
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b text-xs font-medium text-muted-foreground uppercase">
                                    <tr>
                                        <th className="pb-3 pl-1">No. SPPD & Guru</th>
                                        <th className="pb-3">Tujuan & Waktu</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right pr-1">Dokumen Cetak Resmi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {sppds.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-muted-foreground">
                                                Tidak ditemukan berkas dokumen.
                                            </td>
                                        </tr>
                                    ) : (
                                        sppds.data.map((sppd) => (
                                            <tr key={sppd.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-4 pl-1">
                                                    <div className="font-semibold text-foreground">{sppd.nomor_sppd}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {sppd.pegawai?.nama} {sppd.pegawai?.mata_pelajaran ? `• ${sppd.pegawai?.mata_pelajaran}` : ''}
                                                    </div>
                                                </td>

                                                <td className="py-4">
                                                    <div className="font-medium text-foreground flex items-center gap-1">
                                                        <MapPin className="size-3.5 text-rose-500 shrink-0" />
                                                        <span>{sppd.tempat_tujuan}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(sppd.tanggal_berangkat).toLocaleDateString('id-ID')} ({sppd.lama_hari} Hari)
                                                    </div>
                                                </td>

                                                <td className="py-4">
                                                    <Badge
                                                        className={
                                                            sppd.status === 'disetujui' || sppd.status === 'selesai'
                                                                ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                                                                : 'bg-muted text-muted-foreground'
                                                        }
                                                    >
                                                        {sppd.status.toUpperCase()}
                                                    </Badge>
                                                </td>

                                                <td className="py-4 text-right pr-1">
                                                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                                                        {/* Surat Tugas */}
                                                        <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                                                            <a href={`/dokumen/print/surat-tugas/${sppd.id}`} target="_blank" rel="noreferrer">
                                                                <FileText className="size-3 mr-1 text-emerald-600" />
                                                                Surat Tugas
                                                            </a>
                                                        </Button>

                                                        {/* SPPD Lembar 1 & 2 */}
                                                        <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                                                            <a href={`/dokumen/print/sppd/${sppd.id}`} target="_blank" rel="noreferrer">
                                                                <Printer className="size-3 mr-1 text-blue-600" />
                                                                Lembar SPPD
                                                            </a>
                                                        </Button>

                                                        {/* Kuitansi Riil */}
                                                        <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                                                            <a href={`/dokumen/print/rincian-biaya/${sppd.id}`} target="_blank" rel="noreferrer">
                                                                <Coins className="size-3 mr-1 text-amber-600" />
                                                                Kuitansi
                                                            </a>
                                                        </Button>

                                                        {/* Laporan Perjalanan */}
                                                        {sppd.laporan ? (
                                                            <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                                                                <a href={`/dokumen/print/laporan/${sppd.id}`} target="_blank" rel="noreferrer">
                                                                    <FileCheck className="size-3 mr-1 text-purple-600" />
                                                                    Laporan
                                                                </a>
                                                            </Button>
                                                        ) : (
                                                            <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-muted-foreground">
                                                                <Link href={`/sppd/${sppd.id}`}>+ Laporan</Link>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
