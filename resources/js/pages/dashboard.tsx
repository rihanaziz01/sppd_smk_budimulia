import { Head, Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    MapPin,
    Plane,
    PlusCircle,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardMetrics {
    total_sppd: number;
    pending_sppd: number;
    approved_sppd: number;
    completed_sppd: number;
    rejected_sppd: number;
    total_biaya: number;
    biaya_lunas: number;
    biaya_pending: number;
    total_pegawai: number;
}

interface SppdItem {
    id: number;
    nomor_sp: string;
    nomor_sppd: string;
    maksud_tujuan: string;
    tempat_tujuan: string;
    alat_angkut: string;
    tanggal_berangkat: string;
    tanggal_kembali: string;
    lama_hari: number;
    status: 'draft' | 'diajukan' | 'disetujui' | 'ditolak' | 'selesai';
    pegawai?: {
        nama: string;
        nip: string;
        jabatan: string;
    };
    biaya?: {
        total_biaya: number;
        status_pembayaran: string;
    };
}

interface DashboardProps {
    metrics: DashboardMetrics;
    my_stats?: {
        total: number;
        diajukan: number;
        disetujui: number;
        ditolak?: number;
        selesai: number;
    };
    bendahara_stats?: {
        total_sppd: number;
        menunggu_verifikasi: number;
        total_anggaran: number;
        total_dibayarkan: number;
        total_belum_dibayar: number;
        pengeluaran_bulan_ini: number;
    };
    antrean_verifikasi?: any[];
    recent_sppds: SppdItem[];
    transport_stats: { alat_angkut: string; count: number }[];
    monthly_trends: { month: string; count: number }[];
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
            return <Badge className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900">Disetujui</Badge>;
        case 'diajukan':
            return <Badge variant="outline" className="border-neutral-400 text-neutral-800 dark:text-neutral-200">Menunggu</Badge>;
        case 'selesai':
            return <Badge variant="secondary" className="bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">Selesai</Badge>;
        case 'ditolak':
            return <Badge variant="outline" className="border-red-400 text-red-600 dark:text-red-400">Ditolak</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function Dashboard({
    metrics,
    my_stats,
    bendahara_stats,
    antrean_verifikasi = [],
    recent_sppds = [],
    transport_stats = [],
    monthly_trends = [],
}: DashboardProps) {
    const { auth } = usePage().props as {
        auth?: {
            user?: {
                id: number;
                name: string;
                email: string;
                role?: string;
                pegawai?: {
                    nama: string;
                    jabatan: string;
                    unit_kerja: string;
                };
            };
        };
    };

    const isGuru = auth?.user?.role === 'pegawai' || auth?.user?.role === 'guru';
    const isBendahara = auth?.user?.role === 'bendahara';
    const maxMonthly = Math.max(...monthly_trends.map((m) => m.count), 1);

    return (
        <>
            <Head
                title={
                    isGuru
                        ? 'Dashboard Guru - e-SPPD SMK Budi Mulia'
                        : isBendahara
                          ? 'Dashboard Bendahara Keuangan - SMK Budi Mulia'
                          : 'Dashboard SPPD Guru - SMK Budi Mulia'
                }
            />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header Welcome Card */}
                <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xs">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-xs border border-border">
                                <img
                                    src="/images/logo-smk-budi-mulia.png"
                                    alt="Logo SMK Budi Mulia Karawang"
                                    className="size-full object-contain"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border">
                                    <Briefcase className="size-3.5" />
                                    <span>
                                        {isGuru
                                            ? 'Portal Penugasan Guru • SMK Budi Mulia Karawang'
                                            : isBendahara
                                              ? 'Portal Pengelolaan Keuangan & Verifikasi SPPD • Bendahara Sekolah'
                                              : 'Sistem Informasi SPPD Guru • SMK Budi Mulia Karawang'}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    Selamat Datang, {auth?.user?.name || (isBendahara ? 'Ibu Bendahara' : 'Bapak/Ibu Guru')}
                                </h1>
                                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                    {isGuru
                                        ? 'Kelola pengajuan perjalanan dinas Anda, pantau status persetujuan Kepala Sekolah, cetak dokumen resmi SPT & SPPD, dan serahkan laporan kegiatan setelah bertugas.'
                                        : isBendahara
                                          ? 'Verifikasi rincian biaya perjalanan dinas guru yang telah disetujui Kepala Sekolah, periksa bukti pengeluaran fisik/kuitansi, kelola pos pagu anggaran, dan proses pencairan dana penugasan.'
                                          : 'Kelola penugasan perjalanan dinas guru, persetujuan Kepala Sekolah, verifikasi biaya Bendahara, serta penerbitan SPT & formulir SPPD resmi SMK Budi Mulia Karawang.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            {isBendahara ? (
                                <>
                                    <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-xs">
                                        <Link href="/bendahara/verifikasi">
                                            <CheckCircle2 className="mr-1.5 size-4" />
                                            Verifikasi Biaya ({bendahara_stats?.menunggu_verifikasi ?? 0})
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href="/bendahara/pembayaran">
                                            <DollarSign className="mr-1.5 size-4" />
                                            Proses Bayar
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-xs">
                                        <Link href="/sppd/create">
                                            <PlusCircle className="mr-1.5 size-4" />
                                            Buat Pengajuan SPPD
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={isGuru ? '/sppd' : '/laporan'}>
                                            <TrendingUp className="mr-1.5 size-4" />
                                            {isGuru ? 'Riwayat Pengajuan' : 'Rekap Laporan'}
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* KPI Metrics Cards: Bendahara (6 Metrik) vs Guru / Admin */}
                {isBendahara ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {/* Card 1: Total Pengajuan SPPD */}
                        <Card className="hover:border-foreground/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Total SPPD
                                </CardTitle>
                                <div className="rounded-lg bg-muted p-2 text-foreground">
                                    <FileText className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {bendahara_stats?.total_sppd ?? metrics.total_sppd}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Total seluruh penugasan</p>
                            </CardContent>
                        </Card>

                        {/* Card 2: Menunggu Verifikasi Biaya */}
                        <Card className="hover:border-orange-500/50 border-orange-500/20 bg-orange-500/5 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                                    Menunggu Verifikasi
                                </CardTitle>
                                <div className="rounded-lg bg-orange-500/10 p-2 text-orange-600">
                                    <Clock className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {bendahara_stats?.menunggu_verifikasi ?? 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">SPPD disetujui Kepsek</p>
                            </CardContent>
                        </Card>

                        {/* Card 3: Total Anggaran Perjalanan */}
                        <Card className="hover:border-foreground/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Total Pagu Anggaran
                                </CardTitle>
                                <div className="rounded-lg bg-muted p-2 text-foreground">
                                    <DollarSign className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold text-foreground truncate">
                                    {formatRupiah(bendahara_stats?.total_anggaran ?? 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Alokasi anggaran aktif</p>
                            </CardContent>
                        </Card>

                        {/* Card 4: Total Biaya Telah Dibayar */}
                        <Card className="hover:border-foreground/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Telah Dibayarkan
                                </CardTitle>
                                <div className="rounded-lg bg-muted p-2 text-foreground">
                                    <CheckCircle2 className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold text-foreground truncate">
                                    {formatRupiah(bendahara_stats?.total_dibayarkan ?? 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Status lunas/sudah bayar</p>
                            </CardContent>
                        </Card>

                        {/* Card 5: Total Biaya Belum Dibayar */}
                        <Card className="hover:border-foreground/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Belum Dibayar
                                </CardTitle>
                                <div className="rounded-lg bg-muted p-2 text-foreground">
                                    <XCircle className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold text-foreground truncate">
                                    {formatRupiah(bendahara_stats?.total_belum_dibayar ?? 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Menunggu pencairan</p>
                            </CardContent>
                        </Card>

                        {/* Card 6: Rekap Pengeluaran Bulan Ini */}
                        <Card className="hover:border-foreground/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Pengeluaran Bulan Ini
                                </CardTitle>
                                <div className="rounded-lg bg-muted p-2 text-foreground">
                                    <TrendingUp className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold text-foreground truncate">
                                    {formatRupiah(bendahara_stats?.pengeluaran_bulan_ini ?? 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Realisasi kas bulan ini</p>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Card 1: Total Pengajuan SPPD */}
                        <Card className="hover:border-foreground/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {isGuru ? 'Total Pengajuan SPPD' : 'Total Perjalanan Dinas Guru'}
                                </CardTitle>
                                <div className="rounded-lg bg-muted p-2 text-foreground">
                                    <FileText className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {isGuru ? (my_stats?.total ?? 0) : metrics.total_sppd}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {isGuru ? 'Semua pengajuan saya' : 'Semua penugasan terekam'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Card 2: Menunggu Persetujuan */}
                        <Card className="hover:border-foreground/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Pengajuan Menunggu
                                </CardTitle>
                                <div className="rounded-lg bg-muted p-2 text-foreground">
                                    <Clock className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {isGuru ? (my_stats?.diajukan ?? 0) : metrics.pending_sppd}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Menunggu persetujuan Kepsek
                                </p>
                            </CardContent>
                        </Card>

                        {/* Card 3: Disetujui */}
                        <Card className="hover:border-foreground/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Pengajuan Disetujui
                                </CardTitle>
                                <div className="rounded-lg bg-muted p-2 text-foreground">
                                    <CheckCircle2 className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {isGuru ? (my_stats?.disetujui ?? 0) : metrics.approved_sppd}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Siap cetak SPT & SPPD
                                </p>
                            </CardContent>
                        </Card>

                        {/* Card 4: Ditolak */}
                        <Card className="hover:border-foreground/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Pengajuan Ditolak
                                </CardTitle>
                                <div className="rounded-lg bg-muted p-2 text-foreground">
                                    <XCircle className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {isGuru ? (my_stats?.ditolak ?? 0) : metrics.rejected_sppd}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {isGuru ? 'Perlu perbaikan / dibatalkan' : 'Ditolak pimpinan'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Card 5: Perjalanan Dinas Selesai */}
                        <Card className="hover:border-foreground/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Perjalanan Selesai
                                </CardTitle>
                                <div className="rounded-lg bg-muted p-2 text-foreground">
                                    <Briefcase className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {isGuru ? (my_stats?.selesai ?? 0) : metrics.completed_sppd}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Laporan tugas diserahkan
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Visual Charts & Trends */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Monthly Bar Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">Tren Perjalanan Dinas Bulanan</CardTitle>
                                    <CardDescription>Frekuensi perjalanan dinas guru sepanjang tahun berjalan</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-xs">Tahun {new Date().getFullYear()}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-52 items-end gap-2 pt-6 pb-2">
                                {monthly_trends.map((item) => {
                                    const heightPercent = maxMonthly > 0 ? (item.count / maxMonthly) * 100 : 0;
                                    return (
                                        <div key={item.month} className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end">
                                            {/* Tooltip on hover */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 rounded bg-foreground text-background text-[10px] font-semibold px-1.5 py-0.5 pointer-events-none whitespace-nowrap z-10">
                                                {item.count} SPPD
                                            </div>
                                            {/* Bar */}
                                            <div
                                                style={{ height: `${Math.max(heightPercent, 6)}%` }}
                                                className={`w-full max-w-[28px] rounded-t-md transition-all ${
                                                    item.count > 0
                                                        ? 'bg-neutral-800 dark:bg-neutral-200 hover:bg-neutral-700'
                                                        : 'bg-muted hover:bg-muted-foreground/20'
                                                }`}
                                            />
                                            {/* Label */}
                                            <span className="text-[11px] font-medium text-muted-foreground">
                                                {item.month}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mode Transport & Quick Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Moda Transportasi</CardTitle>
                            <CardDescription>Distribusi sarana transportasi tugas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3.5">
                                {transport_stats.length === 0 ? (
                                    <p className="text-xs text-muted-foreground py-8 text-center">Belum ada data perjalanan.</p>
                                ) : (
                                    transport_stats.map((t) => {
                                        const total = metrics.total_sppd || 1;
                                        const pct = Math.round((t.count / total) * 100);
                                        return (
                                            <div key={t.alat_angkut} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-foreground flex items-center gap-1.5">
                                                        <Plane className="size-3 text-muted-foreground" />
                                                        {t.alat_angkut}
                                                    </span>
                                                    <span className="text-muted-foreground">{t.count} ({pct}%)</span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full bg-neutral-800 dark:bg-neutral-200 rounded-full transition-all"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-3.5">
                                <div className="flex items-center gap-2">
                                    <Users className="size-4 text-foreground" />
                                    <span className="text-xs font-semibold">Data Guru Aktif</span>
                                </div>
                                <p className="text-xl font-bold mt-1 text-foreground">{metrics.total_pegawai} Guru</p>
                                <Link
                                    href="/pegawai"
                                    className="text-xs text-foreground hover:underline inline-block mt-1 font-medium"
                                >
                                    Kelola data guru &rarr;
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Antrean Verifikasi Biaya Khusus Bendahara */}
                {isBendahara && (
                    <Card className="border-orange-500/30 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                                    <Clock className="size-4 text-orange-600" />
                                    Antrean Verifikasi Biaya & Pencairan (Disetujui Kepala Sekolah)
                                </CardTitle>
                                <CardDescription>
                                    Daftar penugasan guru yang siap diperiksa kelayakan biaya dan kuitansi pengeluarannya
                                </CardDescription>
                            </div>
                            <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-medium">
                                <Link href="/bendahara/verifikasi">Lihat Semua Antrean</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b text-xs uppercase text-muted-foreground">
                                            <th className="pb-3">Guru & Penugasan</th>
                                            <th className="pb-3">Tujuan & Waktu</th>
                                            <th className="pb-3">Estimasi Biaya</th>
                                            <th className="pb-3">Status Verifikasi</th>
                                            <th className="pb-3">Status Bayar</th>
                                            <th className="pb-3 text-right">Aksi Bendahara</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {antrean_verifikasi.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-6 text-center text-muted-foreground text-xs">
                                                    Tidak ada antrean verifikasi SPPD saat ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            antrean_verifikasi.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-3">
                                                        <div className="font-semibold text-foreground">{item.pegawai?.nama}</div>
                                                        <div className="text-xs text-muted-foreground">{item.nomor_sppd}</div>
                                                    </td>
                                                    <td className="py-3 text-xs">
                                                        <div className="font-medium text-foreground">{item.tempat_tujuan}</div>
                                                        <div className="text-muted-foreground">{item.lama_hari} Hari Perjalanan</div>
                                                    </td>
                                                    <td className="py-3 text-xs font-semibold">
                                                        {item.biaya ? formatRupiah(item.biaya.total_biaya) : '-'}
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                item.biaya?.status_verifikasi === 'terverifikasi'
                                                                    ? 'border-emerald-500 text-emerald-600'
                                                                    : 'border-orange-400 text-orange-600'
                                                            }
                                                        >
                                                            {item.biaya?.status_verifikasi === 'terverifikasi' ? 'Terverifikasi' : 'Menunggu'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge variant="secondary" className="capitalize text-xs">
                                                            {item.biaya?.status_pembayaran?.replace('_', ' ') || 'Belum Bayar'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button size="sm" variant="outline" asChild>
                                                                <Link href="/bendahara/verifikasi">Periksa</Link>
                                                            </Button>
                                                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                                                                <Link href="/bendahara/pembayaran">Bayar</Link>
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
                )}

                {/* Recent SPPD Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">Pengajuan Perjalanan Dinas Guru Terbaru</CardTitle>
                            <CardDescription>Daftar SPPD terkini beserta status persetujuan Kepala Sekolah dan rincian biaya</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/sppd">Lihat Semua SPPD</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b text-xs font-medium text-muted-foreground uppercase">
                                    <tr>
                                        <th className="pb-3 pl-1">No. SPPD & Guru</th>
                                        <th className="pb-3">Tujuan & Keperluan</th>
                                        <th className="pb-3">Tanggal & Waktu</th>
                                        <th className="pb-3">Transportasi</th>
                                        <th className="pb-3">Total Biaya</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right pr-1">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {recent_sppds.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                Belum ada pengajuan SPPD guru.
                                            </td>
                                        </tr>
                                    ) : (
                                        recent_sppds.map((sppd) => (
                                            <tr key={sppd.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-3 pl-1">
                                                    <div className="font-semibold text-foreground">{sppd.nomor_sppd}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {sppd.pegawai?.nama || 'Guru'}
                                                    </div>
                                                </td>
                                                <td className="py-3 max-w-xs">
                                                    <div className="font-medium text-foreground flex items-center gap-1">
                                                        <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                                                        <span className="truncate">{sppd.tempat_tujuan}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                                        {sppd.maksud_tujuan}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-xs">
                                                    <div className="flex items-center gap-1 font-medium">
                                                        <Calendar className="size-3 text-muted-foreground" />
                                                        <span>{new Date(sppd.tanggal_berangkat).toLocaleDateString('id-ID')}</span>
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {sppd.lama_hari} Hari Perjalanan
                                                    </div>
                                                </td>
                                                <td className="py-3 text-xs">
                                                    <Badge variant="outline" className="font-normal">
                                                        {sppd.alat_angkut}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-xs font-semibold">
                                                    {sppd.biaya ? formatRupiah(sppd.biaya.total_biaya) : '-'}
                                                </td>
                                                <td className="py-3">
                                                    {getStatusBadge(sppd.status)}
                                                </td>
                                                <td className="py-3 text-right pr-1">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/sppd/${sppd.id}`}>Detail</Link>
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
