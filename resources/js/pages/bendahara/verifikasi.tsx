import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Eye,
    FileCheck,
    FileText,
    MapPin,
    Search,
    ShieldCheck,
    UserCheck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SppdRow {
    id: number;
    nomor_sp: string;
    nomor_sppd: string;
    maksud_tujuan: string;
    tempat_berangkat: string;
    tempat_tujuan: string;
    tanggal_berangkat: string;
    tanggal_kembali: string;
    lama_hari: number;
    status: string;
    catatan_atasan?: string;
    pegawai?: {
        nama: string;
        nip: string;
        nuptk?: string | null;
        mata_pelajaran?: string | null;
        golongan: string;
        jabatan: string;
        nama_bank: string;
        nomor_rekening: string;
    };
    biaya?: {
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
        status_verifikasi: 'menunggu_verifikasi' | 'terverifikasi' | 'perlu_perbaikan';
        catatan_verifikasi?: string;
        status_pembayaran: string;
        anggaran_id?: number | null;
        anggaran?: {
            id: number;
            nama_anggaran: string;
            kode_rekening: string;
        };
    };
    dokumens?: {
        id: number;
        nama_dokumen: string;
        jenis_dokumen: string;
        file_path: string;
        catatan?: string;
    }[];
    laporan?: {
        id: number;
        ringkasan_kegiatan: string;
        hasil_kegiatan: string;
        kendala?: string;
        saran_tindak_lanjut?: string;
        tanggal_laporan: string;
        status: string;
    } | null;
}

