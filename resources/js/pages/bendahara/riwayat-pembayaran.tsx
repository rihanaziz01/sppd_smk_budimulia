import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Eye,
    FileText,
    History,
    MapPin,
    Printer,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface RiwayatItem {
    id: number;
    sppd_id: number;
    uang_harian_total: number;
    biaya_transportasi: number;
    biaya_penginapan_total: number;
    biaya_lainnya: number;
    total_biaya: number;
    status_pembayaran: string;
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

interface RiwayatProps {
    riwayat: {
        data: RiwayatItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    total_dibayar: number;
    filters: {
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

export default function BendaharaRiwayatPembayaranIndex({
    riwayat,
    total_dibayar,
    filters,
}: RiwayatProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/bendahara/riwayat-pembayaran',
            { search: search || undefined },
            { preserveState: true }
        );
    };

    return (
        <>
            <Head title="Riwayat Pembayaran Perjalanan Dinas - Bendahara" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header Card */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2.5">
                            <History className="size-7 text-orange-600" />
                            Riwayat Pembayaran Selesai
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Arsip seluruh pembayaran perjalanan dinas guru yang telah ditransfer atau dibayarkan secara tunai.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
                            <Link href="/bendahara/pembayaran">
                                Ke Antrean Pembayaran &rarr;
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Total Paid Summary */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="hover:border-foreground/30 transition-colors sm:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Realisasi Biaya SPPD Yang Telah Dibayarkan
                            </CardTitle>
                            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                                <DollarSign className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {formatRupiah(total_dibayar)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Akumulasi pencairan kas penugasan guru yang tercatat lunas
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-foreground/30 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Jumlah Transaksi Lunas
                            </CardTitle>
                            <div className="rounded-lg bg-muted p-2 text-foreground">
                                <CheckCircle2 className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {riwayat.total} Transaksi
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dokumen BKU kas keluar diterbitkan
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari no kas, guru, SPPD, tujuan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card"
                    />
                </form>

                {/* Table Riwayat Pembayaran */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Arsip Bukti Pembayaran Kas</CardTitle>
                        <CardDescription>
                            Daftar kuitansi kas dan slip transfer bank penugasan guru
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-xs uppercase text-muted-foreground">
                                        <th className="pb-3 pl-1">Nomor Kas & Tanggal</th>
                                        <th className="pb-3">Guru Penerima</th>
                                        <th className="pb-3">SPPD & Tujuan</th>
                                        <th className="pb-3">Metode Bayar</th>
                                        <th className="pb-3">Nominal Dicairkan</th>
                                        <th className="pb-3">Slip Transfer</th>
                                        <th className="pb-3 text-right pr-1">Kuitansi Resmi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {riwayat.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                Belum ada arsip riwayat pembayaran selesai.
                                            </td>
                                        </tr>
                                    ) : (
                                        riwayat.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-3.5 pl-1">
                                                    <div className="font-mono font-semibold text-foreground text-xs">
                                                        {row.nomor_bukti_kas || '-'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <Calendar className="size-3 text-muted-foreground" />
                                                        {row.tanggal_bayar
                                                            ? new Date(row.tanggal_bayar).toLocaleDateString('id-ID')
                                                            : '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3.5">
                                                    <div className="font-semibold text-foreground">
                                                        {row.sppd?.pegawai?.nama}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {row.sppd?.pegawai?.nama_bank} •{' '}
                                                        <span className="font-mono">{row.sppd?.pegawai?.nomor_rekening}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 max-w-xs text-xs">
                                                    <div className="font-medium text-foreground flex items-center gap-1">
                                                        <MapPin className="size-3 text-muted-foreground shrink-0" />
                                                        <span className="truncate">{row.sppd?.tempat_tujuan}</span>
                                                    </div>
                                                    <div className="text-muted-foreground font-mono mt-0.5">
                                                        {row.sppd?.nomor_sppd}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 text-xs font-medium text-foreground">
                                                    {row.metode_pembayaran || 'Transfer Bank'}
                                                </td>
                                                <td className="py-3.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatRupiah(row.total_biaya)}
                                                </td>
                                                <td className="py-3.5 text-xs">
                                                    {row.file_bukti_bayar ? (
                                                        <a
                                                            href={`/storage/${row.file_bukti_bayar}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-orange-600 hover:underline flex items-center gap-1 font-medium"
                                                        >
                                                            <Eye className="size-3" />
                                                            Buka Slip
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 text-right pr-1">
                                                    <Button size="sm" variant="outline" asChild>
                                                        <a
                                                            href={`/bendahara/pembayaran/${row.id}/kuitansi`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1"
                                                        >
                                                            <Printer className="size-3.5" />
                                                            Cetak Kuitansi
                                                        </a>
                                                    </Button>
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
