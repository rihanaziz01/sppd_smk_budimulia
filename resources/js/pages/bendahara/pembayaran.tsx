import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    FileText,
    MapPin,
    Printer,
    Search,
    Upload,
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

interface BiayaItem {
    id: number;
    sppd_id: number;
    uang_harian_total: number;
    biaya_transportasi: number;
    biaya_penginapan_total: number;
    biaya_lainnya: number;
    total_biaya: number;
    status_pembayaran: 'belum_dibayar' | 'diproses' | 'sudah_dibayar' | 'ditunda' | 'lunas' | 'menunggu_pencairan';
    status_verifikasi: string;
    tanggal_bayar?: string;
    metode_pembayaran?: string;
    nomor_bukti_kas?: string;
    catatan_bendahara?: string;
    file_bukti_bayar?: string;
    anggaran?: {
        nama_anggaran: string;
    };
    sppd?: {
        id: number;
        nomor_sp: string;
        nomor_sppd: string;
        tempat_tujuan: string;
        lama_hari: number;
        tanggal_berangkat: string;
        pegawai?: {
            nama: string;
            nip: string;
            golongan: string;
            nama_bank: string;
            nomor_rekening: string;
        };
    };
}

interface PembayaranProps {
    biayas: {
        data: BiayaItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    counts: {
        semua: number;
        belum_dibayar: number;
        diproses: number;
        sudah_dibayar: number;
        ditunda: number;
    };
    filters: {
        status: string;
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

export default function BendaharaPembayaranIndex({
    biayas,
    counts,
    filters,
}: PembayaranProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedBiaya, setSelectedBiaya] = useState<BiayaItem | null>(null);

    const form = useForm({
        status_pembayaran: 'sudah_dibayar',
        tanggal_bayar: new Date().toISOString().split('T')[0],
        metode_pembayaran: 'Transfer Bank BJB',
        nomor_bukti_kas: '',
        catatan_bendahara: '',
        file_bukti_bayar: null as File | null,
    });

    const openProcessModal = (biaya: BiayaItem) => {
        setSelectedBiaya(biaya);
        form.setData({
            status_pembayaran:
                biaya.status_pembayaran === 'belum_dibayar' || biaya.status_pembayaran === 'diproses'
                    ? 'sudah_dibayar'
                    : biaya.status_pembayaran === 'lunas'
                      ? 'sudah_dibayar'
                      : (biaya.status_pembayaran as any),
            tanggal_bayar: biaya.tanggal_bayar || new Date().toISOString().split('T')[0],
            metode_pembayaran: biaya.metode_pembayaran || 'Transfer Bank BJB',
            nomor_bukti_kas:
                biaya.nomor_bukti_kas ||
                `BKU-SPPD/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(biaya.id).padStart(3, '0')}`,
            catatan_bendahara: biaya.catatan_bendahara || '',
            file_bukti_bayar: null,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/bendahara/pembayaran',
            { ...filters, search: search || undefined },
            { preserveState: true }
        );
    };

    const handleFilterStatus = (status: string) => {
        router.get(
            '/bendahara/pembayaran',
            { ...filters, status },
            { preserveState: true }
        );
    };

    const handleSubmitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBiaya) return;

        form.post(`/bendahara/pembayaran/${selectedBiaya.id}`, {
            forceFormData: true,
            onSuccess: () => setSelectedBiaya(null),
        });
    };

    return (
        <>
            <Head title="Pembayaran Biaya SPPD Guru - Bendahara" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header Card */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2.5">
                            <CreditCard className="size-7 text-orange-600" />
                            Pembayaran Perjalanan Dinas Guru
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pencairan dana uang harian, tiket transportasi, akomodasi penginapan, dan cetak kuitansi kas keluar resmi.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button variant="outline" asChild>
                            <Link href="/bendahara/riwayat-pembayaran">
                                Riwayat Pembayaran &rarr;
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filter Status Tabs (4 Status Utama + Semua) */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <button
                        onClick={() => handleFilterStatus('semua')}
                        className={`flex flex-col rounded-xl border p-3.5 text-left transition-all ${
                            filters.status === 'semua'
                                ? 'border-foreground bg-card shadow-xs'
                                : 'border-border bg-card/50 hover:bg-card'
                        }`}
                    >
                        <span className="text-xs font-medium text-muted-foreground">Semua Pembayaran</span>
                        <span className="text-2xl font-bold text-foreground mt-1">{counts.semua}</span>
                    </button>

                    <button
                        onClick={() => handleFilterStatus('belum_dibayar')}
                        className={`flex flex-col rounded-xl border p-3.5 text-left transition-all ${
                            filters.status === 'belum_dibayar'
                                ? 'border-orange-500 bg-orange-500/10 shadow-xs'
                                : 'border-border bg-card/50 hover:bg-card'
                        }`}
                    >
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            Belum Dibayar
                        </span>
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                            {counts.belum_dibayar}
                        </span>
                    </button>

                    <button
                        onClick={() => handleFilterStatus('diproses')}
                        className={`flex flex-col rounded-xl border p-3.5 text-left transition-all ${
                            filters.status === 'diproses'
                                ? 'border-blue-500 bg-blue-500/10 shadow-xs'
                                : 'border-border bg-card/50 hover:bg-card'
                        }`}
                    >
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            Diproses
                        </span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                            {counts.diproses}
                        </span>
                    </button>

                    <button
                        onClick={() => handleFilterStatus('sudah_dibayar')}
                        className={`flex flex-col rounded-xl border p-3.5 text-left transition-all ${
                            filters.status === 'sudah_dibayar'
                                ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
                                : 'border-border bg-card/50 hover:bg-card'
                        }`}
                    >
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5" />
                            Sudah Dibayar
                        </span>
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {counts.sudah_dibayar}
                        </span>
                    </button>

                    <button
                        onClick={() => handleFilterStatus('ditunda')}
                        className={`flex flex-col rounded-xl border p-3.5 text-left transition-all ${
                            filters.status === 'ditunda'
                                ? 'border-red-500 bg-red-500/10 shadow-xs'
                                : 'border-border bg-card/50 hover:bg-card'
                        }`}
                    >
                        <span className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                            <XCircle className="size-3.5" />
                            Ditunda
                        </span>
                        <span className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                            {counts.ditunda}
                        </span>
                    </button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari guru, NIP, no kas, nomor SPPD..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card"
                    />
                </form>

                {/* Table Pembayaran */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Daftar Antrean & Status Pencairan Biaya SPPD</CardTitle>
                        <CardDescription>
                            Daftar pembayaran perjalanan dinas guru yang terintegrasi dengan rekening bank dan BKU sekolah
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-xs uppercase text-muted-foreground">
                                        <th className="pb-3 pl-1">Guru & Rekening Bank</th>
                                        <th className="pb-3">SPPD & Tujuan</th>
                                        <th className="pb-3">Pos Anggaran</th>
                                        <th className="pb-3">Total Nominal</th>
                                        <th className="pb-3">Status Bayar</th>
                                        <th className="pb-3">Tanggal & No Kas</th>
                                        <th className="pb-3">Bukti Slip</th>
                                        <th className="pb-3 text-right pr-1">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {biayas.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                                Tidak ada data pembayaran dalam status ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        biayas.data.map((row) => {
                                            const isPaid =
                                                row.status_pembayaran === 'sudah_dibayar' ||
                                                row.status_pembayaran === 'lunas';
                                            return (
                                                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-3.5 pl-1">
                                                        <div className="font-semibold text-foreground">
                                                            {row.sppd?.pegawai?.nama}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground font-medium">
                                                            {row.sppd?.pegawai?.nama_bank} -{' '}
                                                            <span className="font-mono">{row.sppd?.pegawai?.nomor_rekening}</span>
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            NIP: {row.sppd?.pegawai?.nip}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 max-w-xs">
                                                        <div className="font-medium text-foreground flex items-center gap-1 text-xs">
                                                            <MapPin className="size-3 text-muted-foreground shrink-0" />
                                                            <span className="truncate">{row.sppd?.tempat_tujuan}</span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                                            {row.sppd?.nomor_sppd}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 text-xs text-muted-foreground">
                                                        {row.anggaran?.nama_anggaran || 'Kas Rutin Sekolah'}
                                                    </td>
                                                    <td className="py-3.5 text-xs font-bold text-foreground">
                                                        {formatRupiah(row.total_biaya)}
                                                    </td>
                                                    <td className="py-3.5">
                                                        {isPaid ? (
                                                            <Badge className="bg-emerald-600 text-white border-emerald-600">
                                                                Sudah Dibayar
                                                            </Badge>
                                                        ) : row.status_pembayaran === 'diproses' || row.status_pembayaran === 'menunggu_pencairan' ? (
                                                            <Badge className="bg-blue-600 text-white border-blue-600">
                                                                Diproses
                                                            </Badge>
                                                        ) : row.status_pembayaran === 'ditunda' ? (
                                                            <Badge variant="outline" className="border-red-500 text-red-600">
                                                                Ditunda
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="border-orange-500 text-orange-600">
                                                                Belum Dibayar
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 text-xs">
                                                        {row.tanggal_bayar ? (
                                                            <div>
                                                                <div className="font-semibold text-foreground">
                                                                    {new Date(row.tanggal_bayar).toLocaleDateString('id-ID')}
                                                                </div>
                                                                <div className="text-[11px] text-muted-foreground font-mono">
                                                                    {row.nomor_bukti_kas || '-'}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground italic">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 text-xs">
                                                        {row.file_bukti_bayar ? (
                                                            <a
                                                                href={`/storage/${row.file_bukti_bayar}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-orange-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                                                            >
                                                                <Eye className="size-3" />
                                                                Lihat Slip
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted-foreground text-[11px]">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 text-right pr-1">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => openProcessModal(row)}
                                                                className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-xs"
                                                            >
                                                                <CreditCard className="size-3.5 mr-1" />
                                                                {isPaid ? 'Ubah' : 'Bayar'}
                                                            </Button>

                                                            {isPaid && (
                                                                <Button size="sm" variant="outline" asChild>
                                                                    <a
                                                                        href={`/bendahara/pembayaran/${row.id}/kuitansi`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        title="Cetak Kuitansi Kas"
                                                                    >
                                                                        <Printer className="size-3.5" />
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Modal Proses Pembayaran */}
                {selectedBiaya && (
                    <Dialog open={!!selectedBiaya} onOpenChange={(open) => !open && setSelectedBiaya(null)}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                    <CreditCard className="size-5 text-orange-600" />
                                    Proses Pembayaran Perjalanan Dinas
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedBiaya.sppd?.pegawai?.nama} • {selectedBiaya.sppd?.nomor_sppd}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmitPayment} className="space-y-4 py-2">
                                {/* Ringkasan Rekening & Nominal */}
                                <div className="rounded-lg bg-muted/40 p-3.5 border text-xs space-y-1.5">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Bank & No Rekening Guru:</span>
                                        <span className="font-bold text-foreground">
                                            {selectedBiaya.sppd?.pegawai?.nama_bank} - {selectedBiaya.sppd?.pegawai?.nomor_rekening}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 border-t">
                                        <span className="text-muted-foreground font-medium">Total Nominal Pencairan:</span>
                                        <span className="text-base font-bold text-orange-600">
                                            {formatRupiah(selectedBiaya.total_biaya)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="status_bayar">Status Pembayaran *</Label>
                                        <select
                                            id="status_bayar"
                                            value={form.data.status_pembayaran}
                                            onChange={(e) => form.setData('status_pembayaran', e.target.value as any)}
                                            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-semibold"
                                        >
                                            <option value="sudah_dibayar">Sudah Dibayar (Lunas)</option>
                                            <option value="diproses">Diproses (Antrean Transfer)</option>
                                            <option value="belum_dibayar">Belum Dibayar</option>
                                            <option value="ditunda">Ditunda</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="tgl_bayar">Tanggal Pembayaran *</Label>
                                        <Input
                                            id="tgl_bayar"
                                            type="date"
                                            value={form.data.tanggal_bayar}
                                            onChange={(e) => form.setData('tanggal_bayar', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="metode_bayar">Metode Pembayaran</Label>
                                        <select
                                            id="metode_bayar"
                                            value={form.data.metode_pembayaran}
                                            onChange={(e) => form.setData('metode_pembayaran', e.target.value)}
                                            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-medium"
                                        >
                                            <option value="Transfer Bank BJB">Transfer Bank BJB</option>
                                            <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                                            <option value="Transfer Bank BRI">Transfer Bank BRI</option>
                                            <option value="Transfer Bank BNI">Transfer Bank BNI</option>
                                            <option value="Kas / Tunai">Kas Tunai Sekolah</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="no_bukti_kas">Nomor Bukti Kas / BKU *</Label>
                                        <Input
                                            id="no_bukti_kas"
                                            required
                                            value={form.data.nomor_bukti_kas}
                                            onChange={(e) => form.setData('nomor_bukti_kas', e.target.value)}
                                            placeholder="BKU-SPPD/2026/03/001"
                                            className="mt-1 font-mono text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="file_slip">Unggah Bukti Transfer / Slip Pembayaran</Label>
                                    <Input
                                        id="file_slip"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => form.setData('file_bukti_bayar', e.target.files?.[0] || null)}
                                        className="mt-1"
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Opsional: Lampirkan bukti transfer bank atau foto kuitansi kas fisik (PDF/JPG maksimal 10MB)
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="catatan_bayar">Catatan Bendahara</Label>
                                    <textarea
                                        id="catatan_bayar"
                                        rows={2}
                                        value={form.data.catatan_bendahara}
                                        onChange={(e) => form.setData('catatan_bendahara', e.target.value)}
                                        placeholder="Keterangan tambahan pencairan dana..."
                                        className="mt-1 w-full rounded-md border border-input bg-background p-2.5 text-sm"
                                    />
                                </div>

                                <DialogFooter className="pt-2">
                                    <Button type="button" variant="outline" onClick={() => setSelectedBiaya(null)}>
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                                    >
                                        {form.processing ? 'Menyimpan...' : 'Simpan Pembayaran'}
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
