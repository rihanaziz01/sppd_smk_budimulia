import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    Coins,
    Download,
    Eye,
    FileSpreadsheet,
    Filter,
    MapPin,
    Printer,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SppdRow {
    id: number;
    nomor_sp: string;
    nomor_sppd: string;
    maksud_tujuan: string;
    tempat_tujuan: string;
    alat_angkut: string;
    tanggal_berangkat: string;
    tanggal_kembali: string;
    lama_hari: number;
    status: string;
    pegawai?: {
        nama: string;
        nip: string;
        golongan: string;
        unit_kerja: string;
    };
    biaya?: {
        total_biaya: number;
        status_pembayaran: string;
    };
}

interface LaporanProps {
    sppds: SppdRow[];
    rekap_bulanan: {
        bulan: number;
        nama_bulan: string;
        jumlah_perjalanan: number;
        total_biaya: number;
        biaya_lunas: number;
    }[];
    rekap_pegawai: {
        id: number;
        nama: string;
        nip: string;
        jabatan: string;
        unit_kerja: string;
        jumlah_perjalanan: number;
        total_hari: number;
        total_biaya: number;
    }[];
    rekap_tujuan: {
        tempat_tujuan: string;
        total: number;
        total_hari: number;
    }[];
    pegawais: {
        id: number;
        nama: string;
    }[];
    filters: {
        tahun: number;
        bulan: string;
        pegawai_id: string;
        status: string;
    };
    summary: {
        total_perjalanan: number;
        total_biaya: number;
        total_lunas: number;
        total_belum_lunas: number;
    };
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function LaporanIndex({
    sppds,
    rekap_bulanan,
    rekap_pegawai,
    rekap_tujuan,
    pegawais,
    filters,
    summary,
}: LaporanProps) {
    const [tahun, setTahun] = useState(filters.tahun || new Date().getFullYear());
    const [bulan, setBulan] = useState(filters.bulan || 'semua');
    const [pegawaiId, setPegawaiId] = useState(filters.pegawai_id || 'semua');
    const [status, setStatus] = useState(filters.status || 'semua');

    const [activeView, setActiveView] = useState<'ringkasan' | 'pegawai' | 'tujuan' | 'daftar'>('ringkasan');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/laporan',
            {
                tahun,
                bulan,
                pegawai_id: pegawaiId,
                status,
            },
            { preserveState: true }
        );
    };

    const handleExportCsv = () => {
        const url = `/laporan/export?tahun=${tahun}&bulan=${bulan}&pegawai_id=${pegawaiId}&status=${status}`;
        window.open(url, '_blank');
    };

    return (
        <>
            <Head title="Laporan & Rekap SPPD Guru - SMK Budi Mulia" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Laporan & Rekapitulasi SPPD Guru
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Analisis rekap perjalanan per bulan, rekap per guru, serapan anggaran RKAS, dan laporan penugasan berdasarkan tujuan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                            className="text-xs font-medium"
                        >
                            <Printer className="mr-1.5 size-4" />
                            Cetak Laporan
                        </Button>

                        <Button
                            onClick={handleExportCsv}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                        >
                            <FileSpreadsheet className="mr-1.5 size-4" />
                            Export Excel / CSV
                        </Button>
                    </div>
                </div>

                {/* Filter Control Box */}
                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground block mb-1">Tahun Anggaran:</label>
                                <select
                                    value={tahun}
                                    onChange={(e) => setTahun(Number(e.target.value))}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                >
                                    <option value={2026}>2026</option>
                                    <option value={2025}>2025</option>
                                    <option value={2024}>2024</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-muted-foreground block mb-1">Bulan:</label>
                                <select
                                    value={bulan}
                                    onChange={(e) => setBulan(e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                >
                                    <option value="semua">Semua Bulan</option>
                                    <option value="1">Januari</option>
                                    <option value="2">Februari</option>
                                    <option value="3">Maret</option>
                                    <option value="4">April</option>
                                    <option value="5">Mei</option>
                                    <option value="6">Juni</option>
                                    <option value="7">Juli</option>
                                    <option value="8">Agustus</option>
                                    <option value="9">September</option>
                                    <option value="10">Oktober</option>
                                    <option value="11">November</option>
                                    <option value="12">Desember</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-muted-foreground block mb-1">Guru Pelaksana:</label>
                                <select
                                    value={pegawaiId}
                                    onChange={(e) => setPegawaiId(e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                >
                                    <option value="semua">Semua Guru</option>
                                    {pegawais.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-muted-foreground block mb-1">Status SPPD:</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                >
                                    <option value="semua">Semua Status</option>
                                    <option value="diajukan">Menunggu Persetujuan</option>
                                    <option value="disetujui">Disetujui</option>
                                    <option value="selesai">Selesai</option>
                                    <option value="ditolak">Ditolak</option>
                                </select>
                            </div>

                            <div>
                                <Button type="submit" variant="secondary" className="w-full h-9">
                                    <Filter className="mr-1.5 size-3.5" />
                                    Terapkan Filter
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Summary Metrics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Total Perjalanan Terfilter
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_perjalanan} SPPD</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Total Usulan Biaya
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{formatRupiah(summary.total_biaya)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                                Realisasi Lunas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                {formatRupiah(summary.total_lunas)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">
                                Belum Lunas / Dalam Proses
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                {formatRupiah(summary.total_belum_lunas)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveView('ringkasan')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            activeView === 'ringkasan'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                        <BarChart3 className="size-3.5" />
                        <span>Rekap Per Bulan</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveView('pegawai')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            activeView === 'pegawai'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                        <Users className="size-3.5" />
                        <span>Rekap Per Guru</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveView('tujuan')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            activeView === 'tujuan'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                        <MapPin className="size-3.5" />
                        <span>Rekap Per Tujuan</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveView('daftar')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            activeView === 'daftar'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                        <Calendar className="size-3.5" />
                        <span>Daftar Riwayat SPPD</span>
                    </button>
                </div>

                {/* View 1: Rekap Bulanan */}
                {activeView === 'ringkasan' && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Rekapitulasi Bulanan Tahun {tahun}</CardTitle>
                            <CardDescription>Akumulasi jumlah penugasan dinas guru dan serapan dana per bulan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b text-xs font-medium text-muted-foreground uppercase">
                                        <tr>
                                            <th className="pb-3 pl-1">Bulan</th>
                                            <th className="pb-3 text-center">Jumlah Perjalanan Dinas</th>
                                            <th className="pb-3 text-right">Total Anggaran</th>
                                            <th className="pb-3 text-right">Realisasi Lunas</th>
                                            <th className="pb-3 text-right pr-1">Sisa Pembayaran</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {rekap_bulanan.map((m) => (
                                            <tr key={m.bulan} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-3 pl-1 font-semibold text-foreground">
                                                    {m.nama_bulan}
                                                </td>
                                                <td className="py-3 text-center">
                                                    {m.jumlah_perjalanan > 0 ? (
                                                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                                                            {m.jumlah_perjalanan} Kegiatan
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">0</span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-right font-medium">
                                                    {formatRupiah(m.total_biaya)}
                                                </td>
                                                <td className="py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                                                    {formatRupiah(m.biaya_lunas)}
                                                </td>
                                                <td className="py-3 text-right text-muted-foreground pr-1">
                                                    {formatRupiah(m.total_biaya - m.biaya_lunas)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* View 2: Rekap Per Guru */}
                {activeView === 'pegawai' && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Rekapitulasi Perjalanan Per Guru</CardTitle>
                            <CardDescription>Akumulasi frekuensi tugas, jumlah hari dinas, dan serapan anggaran tiap guru SMK Budi Mulia</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b text-xs font-medium text-muted-foreground uppercase">
                                        <tr>
                                            <th className="pb-3 pl-1">Nama Guru & NUPTK/NIP</th>
                                            <th className="pb-3">Mata Pelajaran & Jabatan</th>
                                            <th className="pb-3 text-center">Frekuensi Tugas</th>
                                            <th className="pb-3 text-center">Total Hari Dinas</th>
                                            <th className="pb-3 text-right pr-1">Total Biaya Terserap</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {rekap_pegawai.map((p) => (
                                            <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-3.5 pl-1">
                                                    <div className="font-semibold text-foreground">{p.nama}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">NIP: {p.nip}</div>
                                                </td>
                                                <td className="py-3.5 text-xs">
                                                    <div className="font-medium text-foreground">{p.jabatan}</div>
                                                    <div className="text-muted-foreground">{p.unit_kerja}</div>
                                                </td>
                                                <td className="py-3.5 text-center font-semibold">
                                                    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
                                                        {p.jumlah_perjalanan} Kali
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 text-center text-xs font-medium">
                                                    {p.total_hari} Hari
                                                </td>
                                                <td className="py-3.5 text-right font-bold text-foreground pr-1">
                                                    {formatRupiah(p.total_biaya)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* View 3: Rekap Berdasarkan Tujuan */}
                {activeView === 'tujuan' && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Laporan Berdasarkan Destinasi / Tempat Tujuan</CardTitle>
                            <CardDescription>Peringkat kota dan instansi tujuan perjalanan dinas tersering</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b text-xs font-medium text-muted-foreground uppercase">
                                        <tr>
                                            <th className="pb-3 pl-1 w-12 text-center">No</th>
                                            <th className="pb-3">Tempat / Kota Tujuan</th>
                                            <th className="pb-3 text-center">Frekuensi Penugasan</th>
                                            <th className="pb-3 text-right pr-1">Akumulasi Hari Dinas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {rekap_tujuan.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                                    Belum ada data destinasi perjalanan.
                                                </td>
                                            </tr>
                                        ) : (
                                            rekap_tujuan.map((t, idx) => (
                                                <tr key={t.tempat_tujuan} className="hover:bg-muted/40 transition-colors">
                                                    <td className="py-3 pl-1 text-center font-bold text-muted-foreground">{idx + 1}</td>
                                                    <td className="py-3 font-semibold text-foreground flex items-center gap-2">
                                                        <MapPin className="size-4 text-rose-500 shrink-0" />
                                                        <span>{t.tempat_tujuan}</span>
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <Badge variant="outline" className="font-semibold">
                                                            {t.total} Kali Kunjungan
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 text-right font-medium pr-1">
                                                        {t.total_hari} Hari
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

                {/* View 4: Daftar Rinci */}
                {activeView === 'daftar' && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Tabel Rinci Data SPPD</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b text-xs font-medium text-muted-foreground uppercase">
                                        <tr>
                                            <th className="pb-3 pl-1">No. SPPD</th>
                                            <th className="pb-3">Pegawai</th>
                                            <th className="pb-3">Tujuan</th>
                                            <th className="pb-3">Jadwal</th>
                                            <th className="pb-3">Total Biaya</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3 text-right pr-1">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {sppds.map((sppd) => (
                                            <tr key={sppd.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-3 pl-1 font-semibold">{sppd.nomor_sppd}</td>
                                                <td className="py-3 text-xs">{sppd.pegawai?.nama}</td>
                                                <td className="py-3 text-xs font-medium">{sppd.tempat_tujuan}</td>
                                                <td className="py-3 text-xs">
                                                    {new Date(sppd.tanggal_berangkat).toLocaleDateString('id-ID')} ({sppd.lama_hari} hari)
                                                </td>
                                                <td className="py-3 text-xs font-bold">
                                                    {sppd.biaya ? formatRupiah(sppd.biaya.total_biaya) : '-'}
                                                </td>
                                                <td className="py-3">
                                                    <Badge variant="outline" className="text-[10px] uppercase">
                                                        {sppd.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-right pr-1">
                                                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                                                        <a href={`/sppd/${sppd.id}`}>Detail</a>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
