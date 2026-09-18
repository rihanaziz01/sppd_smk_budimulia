import { Head, Link, router } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    Edit2,
    Eye,
    FileText,
    Filter,
    MapPin,
    Plus,
    Printer,
    Search,
    Trash2,
    User,
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
    tempat_berangkat: string;
    tempat_tujuan: string;
    tingkat_biaya: string;
    alat_angkut: string;
    tanggal_berangkat: string;
    tanggal_kembali: string;
    lama_hari: number;
    status: 'draft' | 'diajukan' | 'disetujui' | 'ditolak' | 'selesai';
    pegawai?: {
        id: number;
        nama: string;
        nip: string;
        jabatan: string;
        golongan: string;
    };
    biaya?: {
        total_biaya: number;
        status_pembayaran: string;
    };
    created_by_user?: {
        name: string;
    };
}

interface SppdIndexProps {
    sppds: {
        data: SppdRow[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    counts: {
        semua: number;
        diajukan: number;
        disetujui: number;
        selesai: number;
        ditolak: number;
    };
    filters: {
        status: string;
        search?: string;
        my_only: boolean;
    };
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'disetujui':
            return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/30">Disetujui</Badge>;
        case 'diajukan':
            return <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400 border-amber-500/30">Menunggu</Badge>;
        case 'selesai':
            return <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400 border-blue-500/30">Selesai</Badge>;
        case 'ditolak':
            return <Badge className="bg-rose-500/15 text-rose-700 hover:bg-rose-500/20 dark:text-rose-400 border-rose-500/30">Ditolak</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function SppdIndex({ sppds, counts, filters }: SppdIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const currentStatus = filters.status || 'semua';
    const [myOnly, setMyOnly] = useState(filters.my_only || false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/sppd', { status: currentStatus, search, my_only: myOnly ? 1 : 0 }, { preserveState: true });
    };

    const handleTabChange = (status: string) => {
        router.get('/sppd', { status, search, my_only: myOnly ? 1 : 0 }, { preserveState: true });
    };

    const handleMyOnlyToggle = () => {
        const nextVal = !myOnly;
        setMyOnly(nextVal);
        router.get('/sppd', { status: currentStatus, search, my_only: nextVal ? 1 : 0 }, { preserveState: true });
    };

    const handleDelete = (sppd: SppdRow) => {
        if (confirm(`Hapus pengajuan SPPD ${sppd.nomor_sppd}? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(`/sppd/${sppd.id}`);
        }
    };

    const tabs = [
        { id: 'semua', label: 'Semua', count: counts.semua },
        { id: 'diajukan', label: 'Menunggu', count: counts.diajukan },
        { id: 'disetujui', label: 'Disetujui', count: counts.disetujui },
        { id: 'selesai', label: 'Selesai', count: counts.selesai },
        { id: 'ditolak', label: 'Ditolak', count: counts.ditolak },
    ];

    return (
        <>
            <Head title="Pengajuan SPPD" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Top Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Pengajuan SPPD
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola penerbitan Surat Perintah Tugas dan Surat Perintah Perjalanan Dinas pegawai.
                        </p>
                    </div>

                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                        <Link href="/sppd/create">
                            <Plus className="mr-1.5 size-4" />
                            Buat Pengajuan SPPD
                        </Link>
                    </Button>
                </div>

                {/* Filter Tabs & Search Card */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        {/* Status Tabs */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                                {tabs.map((tab) => {
                                    const isActive = currentStatus === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => handleTabChange(tab.id)}
                                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                                isActive
                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                        >
                                            <span>{tab.label}</span>
                                            <span
                                                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                                                    isActive
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-background text-foreground/70'
                                                }`}
                                            >
                                                {tab.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* My Only Toggle */}
                            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                                <input
                                    type="checkbox"
                                    checked={myOnly}
                                    onChange={handleMyOnlyToggle}
                                    className="rounded border-border size-3.5"
                                />
                                <span>Hanya Pengajuan Saya</span>
                            </label>
                        </div>

                        {/* Search input */}
                        <form onSubmit={handleSearch} className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari berdasarkan nomor SPPD, nama pegawai, atau tempat tujuan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-full"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Cari
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* SPPD List Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Daftar Perjalanan Dinas</CardTitle>
                                <CardDescription>Ditemukan {sppds.total} berkas SPPD</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b text-xs font-medium text-muted-foreground uppercase">
                                    <tr>
                                        <th className="pb-3 pl-1">No. Surat & SPPD</th>
                                        <th className="pb-3">Pegawai Ditugaskan</th>
                                        <th className="pb-3">Tujuan & Keperluan</th>
                                        <th className="pb-3">Waktu Pelaksanaan</th>
                                        <th className="pb-3">Estimasi Biaya</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right pr-1">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {sppds.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                                Tidak ada data SPPD yang sesuai filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        sppds.data.map((sppd) => (
                                            <tr key={sppd.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-3.5 pl-1">
                                                    <div className="font-semibold text-foreground">{sppd.nomor_sppd}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">
                                                        {sppd.nomor_sp}
                                                    </div>
                                                </td>

                                                <td className="py-3.5">
                                                    <div className="font-medium text-foreground">{sppd.pegawai?.nama || '-'}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {sppd.pegawai?.golongan} • {sppd.pegawai?.jabatan}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 max-w-xs">
                                                    <div className="font-semibold text-foreground flex items-center gap-1">
                                                        <MapPin className="size-3.5 text-rose-500 shrink-0" />
                                                        <span className="truncate">{sppd.tempat_tujuan}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                                        {sppd.maksud_tujuan}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 text-xs">
                                                    <div className="flex items-center gap-1 font-medium">
                                                        <Calendar className="size-3 text-muted-foreground" />
                                                        <span>
                                                            {new Date(sppd.tanggal_berangkat).toLocaleDateString('id-ID')} - {new Date(sppd.tanggal_kembali).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                    <div className="text-muted-foreground flex items-center gap-2 mt-0.5">
                                                        <span>{sppd.lama_hari} Hari</span>
                                                        <span>•</span>
                                                        <span>{sppd.alat_angkut}</span>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 text-xs">
                                                    <div className="font-semibold text-foreground">
                                                        {sppd.biaya ? formatRupiah(sppd.biaya.total_biaya) : '-'}
                                                    </div>
                                                    <div className="text-muted-foreground capitalize">
                                                        {sppd.biaya?.status_pembayaran.replace('_', ' ')}
                                                    </div>
                                                </td>

                                                <td className="py-3.5">
                                                    {getStatusBadge(sppd.status)}
                                                </td>

                                                <td className="py-3.5 text-right pr-1">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                                                            <Link href={`/sppd/${sppd.id}`}>
                                                                <Eye className="size-3.5 mr-1" />
                                                                Detail
                                                            </Link>
                                                        </Button>

                                                        <Button variant="ghost" size="icon" asChild className="size-8 text-muted-foreground hover:text-foreground">
                                                            <Link href={`/dokumen/print/sppd/${sppd.id}`} target="_blank">
                                                                <Printer className="size-3.5" />
                                                            </Link>
                                                        </Button>

                                                        {(sppd.status === 'diajukan' || sppd.status === 'ditolak') && (
                                                            <>
                                                                <Button variant="ghost" size="icon" asChild className="size-8 text-muted-foreground hover:text-foreground">
                                                                    <Link href={`/sppd/${sppd.id}/edit`}>
                                                                        <Edit2 className="size-3.5" />
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDelete(sppd)}
                                                                    className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {sppds.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
                                <span className="text-xs text-muted-foreground">
                                    Halaman {sppds.current_page} dari {sppds.last_page}
                                </span>
                                <div className="flex items-center gap-1">
                                    {sppds.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="h-8 text-xs"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
