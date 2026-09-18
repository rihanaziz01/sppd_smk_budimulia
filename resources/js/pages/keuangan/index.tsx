import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    FileText,
    Printer,
    Search,
    WalletCards,
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

interface BiayaRow {
    id: number;
    sppd_id: number;
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
    status_pembayaran: 'belum_dibayar' | 'menunggu_pencairan' | 'lunas';
    tanggal_bayar?: string;
    metode_pembayaran?: string;
    nomor_bukti_kas?: string;
    catatan_bendahara?: string;
    sppd?: {
        id: number;
        nomor_sp: string;
        nomor_sppd: string;
        tempat_tujuan: string;
        lama_hari: number;
        status: string;
        pegawai?: {
            nama: string;
            nip: string;
            nuptk?: string | null;
            mata_pelajaran?: string | null;
            golongan: string;
            nama_bank: string;
            nomor_rekening: string;
        };
    };
}

interface KeuanganProps {
    biayas: {
        data: BiayaRow[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    metrics: {
        total_anggaran: number;
        total_lunas: number;
        total_uang_harian?: number;
        total_transportasi?: number;
        total_penginapan?: number;
        total_pembayaran?: number;
        menunggu_pencairan: number;
        belum_dibayar: number;
        count_menunggu: number;
        count_lunas: number;
    };
    rekap_guru?: {
        nama: string;
        nip: string;
        jabatan: string;
        nama_bank: string;
        nomor_rekening: string;
        total_perjalanan: number;
        total_biaya: number;
        total_dibayar: number;
    }[];
    rekap_bulanan?: {
        bulan: string;
        jumlah_perjalanan: number;
        uang_harian: number;
        transportasi: number;
        penginapan: number;
        biaya_lainnya: number;
        total: number;
    }[];
    filters: {
        status_pembayaran: string;
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

export default function KeuanganIndex({
    biayas,
    metrics,
    rekap_guru = [],
    rekap_bulanan = [],
    filters,
}: KeuanganProps) {
    const [search, setSearch] = useState(filters.search || '');
    const currentStatus = filters.status_pembayaran || 'semua';
    const [selectedBiaya, setSelectedBiaya] = useState<BiayaRow | null>(null);

    const form = useForm({
        uang_harian_hari: 1,
        uang_harian_per_hari: 0,
        biaya_transportasi: 0,
        biaya_penginapan_malam: 0,
        biaya_penginapan_per_malam: 0,
        biaya_lainnya: 0,
        keterangan_biaya_lainnya: '',
        status_pembayaran: 'lunas',
        tanggal_bayar: new Date().toISOString().split('T')[0],
        metode_pembayaran: 'Transfer Bank',
        nomor_bukti_kas: '',
        catatan_bendahara: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/keuangan', { status_pembayaran: currentStatus, search }, { preserveState: true });
    };

    const handleTabChange = (status: string) => {
        router.get('/keuangan', { status_pembayaran: status, search }, { preserveState: true });
    };

    const openDisbursementModal = (b: BiayaRow) => {
        setSelectedBiaya(b);
        form.setData({
            uang_harian_hari: b.uang_harian_hari,
            uang_harian_per_hari: b.uang_harian_per_hari,
            biaya_transportasi: b.biaya_transportasi,
            biaya_penginapan_malam: b.biaya_penginapan_malam,
            biaya_penginapan_per_malam: b.biaya_penginapan_per_malam,
            biaya_lainnya: b.biaya_lainnya,
            keterangan_biaya_lainnya: b.keterangan_biaya_lainnya || '',
            status_pembayaran: 'lunas',
            tanggal_bayar: b.tanggal_bayar || new Date().toISOString().split('T')[0],
            metode_pembayaran: b.metode_pembayaran || 'Transfer Bank',
            nomor_bukti_kas: b.nomor_bukti_kas || `BKK-SMK-BM/${new Date().getFullYear()}/${String(b.sppd_id).padStart(4, '0')}`,
            catatan_bendahara: b.catatan_bendahara || 'Telah diverifikasi sesuai bukti kuitansi pengeluaran riil guru.',
        });
    };

    const handleSaveDisbursement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBiaya) return;
        form.put(`/keuangan/${selectedBiaya.id}`, {
            onSuccess: () => setSelectedBiaya(null),
        });
    };

    const [activeTab, setActiveTab] = useState<'daftar' | 'guru' | 'bulanan'>('daftar');

    // Live subtotal in modal
    const uangHarianTotal = form.data.uang_harian_hari * form.data.uang_harian_per_hari;
    const hotelTotal = form.data.biaya_penginapan_malam * form.data.biaya_penginapan_per_malam;
    const modalTotal = uangHarianTotal + Number(form.data.biaya_transportasi || 0) + hotelTotal + Number(form.data.biaya_lainnya || 0);

    return (
        <>
            <Head title="Laporan Keuangan & Rekapitulasi SPPD - SMK Budi Mulia" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Laporan Keuangan & Rekapitulasi SPPD
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Rekapitulasi biaya perjalanan dinas per guru, per bulan, komponen biaya, dan status pencairan oleh Bendahara.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs">
                            <a href="/keuangan/export-excel" download>
                                <FileText className="mr-1.5 size-4" />
                                Export Excel (CSV)
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Metrics Cards: 4 Komponen Utama Biaya & Total */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:border-foreground/30 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Total Uang Harian
                            </CardTitle>
                            <DollarSign className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-foreground">
                                {formatRupiah(metrics.total_uang_harian ?? 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Akumulasi uang saku harian guru</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-foreground/30 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Total Biaya Transportasi
                            </CardTitle>
                            <DollarSign className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-foreground">
                                {formatRupiah(metrics.total_transportasi ?? 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Tiket kereta, pesawat, dan BBM</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-foreground/30 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Total Biaya Penginapan
                            </CardTitle>
                            <DollarSign className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-foreground">
                                {formatRupiah(metrics.total_penginapan ?? 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Akomodasi hotel & wisma</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-emerald-500/40 border-emerald-500/20 bg-emerald-500/5 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                                Total Pembayaran (Lunas)
                            </CardTitle>
                            <CheckCircle2 className="size-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {formatRupiah(metrics.total_pembayaran ?? metrics.total_lunas)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{metrics.count_lunas} Transaksi Kas Keluar</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Navigation Tabs */}
                <div className="flex border-b border-border gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('daftar')}
                        className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-all ${
                            activeTab === 'daftar'
                                ? 'border-orange-600 text-orange-600'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Daftar Rincian Biaya SPPD
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('guru')}
                        className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-all ${
                            activeTab === 'guru'
                                ? 'border-orange-600 text-orange-600'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Rekap Biaya Per Guru
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('bulanan')}
                        className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-all ${
                            activeTab === 'bulanan'
                                ? 'border-orange-600 text-orange-600'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Rekap Pengeluaran Bulanan
                    </button>
                </div>

                {activeTab === 'daftar' && (
                    <>
                        {/* Filters */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => handleTabChange('semua')}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                        currentStatus === 'semua'
                                            ? 'bg-foreground text-background shadow-xs'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    Semua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTabChange('menunggu_pencairan')}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                        currentStatus === 'menunggu_pencairan'
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    Menunggu Pencairan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTabChange('lunas')}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                        currentStatus === 'lunas'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    Lunas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTabChange('belum_dibayar')}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                        currentStatus === 'belum_dibayar'
                                            ? 'bg-muted-foreground text-white shadow-xs'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    Belum Dibayar
                                </button>
                            </div>

                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari nomor SPPD / nama..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 h-8 text-xs w-56"
                                    />
                                </div>
                                <Button type="submit" variant="secondary" size="sm" className="h-8 text-xs">
                                    Cari
                                </Button>
                            </form>
                        </div>

                        {/* Table Daftar Biaya */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Daftar Biaya & Pertanggungjawaban SPPD</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b text-xs uppercase text-muted-foreground">
                                                <th className="pb-3 pl-1">Penerima & SPPD</th>
                                                <th className="pb-3">Tujuan & Waktu</th>
                                                <th className="pb-3">Uang Harian</th>
                                                <th className="pb-3">Transport</th>
                                                <th className="pb-3">Penginapan</th>
                                                <th className="pb-3">Lainnya</th>
                                                <th className="pb-3">Total Riil</th>
                                                <th className="pb-3">Status</th>
                                                <th className="pb-3 text-right pr-1">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {biayas.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                                                        Tidak ada data keuangan perjalanan dinas ditemukan.
                                                    </td>
                                                </tr>
                                            ) : (
                                                biayas.data.map((b) => (
                                                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="py-3.5 pl-1">
                                                            <div className="font-semibold text-foreground">{b.sppd?.pegawai?.nama || 'Guru'}</div>
                                                            <div className="text-xs text-muted-foreground">{b.sppd?.nomor_sppd}</div>
                                                            <div className="text-[11px] text-muted-foreground">
                                                                Rek: {b.sppd?.pegawai?.nama_bank} - {b.sppd?.pegawai?.nomor_rekening}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 text-xs">
                                                            <div className="font-medium text-foreground">{b.sppd?.tempat_tujuan}</div>
                                                            <div className="text-muted-foreground">{b.sppd?.lama_hari} Hari Perjalanan</div>
                                                        </td>
                                                        <td className="py-3.5 text-xs font-mono">
                                                            <div>{formatRupiah(b.uang_harian_total)}</div>
                                                            <div className="text-[10px] text-muted-foreground">({b.uang_harian_hari}hr @{formatRupiah(b.uang_harian_per_hari)})</div>
                                                        </td>
                                                        <td className="py-3.5 text-xs font-mono">
                                                            {formatRupiah(b.biaya_transportasi)}
                                                        </td>
                                                        <td className="py-3.5 text-xs font-mono">
                                                            <div>{formatRupiah(b.biaya_penginapan_total)}</div>
                                                            <div className="text-[10px] text-muted-foreground">({b.biaya_penginapan_malam}mlm @{formatRupiah(b.biaya_penginapan_per_malam)})</div>
                                                        </td>
                                                        <td className="py-3.5 text-xs font-mono">
                                                            <div>{formatRupiah(b.biaya_lainnya)}</div>
                                                            {b.keterangan_biaya_lainnya && (
                                                                <div className="text-[10px] text-muted-foreground truncate max-w-[100px]">{b.keterangan_biaya_lainnya}</div>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 text-xs font-bold text-foreground font-mono">
                                                            {formatRupiah(b.total_biaya)}
                                                        </td>
                                                        <td className="py-3.5">
                                                            {b.status_pembayaran === 'lunas' ? (
                                                                <Badge className="bg-emerald-600 text-white border-emerald-600">Lunas</Badge>
                                                            ) : b.status_pembayaran === 'menunggu_pencairan' ? (
                                                                <Badge className="bg-amber-600 text-white border-amber-600">Menunggu</Badge>
                                                            ) : (
                                                                <Badge variant="outline">Belum Bayar</Badge>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 text-right pr-1">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {b.status_pembayaran === 'lunas' && (
                                                                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                                                                        <Link href={`/dokumen/print/rincian-biaya/${b.sppd_id}`} target="_blank">
                                                                            <Printer className="size-3.5 mr-1" />
                                                                            Kuitansi
                                                                        </Link>
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    onClick={() => openDisbursementModal(b)}
                                                                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5"
                                                                >
                                                                    <WalletCards className="size-3.5 mr-1" />
                                                                    {b.status_pembayaran === 'lunas' ? 'Edit Rincian' : 'Verifikasi & Cairkan'}
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
                    </>
                )}

                {/* Tab: Rekap Biaya Per Guru */}
                {activeTab === 'guru' && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Rekapitulasi Biaya Per Guru</CardTitle>
                            <CardDescription>
                                Total biaya penugasan dan akumulasi pencairan dana yang diterima oleh masing-masing guru
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b text-xs uppercase text-muted-foreground">
                                            <th className="pb-3 pl-1">Nama Guru</th>
                                            <th className="pb-3">NIP</th>
                                            <th className="pb-3">Jabatan</th>
                                            <th className="pb-3">Bank & No Rekening</th>
                                            <th className="pb-3 text-center">Total Penugasan</th>
                                            <th className="pb-3 text-right">Total Biaya Usulan</th>
                                            <th className="pb-3 text-right pr-1">Total Telah Dicairkan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {!rekap_guru || rekap_guru.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                    Belum ada rekapitulasi biaya guru.
                                                </td>
                                            </tr>
                                        ) : (
                                            rekap_guru.map((g, idx) => (
                                                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-3.5 pl-1 font-semibold text-foreground">
                                                        {g.nama}
                                                    </td>
                                                    <td className="py-3.5 text-xs text-muted-foreground font-mono">
                                                        {g.nip}
                                                    </td>
                                                    <td className="py-3.5 text-xs text-muted-foreground">
                                                        {g.jabatan}
                                                    </td>
                                                    <td className="py-3.5 text-xs">
                                                        <span className="font-semibold">{g.nama_bank}</span> -{' '}
                                                        <span className="font-mono text-muted-foreground">{g.nomor_rekening}</span>
                                                    </td>
                                                    <td className="py-3.5 text-center text-xs font-bold text-foreground">
                                                        {g.total_perjalanan} Kali
                                                    </td>
                                                    <td className="py-3.5 text-right text-xs font-bold text-foreground font-mono">
                                                        {formatRupiah(g.total_biaya)}
                                                    </td>
                                                    <td className="py-3.5 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono pr-1">
                                                        {formatRupiah(g.total_dibayar)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tab: Rekap Pengeluaran Bulanan */}
                {activeTab === 'bulanan' && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Rekapitulasi Pengeluaran Bulanan</CardTitle>
                            <CardDescription>
                                Rincian komponen pengeluaran perjalanan dinas guru per bulan berjalan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b text-xs uppercase text-muted-foreground">
                                            <th className="pb-3 pl-1">Periode Bulan</th>
                                            <th className="pb-3 text-center">Jumlah SPPD</th>
                                            <th className="pb-3 text-right">Uang Harian</th>
                                            <th className="pb-3 text-right">Transportasi</th>
                                            <th className="pb-3 text-right">Penginapan</th>
                                            <th className="pb-3 text-right">Biaya Lainnya</th>
                                            <th className="pb-3 text-right pr-1">Total Pengeluaran</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {!rekap_bulanan || rekap_bulanan.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                    Belum ada rekapitulasi bulanan.
                                                </td>
                                            </tr>
                                        ) : (
                                            rekap_bulanan.map((b, idx) => (
                                                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-3.5 pl-1 font-semibold text-foreground">
                                                        {b.bulan}
                                                    </td>
                                                    <td className="py-3.5 text-center text-xs font-bold text-foreground">
                                                        {b.jumlah_perjalanan} Tugas
                                                    </td>
                                                    <td className="py-3.5 text-right text-xs font-mono">
                                                        {formatRupiah(b.uang_harian)}
                                                    </td>
                                                    <td className="py-3.5 text-right text-xs font-mono">
                                                        {formatRupiah(b.transportasi)}
                                                    </td>
                                                    <td className="py-3.5 text-right text-xs font-mono">
                                                        {formatRupiah(b.penginapan)}
                                                    </td>
                                                    <td className="py-3.5 text-right text-xs font-mono">
                                                        {formatRupiah(b.biaya_lainnya)}
                                                    </td>
                                                    <td className="py-3.5 text-right text-xs font-bold text-orange-600 font-mono pr-1">
                                                        {formatRupiah(b.total)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Verification / Disbursement Modal */}
                <Dialog open={!!selectedBiaya} onOpenChange={(open) => !open && setSelectedBiaya(null)}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Verifikasi & Pelunasan Biaya Perjalanan Dinas</DialogTitle>
                            <DialogDescription>
                                SPPD: {selectedBiaya?.sppd?.nomor_sppd} — Penerima: {selectedBiaya?.sppd?.pegawai?.nama}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSaveDisbursement} className="space-y-4 pt-2">
                            {/* Rekening Box */}
                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-muted-foreground">Tujuan Transfer Bank:</span>
                                    <div className="font-bold text-sm text-foreground">
                                        {selectedBiaya?.sppd?.pegawai?.nama_bank} — {selectedBiaya?.sppd?.pegawai?.nomor_rekening}
                                    </div>
                                    <span className="text-muted-foreground">Atas Nama: {selectedBiaya?.sppd?.pegawai?.nama}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-muted-foreground block">Total Terhitung:</span>
                                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatRupiah(modalTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Cost Breakdown Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label>Uang Harian (Hari)</Label>
                                    <Input
                                        type="number"
                                        value={form.data.uang_harian_hari}
                                        onChange={(e) => form.setData('uang_harian_hari', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label>Tarif Uang Harian per Hari (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={form.data.uang_harian_per_hari}
                                        onChange={(e) => form.setData('uang_harian_per_hari', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label>Penginapan (Malam)</Label>
                                    <Input
                                        type="number"
                                        value={form.data.biaya_penginapan_malam}
                                        onChange={(e) => form.setData('biaya_penginapan_malam', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label>Tarif Penginapan per Malam (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={form.data.biaya_penginapan_per_malam}
                                        onChange={(e) => form.setData('biaya_penginapan_per_malam', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label>Biaya Transportasi Riil (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={form.data.biaya_transportasi}
                                        onChange={(e) => form.setData('biaya_transportasi', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label>Biaya Lainnya (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={form.data.biaya_lainnya}
                                        onChange={(e) => form.setData('biaya_lainnya', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            {/* Payment metadata */}
                            <div className="border-t border-border pt-3 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <Label htmlFor="pay_status">Status Pembayaran *</Label>
                                        <select
                                            id="pay_status"
                                            value={form.data.status_pembayaran}
                                            onChange={(e) => form.setData('status_pembayaran', e.target.value as any)}
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-semibold"
                                        >
                                            <option value="lunas">Lunas</option>
                                            <option value="menunggu_pencairan">Menunggu Pencairan</option>
                                            <option value="belum_dibayar">Belum Dibayar</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="pay_method">Metode Pembayaran</Label>
                                        <select
                                            id="pay_method"
                                            value={form.data.metode_pembayaran}
                                            onChange={(e) => form.setData('metode_pembayaran', e.target.value)}
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                        >
                                            <option value="Transfer Bank">Transfer Bank</option>
                                            <option value="Kas / Tunai">Kas / Tunai</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="pay_date">Tanggal Bayar</Label>
                                        <Input
                                            id="pay_date"
                                            type="date"
                                            value={form.data.tanggal_bayar}
                                            onChange={(e) => form.setData('tanggal_bayar', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="pay_proof">Nomor Bukti Kas / SP2D *</Label>
                                    <Input
                                        id="pay_proof"
                                        required
                                        value={form.data.nomor_bukti_kas}
                                        onChange={(e) => form.setData('nomor_bukti_kas', e.target.value)}
                                        placeholder="BKU-SP2D/2026/03/001"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="pay_notes">Catatan Bendahara</Label>
                                    <textarea
                                        id="pay_notes"
                                        rows={2}
                                        value={form.data.catatan_bendahara}
                                        onChange={(e) => form.setData('catatan_bendahara', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background p-2 text-sm"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setSelectedBiaya(null)}>
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                >
                                    {form.processing ? 'Menyimpan...' : 'Simpan Pembayaran'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