interface VerifikasiProps {
    sppds: {
        data: SppdRow[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    counts: {
        total: number;
        menunggu: number;
        terverifikasi: number;
        perlu_perbaikan: number;
    };
    anggarans: {
        id: number;
        nama_anggaran: string;
        kode_rekening?: string;
    }[];
    filters: {
        status_verifikasi: string;
        search?: string;
    };
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function BendaharaVerifikasiIndex({
    sppds,
    counts,
    anggarans,
    filters,
}: VerifikasiProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedSppd, setSelectedSppd] = useState<SppdRow | null>(null);

    const form = useForm({
        action: 'terverifikasi',
        catatan_verifikasi: '',
        anggaran_id: '',
        biaya_transportasi: 0,
        biaya_penginapan_total: 0,
        biaya_lainnya: 0,
    });

    const openVerifyModal = (sppd: SppdRow) => {
        setSelectedSppd(sppd);
        form.setData({
            action: sppd.biaya?.status_verifikasi === 'terverifikasi' ? 'terverifikasi' : 'terverifikasi',
            catatan_verifikasi: sppd.biaya?.catatan_verifikasi || '',
            anggaran_id: sppd.biaya?.anggaran_id ? String(sppd.biaya.anggaran_id) : '',
            biaya_transportasi: sppd.biaya?.biaya_transportasi || 0,
            biaya_penginapan_total: sppd.biaya?.biaya_penginapan_total || 0,
            biaya_lainnya: sppd.biaya?.biaya_lainnya || 0,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/bendahara/verifikasi',
            {
                ...filters,
                search: search || undefined,
            },
            { preserveState: true }
        );
    };

    const handleFilterStatus = (status: string) => {
        router.get(
            '/bendahara/verifikasi',
            {
                ...filters,
                status_verifikasi: status,
            },
            { preserveState: true }
        );
    };

    const handleSubmitVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSppd) return;

        form.post(`/bendahara/verifikasi/${selectedSppd.id}`, {
            onSuccess: () => {
                setSelectedSppd(null);
            },
        });
    };

    return (
        <>
            <Head title="Verifikasi Biaya & Laporan SPPD - Bendahara SMK Budi Mulia" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header Card */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2.5">
                            <ShieldCheck className="size-7 text-orange-600" />
                            Verifikasi Biaya & Laporan SPPD
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pemeriksaan kelayakan rincian biaya penugasan guru, verifikasi kuitansi/bukti fisik, dan penetapan pos pembebanan anggaran.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/bendahara/anggaran">
                                <DollarSign className="mr-1.5 size-4" />
                                Pos Anggaran
                            </Link>
                        </Button>
                        <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
                            <Link href="/bendahara/pembayaran">
                                Ke Pembayaran &rarr;
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filter Tabs & Counter Metrics */}
                <div className="grid gap-3 sm:grid-cols-4">
                    <button
                        onClick={() => handleFilterStatus('semua')}
                        className={`flex flex-col rounded-xl border p-4 text-left transition-all ${
                            filters.status_verifikasi === 'semua'
                                ? 'border-foreground bg-card shadow-xs'
                                : 'border-border bg-card/50 hover:bg-card'
                        }`}
                    >
                        <span className="text-xs font-medium text-muted-foreground">Semua Tugas Disetujui</span>
                        <span className="text-2xl font-bold text-foreground mt-1">{counts.total}</span>
                    </button>

                    <button
                        onClick={() => handleFilterStatus('menunggu_verifikasi')}
                        className={`flex flex-col rounded-xl border p-4 text-left transition-all ${
                            filters.status_verifikasi === 'menunggu_verifikasi'
                                ? 'border-orange-500 bg-orange-500/10 shadow-xs'
                                : 'border-border bg-card/50 hover:bg-card'
                        }`}
                    >
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            Menunggu Verifikasi
                        </span>
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                            {counts.menunggu}
                        </span>
                    </button>

                    <button
                        onClick={() => handleFilterStatus('terverifikasi')}
                        className={`flex flex-col rounded-xl border p-4 text-left transition-all ${
                            filters.status_verifikasi === 'terverifikasi'
                                ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
                                : 'border-border bg-card/50 hover:bg-card'
                        }`}
                    >
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5" />
                            Biaya Terverifikasi
                        </span>
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {counts.terverifikasi}
                        </span>
                    </button>

                    <button
                        onClick={() => handleFilterStatus('perlu_perbaikan')}
                        className={`flex flex-col rounded-xl border p-4 text-left transition-all ${
                            filters.status_verifikasi === 'perlu_perbaikan'
                                ? 'border-red-500 bg-red-500/10 shadow-xs'
                                : 'border-border bg-card/50 hover:bg-card'
                        }`}
                    >
                        <span className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                            <AlertCircle className="size-3.5" />
                            Perlu Perbaikan
                        </span>
                        <span className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                            {counts.perlu_perbaikan}
                        </span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama guru, NIP, tujuan, nomor SPPD..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-card"
                        />
                    </form>
                </div>

                {/* Table SPPD Awaiting / Verified */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Daftar Verifikasi Biaya Perjalanan Dinas</CardTitle>
                        <CardDescription>
                            Data SPPD yang telah memperoleh persetujuan Kepala Sekolah dan memerlukan penetapan verifikasi Bendahara
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-xs uppercase text-muted-foreground">
                                        <th className="pb-3 pl-1">Guru & Jabatan</th>
                                        <th className="pb-3">Keperluan & Tujuan</th>
                                        <th className="pb-3">Durasi & Waktu</th>
                                        <th className="pb-3">Pos Anggaran</th>
                                        <th className="pb-3">Total Biaya</th>
                                        <th className="pb-3">Bukti / Laporan</th>
                                        <th className="pb-3">Status Verifikasi</th>
                                        <th className="pb-3 text-right pr-1">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {sppds.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                                Tidak ada pengajuan SPPD dalam kategori verifikasi ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        sppds.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-3 pl-1">
                                                    <div className="font-semibold text-foreground">{row.pegawai?.nama}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        NIP: {row.pegawai?.nip} • {row.pegawai?.golongan}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        Rek: {row.pegawai?.nama_bank} {row.pegawai?.nomor_rekening}
                                                    </div>
                                                </td>
                                                <td className="py-3 max-w-xs">
                                                    <div className="font-medium text-foreground flex items-center gap-1">
                                                        <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                                                        <span className="truncate">{row.tempat_tujuan}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                        {row.maksud_tujuan}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                                        {row.nomor_sppd}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-xs">
                                                    <div className="flex items-center gap-1 font-medium">
                                                        <Calendar className="size-3 text-muted-foreground" />
                                                        {new Date(row.tanggal_berangkat).toLocaleDateString('id-ID')}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {row.lama_hari} Hari
                                                    </div>
                                                </td>
                                                <td className="py-3 text-xs">
                                                    <Badge variant="outline" className="font-normal text-muted-foreground">
                                                        {row.biaya?.anggaran?.nama_anggaran || 'Belum Ditetapkan'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-xs font-bold text-foreground">
                                                    {row.biaya ? formatRupiah(row.biaya.total_biaya) : '-'}
                                                </td>
                                                <td className="py-3 text-xs">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1">
                                                            <FileText className="size-3 text-muted-foreground" />
                                                            <span>{row.dokumens?.length ?? 0} Berkas</span>
                                                        </div>
                                                        {row.laporan ? (
                                                            <Badge className="bg-neutral-800 text-white text-[10px]">
                                                                Laporan Ada
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground text-[10px]">Belum lapor</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    {row.biaya?.status_verifikasi === 'terverifikasi' ? (
                                                        <Badge className="bg-emerald-600 text-white border-emerald-600">
                                                            Terverifikasi
                                                        </Badge>
                                                    ) : row.biaya?.status_verifikasi === 'perlu_perbaikan' ? (
                                                        <Badge variant="outline" className="border-red-500 text-red-600">
                                                            Perlu Perbaikan
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-500/5">
                                                            Menunggu
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 text-right pr-1">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => openVerifyModal(row)}
                                                            className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-xs"
                                                        >
                                                            <FileCheck className="mr-1 size-3.5" />
                                                            Verifikasi
                                                        </Button>
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link href={`/sppd/${row.id}`}>Detail</Link>
                                                        </Button>
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

                {/* Verification Modal Dialog */}
                {selectedSppd && (
                    <Dialog open={!!selectedSppd} onOpenChange={(open) => !open && setSelectedSppd(null)}>
                        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                    <ShieldCheck className="size-5 text-orange-600" />
                                    Verifikasi Biaya & Laporan Perjalanan Guru
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedSppd.pegawai?.nama} • {selectedSppd.nomor_sppd} ({selectedSppd.tempat_tujuan})
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmitVerify} className="space-y-5 py-2">
                                {/* Section 1: Informasi Dasar Guru & Rekening */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-muted/40 p-3.5 border text-xs">
                                    <div>
                                        <span className="text-muted-foreground">Guru Penugasan:</span>
                                        <p className="font-semibold text-foreground text-sm">{selectedSppd.pegawai?.nama}</p>
                                        <p className="text-muted-foreground">{selectedSppd.pegawai?.jabatan} • {selectedSppd.pegawai?.golongan}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Rekening Pencairan Bendahara:</span>
                                        <p className="font-semibold text-foreground text-sm">
                                            {selectedSppd.pegawai?.nama_bank} - {selectedSppd.pegawai?.nomor_rekening}
                                        </p>
                                        <p className="text-muted-foreground">a.n. {selectedSppd.pegawai?.nama}</p>
                                    </div>
                                </div>

                                {/* Section 2: Rincian Komponen Biaya & Penyesuaian Bendahara */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Rincian Komponen Biaya Perjalanan
                                        </h4>
                                        <span className="text-xs text-orange-600 font-medium">
                                            Bendahara dapat menyesuaikan nominal sesuai kebijakan
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        {/* Uang Harian */}
                                        <div className="rounded-lg border p-3 bg-card space-y-1">
                                            <div className="text-xs text-muted-foreground flex justify-between">
                                                <span>Uang Harian ({selectedSppd.biaya?.uang_harian_hari} Hari)</span>
                                                <span className="font-mono">@{formatRupiah(selectedSppd.biaya?.uang_harian_per_hari || 0)}</span>
                                            </div>
                                            <div className="text-base font-bold text-foreground">
                                                {formatRupiah(selectedSppd.biaya?.uang_harian_total || 0)}
                                            </div>
                                        </div>

                                        {/* Biaya Transportasi */}
                                        <div className="rounded-lg border p-3 bg-card space-y-1">
                                            <Label htmlFor="biaya_trans" className="text-xs text-muted-foreground">
                                                Biaya Tiket / Transportasi (Rp)
                                            </Label>
                                            <Input
                                                id="biaya_trans"
                                                type="number"
                                                min="0"
                                                value={form.data.biaya_transportasi}
                                                onChange={(e) => form.setData('biaya_transportasi', Number(e.target.value))}
                                                className="h-8 font-semibold"
                                            />
                                        </div>

                                        {/* Biaya Penginapan */}
                                        <div className="rounded-lg border p-3 bg-card space-y-1">
                                            <Label htmlFor="biaya_hotel" className="text-xs text-muted-foreground">
                                                Biaya Akomodasi / Penginapan Total (Rp)
                                            </Label>
                                            <Input
                                                id="biaya_hotel"
                                                type="number"
                                                min="0"
                                                value={form.data.biaya_penginapan_total}
                                                onChange={(e) => form.setData('biaya_penginapan_total', Number(e.target.value))}
                                                className="h-8 font-semibold"
                                            />
                                        </div>

                                        {/* Biaya Lainnya */}
                                        <div className="rounded-lg border p-3 bg-card space-y-1">
                                            <Label htmlFor="biaya_lain" className="text-xs text-muted-foreground">
                                                Biaya Registrasi / Lainnya (Rp)
                                            </Label>
                                            <Input
                                                id="biaya_lain"
                                                type="number"
                                                min="0"
                                                value={form.data.biaya_lainnya}
                                                onChange={(e) => form.setData('biaya_lainnya', Number(e.target.value))}
                                                className="h-8 font-semibold"
                                            />
                                        </div>
                                    </div>

                                    {/* Pos Pembebanan Anggaran */}
                                    <div className="pt-1">
                                        <Label htmlFor="pilih_anggaran" className="text-xs font-semibold">
                                            Tetapkan Pos Anggaran Sekolah *
                                        </Label>
                                        <select
                                            id="pilih_anggaran"
                                            value={form.data.anggaran_id}
                                            onChange={(e) => form.setData('anggaran_id', e.target.value)}
                                            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-medium"
                                        >
                                            <option value="">-- Pilih Pos Pagu Anggaran --</option>
                                            {anggarans.map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    {a.nama_anggaran} {a.kode_rekening ? `(${a.kode_rekening})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Section 3: Berkas Bukti Pengeluaran & Laporan Guru */}
                                <div className="space-y-2.5 rounded-lg border p-3.5 bg-muted/20">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <FileText className="size-3.5 text-foreground" />
                                        Berkas Bukti Fisik Pengeluaran ({selectedSppd.dokumens?.length || 0} Terunggah)
                                    </h4>

                                    {selectedSppd.dokumens && selectedSppd.dokumens.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                            {selectedSppd.dokumens.map((dok) => (
                                                <a
                                                    key={dok.id}
                                                    href={`/storage/${dok.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-muted/50 text-xs transition-colors"
                                                >
                                                    <span className="truncate font-medium text-foreground max-w-[200px]">
                                                        {dok.nama_dokumen}
                                                    </span>
                                                    <span className="text-[11px] text-orange-600 font-semibold flex items-center gap-0.5">
                                                        <Eye className="size-3" />
                                                        Buka File
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic py-1">
                                            Guru belum mengunggah bukti pengeluaran fisik (tiket/kuitansi).
                                        </p>
                                    )}

                                    {/* Laporan Perjalanan */}
                                    {selectedSppd.laporan && (
                                        <div className="mt-3 pt-2.5 border-t space-y-1.5 text-xs">
                                            <span className="font-semibold text-foreground flex items-center gap-1">
                                                <FileCheck className="size-3 text-emerald-600" />
                                                Laporan Hasil Perjalanan Guru:
                                            </span>
                                            <p className="text-muted-foreground line-clamp-2">
                                                {selectedSppd.laporan.ringkasan_kegiatan}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Tindak Lanjut: {selectedSppd.laporan.saran_tindak_lanjut || '-'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Section 4: Keputusan Verifikasi Bendahara */}
                                <div className="space-y-3 pt-1">
                                    <div>
                                        <Label className="text-xs font-semibold">Keputusan Verifikasi *</Label>
                                        <div className="mt-2 grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => form.setData('action', 'terverifikasi')}
                                                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-semibold transition-all ${
                                                    form.data.action === 'terverifikasi'
                                                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                        : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                                                }`}
                                            >
                                                <CheckCircle2 className="size-4" />
                                                Setujui Verifikasi
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => form.setData('action', 'perlu_perbaikan')}
                                                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-semibold transition-all ${
                                                    form.data.action === 'perlu_perbaikan'
                                                        ? 'border-red-600 bg-red-500/10 text-red-700 dark:text-red-400'
                                                        : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                                                }`}
                                            >
                                                <XCircle className="size-4" />
                                                Minta Perbaikan
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="catatan_verif" className="text-xs font-semibold">
                                            Catatan Bendahara (Instruksi / Catatan Biaya)
                                        </Label>
                                        <textarea
                                            id="catatan_verif"
                                            rows={2}
                                            value={form.data.catatan_verifikasi}
                                            onChange={(e) => form.setData('catatan_verifikasi', e.target.value)}
                                            placeholder="Contoh: Rincian biaya telah diperiksa dan sesuai standar SBM sekolah. Siap diproses pencairan."
                                            className="mt-1 w-full rounded-md border border-input bg-background p-2.5 text-sm"
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="pt-2">
                                    <Button type="button" variant="outline" onClick={() => setSelectedSppd(null)}>
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                                    >
                                        {form.processing ? 'Menyimpan...' : 'Simpan Verifikasi'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
}
