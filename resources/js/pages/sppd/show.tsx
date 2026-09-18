import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Coins,
    CreditCard,
    Download,
    Edit2,
    FileCheck,
    FileText,
    MapPin,
    Plane,
    Printer,
    Send,
    Trash2,
    UploadCloud,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SppdDetailProps {
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
        status: 'draft' | 'diajukan' | 'disetujui' | 'ditolak' | 'selesai';
        catatan_revisi?: string | null;
        catatan_atasan?: string | null;
        pegawai?: {
            id: number;
            nama: string;
            nip: string;
            nuptk?: string | null;
            mata_pelajaran?: string | null;
            status_guru?: string | null;
            jabatan: string;
            unit_kerja: string;
            golongan: string;
            nomor_rekening: string;
            nama_bank: string;
            telepon?: string;
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
            status_pembayaran: string;
            tanggal_bayar?: string;
            metode_pembayaran?: string;
            nomor_bukti_kas?: string;
            catatan_bendahara?: string;
        };
        approvals?: {
            id: number;
            action: string;
            role: string;
            catatan?: string;
            created_at: string;
            user?: {
                name: string;
            };
        }[];
        dokumens?: {
            id: number;
            jenis_dokumen: string;
            nama_dokumen: string;
            file_path: string;
            file_size?: number;
            catatan?: string;
            created_at: string;
            uploaded_by_user?: {
                name: string;
            };
        }[];
        laporan?: {
            id: number;
            ringkasan_kegiatan: string;
            hasil_kegiatan: string;
            kendala?: string;
            saran_tindak_lanjut?: string;
            tanggal_laporan: string;
            status: string;
        };
    };
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function SppdShow({ sppd }: SppdDetailProps) {
    const { auth, flash } = usePage().props as {
        auth?: { user?: { id: number; role?: string; name: string } };
        flash?: { success?: string; error?: string };
    };

    const userRole = auth?.user?.role || 'pegawai';
    const isAtasanOrAdmin = userRole === 'atasan' || userRole === 'admin';
    const isBendaharaOrAdmin = userRole === 'bendahara' || userRole === 'admin';

    // Tabs
    const [activeTab, setActiveTab] = useState<'rincian' | 'biaya' | 'dokumen' | 'laporan' | 'riwayat'>('rincian');

    // Approval Form
    const approvalForm = useForm({
        action: 'disetujui',
        catatan: '',
    });

    const handleApproval = (action: 'disetujui' | 'ditolak' | 'revisi' | 'selesai') => {
        approvalForm.setData('action', action);
        approvalForm.post(`/persetujuan/${sppd.id}`);
    };

    // Quick Finance Disbursement Form
    const financeForm = useForm({
        uang_harian_hari: sppd.biaya?.uang_harian_hari || sppd.lama_hari,
        uang_harian_per_hari: sppd.biaya?.uang_harian_per_hari || 0,
        biaya_transportasi: sppd.biaya?.biaya_transportasi || 0,
        biaya_penginapan_malam: sppd.biaya?.biaya_penginapan_malam || 0,
        biaya_penginapan_per_malam: sppd.biaya?.biaya_penginapan_per_malam || 0,
        biaya_lainnya: sppd.biaya?.biaya_lainnya || 0,
        keterangan_biaya_lainnya: sppd.biaya?.keterangan_biaya_lainnya || '',
        status_pembayaran: 'lunas',
        tanggal_bayar: new Date().toISOString().split('T')[0],
        metode_pembayaran: 'Transfer Bank',
        nomor_bukti_kas: `BKU-SP2D/${new Date().getFullYear()}/${String(sppd.id).padStart(4, '0')}`,
        catatan_bendahara: 'Telah diverifikasi dan ditransfer sesuai bukti pengeluaran riil.',
    });

    const handleFinanceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sppd.biaya) return;
        financeForm.put(`/keuangan/${sppd.biaya.id}`);
    };

    // Document Upload Form
    const uploadForm = useForm({
        jenis_dokumen: 'tiket',
        nama_dokumen: '',
        catatan: '',
        file: null as File | null,
    });

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(`/dokumen/${sppd.id}/upload`, {
            onSuccess: () => uploadForm.reset(),
        });
    };

    // Laporan Form
    const laporanForm = useForm({
        ringkasan_kegiatan: sppd.laporan?.ringkasan_kegiatan || '',
        hasil_kegiatan: sppd.laporan?.hasil_kegiatan || '',
        kendala: sppd.laporan?.kendala || '',
        saran_tindak_lanjut: sppd.laporan?.saran_tindak_lanjut || '',
        tanggal_laporan: sppd.laporan?.tanggal_laporan || new Date().toISOString().split('T')[0],
    });

    const handleLaporanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        laporanForm.post(`/dokumen/${sppd.id}/laporan`);
    };

    return (
        <>
            <Head title={`Detail SPPD - ${sppd.nomor_sppd}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
                {/* Back and Title Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild className="size-9">
                            <Link href="/sppd">
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                    {sppd.nomor_sppd}
                                </h1>
                                <Badge
                                    className={
                                        sppd.status === 'disetujui'
                                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                            : sppd.status === 'diajukan'
                                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                            : sppd.status === 'selesai'
                                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                    }
                                >
                                    {sppd.status.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                Surat Tugas: {sppd.nomor_sp}
                            </p>
                        </div>
                    </div>

                    {/* Quick Print Menu */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/dokumen/print/surat-tugas/${sppd.id}`} target="_blank" rel="noreferrer">
                                <Printer className="mr-1.5 size-3.5" />
                                Cetak Surat Tugas
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/dokumen/print/sppd/${sppd.id}`} target="_blank" rel="noreferrer">
                                <Printer className="mr-1.5 size-3.5" />
                                Cetak SPPD
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/dokumen/print/rincian-biaya/${sppd.id}`} target="_blank" rel="noreferrer">
                                <Coins className="mr-1.5 size-3.5" />
                                Cetak Kuitansi
                            </a>
                        </Button>
                        {sppd.laporan && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={`/dokumen/print/laporan/${sppd.id}`} target="_blank" rel="noreferrer">
                                    <FileCheck className="mr-1.5 size-3.5" />
                                    Cetak Laporan
                                </a>
                            </Button>
                        )}
                        {(sppd.status === 'diajukan' || sppd.status === 'ditolak') && (
                            <Button variant="default" size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Link href={`/sppd/${sppd.id}/edit`}>
                                    <Edit2 className="mr-1.5 size-3.5" />
                                    Edit SPPD
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Visual Workflow Stepper */}
                <Card className="bg-muted/20">
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                            <div className="flex flex-col items-center">
                                <div className="size-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-1">
                                    ✓
                                </div>
                                <span className="text-xs font-semibold">1. Pengajuan</span>
                                <span className="text-[10px] text-muted-foreground">Tercatat di sistem</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div
                                    className={`size-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                                        sppd.status === 'disetujui' || sppd.status === 'selesai'
                                            ? 'bg-emerald-600 text-white'
                                            : sppd.status === 'ditolak'
                                            ? 'bg-rose-500 text-white'
                                            : 'bg-amber-500/20 text-amber-600 animate-pulse ring-2 ring-amber-500'
                                    }`}
                                >
                                    {sppd.status === 'disetujui' || sppd.status === 'selesai' ? '✓' : sppd.status === 'ditolak' ? '✕' : '2'}
                                </div>
                                <span className="text-xs font-semibold">2. Persetujuan Atasan</span>
                                <span className="text-[10px] text-muted-foreground capitalize">{sppd.status}</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div
                                    className={`size-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                                        sppd.biaya?.status_pembayaran === 'lunas'
                                            ? 'bg-emerald-600 text-white'
                                            : sppd.status === 'disetujui'
                                            ? 'bg-amber-500/20 text-amber-600 ring-2 ring-amber-500'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {sppd.biaya?.status_pembayaran === 'lunas' ? '✓' : '3'}
                                </div>
                                <span className="text-xs font-semibold">3. Keuangan & Pencairan</span>
                                <span className="text-[10px] text-muted-foreground capitalize">
                                    {sppd.biaya?.status_pembayaran.replace('_', ' ') || 'Belum'}
                                </span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div
                                    className={`size-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                                        (sppd.dokumens?.length || 0) > 0
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {(sppd.dokumens?.length || 0) > 0 ? '✓' : '4'}
                                </div>
                                <span className="text-xs font-semibold">4. Bukti Perjalanan</span>
                                <span className="text-[10px] text-muted-foreground">
                                    {sppd.dokumens?.length || 0} Berkas Unggah
                                </span>
                            </div>

                            <div className="flex flex-col items-center col-span-2 md:col-span-1">
                                <div
                                    className={`size-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                                        sppd.status === 'selesai' || sppd.laporan
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {sppd.status === 'selesai' ? '✓' : '5'}
                                </div>
                                <span className="text-xs font-semibold">5. Laporan & Selesai</span>
                                <span className="text-[10px] text-muted-foreground">
                                    {sppd.laporan ? 'Telah Diserahkan' : 'Menunggu Pelaksanaan'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Revision / Rejection Note Alert if exists */}
                {sppd.catatan_revisi && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-800 dark:text-rose-300">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="size-5 shrink-0 mt-0.5 text-rose-600" />
                            <div>
                                <h4 className="font-semibold">Catatan Evaluasi / Permintaan Revisi dari Atasan:</h4>
                                <p className="mt-1 text-xs sm:text-sm">{sppd.catatan_revisi}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Approval Action Card for Atasan/Admin */}
                {isAtasanOrAdmin && sppd.status === 'diajukan' && (
                    <Card className="border-amber-500/40 bg-amber-500/5 shadow-xs">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                <UserCheck className="size-5" />
                                <CardTitle className="text-base font-semibold">Tindakan Persetujuan Kepala Sekolah</CardTitle>
                            </div>
                            <CardDescription>
                                Sebagai Kepala SMK Budi Mulia / Pimpinan, periksa permohonan penugasan dinas guru ini dan tentukan keputusan persetujuan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="catatan_approval">Catatan / Arahan Kepala Sekolah (Opsional):</Label>
                                <textarea
                                    id="catatan_approval"
                                    rows={2}
                                    value={approvalForm.data.catatan}
                                    onChange={(e) => approvalForm.setData('catatan', e.target.value)}
                                    placeholder="Contoh: Disetujui. Koordinasikan tugas mengajar dengan tim kurikulum dan laporkan hasil pelatihan."
                                    className="mt-1 w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <Button
                                    type="button"
                                    disabled={approvalForm.processing}
                                    onClick={() => handleApproval('disetujui')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                >
                                    <CheckCircle2 className="mr-1.5 size-4" />
                                    Setujui Pengajuan
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={approvalForm.processing}
                                    onClick={() => handleApproval('revisi')}
                                    className="border-amber-500/50 text-amber-700 hover:bg-amber-500/10"
                                >
                                    <Clock className="mr-1.5 size-4" />
                                    Minta Revisi
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={approvalForm.processing}
                                    onClick={() => handleApproval('ditolak')}
                                    className="border-rose-500/50 text-rose-700 hover:bg-rose-500/10"
                                >
                                    <XCircle className="mr-1.5 size-4" />
                                    Tolak Pengajuan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Finance Card for Bendahara */}
                {isBendaharaOrAdmin && sppd.status === 'disetujui' && sppd.biaya?.status_pembayaran !== 'lunas' && (
                    <Card className="border-emerald-500/40 bg-emerald-500/5 shadow-xs">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <Coins className="size-5" />
                                <CardTitle className="text-base font-semibold">Verifikasi Biaya & Pencairan Dana (Bendahara)</CardTitle>
                            </div>
                            <CardDescription>
                                Verifikasi rincian pengeluaran riil dan lakukan pencairan dana perjalanan dinas ke rekening guru.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleFinanceSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <Label className="text-xs">Uang Harian (Rp/hari)</Label>
                                        <Input
                                            type="number"
                                            value={financeForm.data.uang_harian_per_hari}
                                            onChange={(e) => financeForm.setData('uang_harian_per_hari', Number(e.target.value))}
                                            className="mt-1 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Transportasi (Rp)</Label>
                                        <Input
                                            type="number"
                                            value={financeForm.data.biaya_transportasi}
                                            onChange={(e) => financeForm.setData('biaya_transportasi', Number(e.target.value))}
                                            className="mt-1 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Penginapan/Hotel (Rp/malam)</Label>
                                        <Input
                                            type="number"
                                            value={financeForm.data.biaya_penginapan_per_malam}
                                            onChange={(e) => financeForm.setData('biaya_penginapan_per_malam', Number(e.target.value))}
                                            className="mt-1 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Biaya Lainnya (Rp)</Label>
                                        <Input
                                            type="number"
                                            value={financeForm.data.biaya_lainnya}
                                            onChange={(e) => financeForm.setData('biaya_lainnya', Number(e.target.value))}
                                            className="mt-1 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <Label className="text-xs">Nomor Bukti Kas (BKK/BKU)</Label>
                                        <Input
                                            type="text"
                                            value={financeForm.data.nomor_bukti_kas}
                                            onChange={(e) => financeForm.setData('nomor_bukti_kas', e.target.value)}
                                            className="mt-1 text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Metode Pembayaran</Label>
                                        <Input
                                            type="text"
                                            value={financeForm.data.metode_pembayaran}
                                            onChange={(e) => financeForm.setData('metode_pembayaran', e.target.value)}
                                            className="mt-1 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Tanggal Pembayaran</Label>
                                        <Input
                                            type="date"
                                            value={financeForm.data.tanggal_bayar}
                                            onChange={(e) => financeForm.setData('tanggal_bayar', e.target.value)}
                                            className="mt-1 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="text-xs text-muted-foreground">
                                        Rekening Penerima: <strong>{sppd.pegawai?.nama_bank} - {sppd.pegawai?.nomor_rekening}</strong> ({sppd.pegawai?.nama})
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={financeForm.processing}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                    >
                                        <CheckCircle2 className="mr-1.5 size-4" />
                                        Konfirmasi Pembayaran Lunas ({formatRupiah(sppd.biaya?.total_biaya || 0)})
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs Navigation */}
                <div className="flex flex-wrap items-center gap-2 border-b border-border">
                    <button
                        type="button"
                        onClick={() => setActiveTab('rincian')}
                        className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 ${
                            activeTab === 'rincian'
                                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Rincian Penugasan
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('biaya')}
                        className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 ${
                            activeTab === 'biaya'
                                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Rincian Keuangan
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('dokumen')}
                        className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'dokumen'
                                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <span>Bukti Perjalanan</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.2 text-xs">
                            {sppd.dokumens?.length || 0}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('laporan')}
                        className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'laporan'
                                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <span>Laporan Perjalanan</span>
                        {sppd.laporan && <span className="size-2 rounded-full bg-emerald-500"></span>}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('riwayat')}
                        className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'riwayat'
                                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <span>Riwayat Persetujuan</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.2 text-xs">
                            {sppd.approvals?.length || 0}
                        </span>
                    </button>
                </div>

                {/* Tab 1: Rincian Penugasan */}
                {activeTab === 'rincian' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Primary Assignee Info (Guru) */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Guru yang Ditugaskan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Nama Guru</span>
                                    <span className="font-semibold text-foreground">{sppd.pegawai?.nama}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">NIP / NIK</span>
                                    <span className="font-mono text-foreground">{sppd.pegawai?.nip || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">NUPTK</span>
                                    <span className="font-mono font-medium text-foreground">{sppd.pegawai?.nuptk || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Mata Pelajaran</span>
                                    <span className="font-medium text-foreground">{sppd.pegawai?.mata_pelajaran || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Status Guru</span>
                                    <Badge variant="outline">{sppd.pegawai?.status_guru || 'GTY'}</Badge>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Jabatan & Unit</span>
                                    <span className="text-foreground">{sppd.pegawai?.jabatan} - {sppd.pegawai?.unit_kerja}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">No. Telepon / WhatsApp</span>
                                    <span className="text-foreground">{sppd.pegawai?.telepon || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Rekening Pencairan</span>
                                    <span className="font-medium text-foreground">
                                        {sppd.pegawai?.nama_bank} - {sppd.pegawai?.nomor_rekening}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Travel Parameters */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Parameter Perjalanan Dinas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Tempat Berangkat</span>
                                    <span className="font-medium text-foreground">{sppd.tempat_berangkat}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Tempat Tujuan</span>
                                    <span className="font-semibold text-foreground">{sppd.tempat_tujuan}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Jadwal Penugasan</span>
                                    <span className="font-medium text-foreground">
                                        {new Date(sppd.tanggal_berangkat).toLocaleDateString('id-ID')} s.d.{' '}
                                        {new Date(sppd.tanggal_kembali).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Lama Hari</span>
                                    <span className="font-semibold text-emerald-600">{sppd.lama_hari} Hari Kalender</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Moda Transportasi</span>
                                    <span className="font-medium text-foreground">{sppd.alat_angkut}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Instansi Pembebanan</span>
                                    <span className="font-medium text-foreground">{sppd.instansi_pembebanan}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Mata Anggaran / Sumber Dana</span>
                                    <span className="font-mono text-foreground">{sppd.mata_anggaran}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Maksud Tugas & Pengikut */}
                        <Card className="md:col-span-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Keperluan Perjalanan & Keterangan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Keperluan / Maksud Tugas:</span>
                                    <p className="mt-1 leading-relaxed text-foreground bg-muted/30 p-3.5 rounded-xl border">
                                        {sppd.maksud_tujuan}
                                    </p>
                                </div>

                                {sppd.keterangan && (
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase">Keterangan Tambahan:</span>
                                        <p className="mt-1 leading-relaxed text-foreground bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl">
                                            {sppd.keterangan}
                                        </p>
                                    </div>
                                )}

                                {sppd.pengikuts && sppd.pengikuts.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                            Rekan Guru Pendamping / Pengikut:
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {sppd.pengikuts.map((pengikut) => (
                                                <div
                                                    key={pengikut.id}
                                                    className="p-3 rounded-lg border border-border bg-card flex items-center justify-between"
                                                >
                                                    <div>
                                                        <div className="font-semibold text-foreground">{pengikut.pegawai?.nama}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {pengikut.pegawai?.mata_pelajaran ? `${pengikut.pegawai?.mata_pelajaran} • ` : ''}
                                                            {pengikut.pegawai?.jabatan}
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {pengikut.keterangan || 'Pendamping'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tab 2: Rincian Keuangan */}
                {activeTab === 'biaya' && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">Rincian Biaya Riil Perjalanan Dinas</CardTitle>
                                    <CardDescription>Rincian alokasi biaya dan status pembayaran kas daerah</CardDescription>
                                </div>
                                <Badge
                                    className={
                                        sppd.biaya?.status_pembayaran === 'lunas'
                                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                    }
                                >
                                    STATUS: {(sppd.biaya?.status_pembayaran || 'belum_dibayar').toUpperCase()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b text-xs font-medium text-muted-foreground uppercase">
                                        <tr>
                                            <th className="pb-3">Komponen Biaya</th>
                                            <th className="pb-3">Kuantitas</th>
                                            <th className="pb-3">Tarif Satuan (Rp)</th>
                                            <th className="pb-3 text-right">Jumlah (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        <tr>
                                            <td className="py-3 font-medium">Uang Harian / Lumpsum</td>
                                            <td className="py-3">{sppd.biaya?.uang_harian_hari} Hari</td>
                                            <td className="py-3">{formatRupiah(sppd.biaya?.uang_harian_per_hari || 0)}</td>
                                            <td className="py-3 text-right font-semibold">
                                                {formatRupiah(sppd.biaya?.uang_harian_total || 0)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 font-medium">Biaya Transportasi ({sppd.alat_angkut})</td>
                                            <td className="py-3">1 Paket PP</td>
                                            <td className="py-3">{formatRupiah(sppd.biaya?.biaya_transportasi || 0)}</td>
                                            <td className="py-3 text-right font-semibold">
                                                {formatRupiah(sppd.biaya?.biaya_transportasi || 0)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 font-medium">Biaya Penginapan / Hotel</td>
                                            <td className="py-3">{sppd.biaya?.biaya_penginapan_malam} Malam</td>
                                            <td className="py-3">{formatRupiah(sppd.biaya?.biaya_penginapan_per_malam || 0)}</td>
                                            <td className="py-3 text-right font-semibold">
                                                {formatRupiah(sppd.biaya?.biaya_penginapan_total || 0)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 font-medium">
                                                Biaya Lainnya ({sppd.biaya?.keterangan_biaya_lainnya || 'Representasi/Taksi'})
                                            </td>
                                            <td className="py-3">1 Kegiatan</td>
                                            <td className="py-3">{formatRupiah(sppd.biaya?.biaya_lainnya || 0)}</td>
                                            <td className="py-3 text-right font-semibold">
                                                {formatRupiah(sppd.biaya?.biaya_lainnya || 0)}
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-foreground/20 text-base font-bold">
                                            <td colSpan={3} className="py-4 text-foreground">
                                                Total Biaya Perjalanan Dinas
                                            </td>
                                            <td className="py-4 text-right text-emerald-600 dark:text-emerald-400">
                                                {formatRupiah(sppd.biaya?.total_biaya || 0)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Payment Settlement Metadata */}
                            <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                    Informasi Pencairan Kas Daerah:
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Nomor Bukti Kas / SP2D:</span>
                                        <span className="font-mono font-medium text-foreground">
                                            {sppd.biaya?.nomor_bukti_kas || '- Belum Dicairkan -'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Tanggal Pencairan:</span>
                                        <span className="font-medium text-foreground">
                                            {sppd.biaya?.tanggal_bayar ? new Date(sppd.biaya.tanggal_bayar).toLocaleDateString('id-ID') : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Metode Pembayaran:</span>
                                        <span className="font-medium text-foreground">{sppd.biaya?.metode_pembayaran || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tab 3: Bukti Perjalanan (Uploads) */}
                {activeTab === 'dokumen' && (
                    <div className="space-y-6">
                        {/* Upload Form */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Unggah Bukti Perjalanan Dinas</CardTitle>
                                <CardDescription>
                                    Lampirkan tiket transportasi, boarding pass, nota hotel, atau dokumentasi kegiatan dinas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUploadSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <Label htmlFor="jenis_dok">Kategori Bukti *</Label>
                                            <select
                                                id="jenis_dok"
                                                value={uploadForm.data.jenis_dokumen}
                                                onChange={(e) => uploadForm.setData('jenis_dokumen', e.target.value)}
                                                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                            >
                                                <option value="tiket">Tiket Transportasi PP</option>
                                                <option value="boarding_pass">Boarding Pass</option>
                                                <option value="nota_hotel">Invoice / Nota Hotel</option>
                                                <option value="foto_kegiatan">Foto Dokumentasi Kegiatan</option>
                                                <option value="laporan_kegiatan">Berkas Laporan Kegiatan</option>
                                                <option value="lainnya">Bukti Lainnya (Tol/BBM)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label htmlFor="nama_dok">Nama Dokumen / Keterangan Singkat *</Label>
                                            <Input
                                                id="nama_dok"
                                                required
                                                value={uploadForm.data.nama_dokumen}
                                                onChange={(e) => uploadForm.setData('nama_dokumen', e.target.value)}
                                                placeholder="Contoh: Tiket KA Lodaya PP"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="file_upload">Pilih Berkas (PDF / JPG / PNG) *</Label>
                                            <Input
                                                id="file_upload"
                                                type="file"
                                                onChange={(e) => uploadForm.setData('file', e.target.files ? e.target.files[0] : null)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <Button
                                            type="submit"
                                            disabled={uploadForm.processing}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            <UploadCloud className="mr-1.5 size-4" />
                                            {uploadForm.processing ? 'Mengunggah...' : 'Unggah Bukti'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* List Uploaded Files */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Daftar Bukti Perjalanan Terlampir</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {sppd.dokumens && sppd.dokumens.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {sppd.dokumens.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="p-3.5 rounded-xl border border-border bg-card flex items-start justify-between gap-3"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="size-4 text-emerald-600 shrink-0" />
                                                        <span className="font-semibold text-sm text-foreground">{doc.nama_dokumen}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] uppercase">
                                                            {doc.jenis_dokumen.replace('_', ' ')}
                                                        </Badge>
                                                        <span>•</span>
                                                        <span>{new Date(doc.created_at).toLocaleDateString('id-ID')}</span>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (confirm('Hapus dokumen bukti perjalanan ini?')) {
                                                            useForm().delete(`/dokumen/${doc.id}`);
                                                        }
                                                    }}
                                                    className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center py-8 text-xs text-muted-foreground">
                                        Belum ada berkas bukti perjalanan yang diunggah.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tab 4: Laporan Perjalanan Dinas */}
                {activeTab === 'laporan' && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">Laporan Hasil Pelaksanaan Tugas</CardTitle>
                                    <CardDescription>
                                        Disusun oleh pegawai pelaksana perjalanan dinas setelah selesai melaksanakan penugasan
                                    </CardDescription>
                                </div>
                                {sppd.laporan && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={`/dokumen/print/laporan/${sppd.id}`} target="_blank" rel="noreferrer">
                                            <Printer className="mr-1.5 size-3.5" />
                                            Cetak Laporan
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLaporanSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="tgl_lap">Tanggal Penyerahan Laporan *</Label>
                                    <Input
                                        id="tgl_lap"
                                        type="date"
                                        required
                                        value={laporanForm.data.tanggal_laporan}
                                        onChange={(e) => laporanForm.setData('tanggal_laporan', e.target.value)}
                                        className="sm:w-64"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="ringkasan">Ringkasan Kegiatan *</Label>
                                    <textarea
                                        id="ringkasan"
                                        required
                                        rows={3}
                                        value={laporanForm.data.ringkasan_kegiatan}
                                        onChange={(e) => laporanForm.setData('ringkasan_kegiatan', e.target.value)}
                                        placeholder="Uraikan gambaran umum kegiatan perjalanan dinas yang telah dilaksanakan..."
                                        className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="hasil">Hasil yang Dicapai (Poin-poin Penting) *</Label>
                                    <textarea
                                        id="hasil"
                                        required
                                        rows={5}
                                        value={laporanForm.data.hasil_kegiatan}
                                        onChange={(e) => laporanForm.setData('hasil_kegiatan', e.target.value)}
                                        placeholder="1. Telah disepakati kerja sama...&#10;2. Materi bimbingan teknis mencakup...&#10;3. Rekomendasi teknis yang dihasilkan..."
                                        className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono text-xs sm:text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="kendala">Kendala / Hambatan Lapangan (Opsional)</Label>
                                        <textarea
                                            id="kendala"
                                            rows={3}
                                            value={laporanForm.data.kendala}
                                            onChange={(e) => laporanForm.setData('kendala', e.target.value)}
                                            placeholder="Kendala teknis atau koordinasi jika ada..."
                                            className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="saran">Saran / Rencana Tindak Lanjut</Label>
                                        <textarea
                                            id="saran"
                                            rows={3}
                                            value={laporanForm.data.saran_tindak_lanjut}
                                            onChange={(e) => laporanForm.setData('saran_tindak_lanjut', e.target.value)}
                                            placeholder="Rekomendasi tindak lanjut bagi unit kerja..."
                                            className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end pt-2">
                                    <Button
                                        type="submit"
                                        disabled={laporanForm.processing}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                    >
                                        <Send className="mr-1.5 size-4" />
                                        {laporanForm.processing ? 'Menyimpan...' : 'Simpan Laporan Perjalanan'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Tab 5: Riwayat Persetujuan */}
                {activeTab === 'riwayat' && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Riwayat & Audit Trail Persetujuan</CardTitle>
                            <CardDescription>Catatan kronologis setiap evaluasi status pengajuan dinas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative border-l border-border/80 pl-6 space-y-6 ml-3">
                                {sppd.approvals && sppd.approvals.length > 0 ? (
                                    sppd.approvals.map((item, idx) => (
                                        <div key={item.id} className="relative">
                                            {/* Dot */}
                                            <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-emerald-600 ring-4 ring-background" />

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-foreground">
                                                        {item.user?.name || 'Sistem'}
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                                        {item.role}
                                                    </Badge>
                                                    <Badge
                                                        className={
                                                            item.action === 'disetujui'
                                                                ? 'bg-emerald-500/15 text-emerald-700 text-[10px]'
                                                                : item.action === 'ditolak'
                                                                ? 'bg-rose-500/15 text-rose-700 text-[10px]'
                                                                : 'bg-muted text-[10px]'
                                                        }
                                                    >
                                                        {item.action.toUpperCase()}
                                                    </Badge>
                                                </div>

                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(item.created_at).toLocaleString('id-ID', {
                                                        dateStyle: 'full',
                                                        timeStyle: 'short',
                                                    })}
                                                </p>

                                                {item.catatan && (
                                                    <p className="text-xs text-foreground/90 bg-muted/40 p-2.5 rounded-lg border mt-1.5">
                                                        "{item.catatan}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-foreground">Belum ada riwayat persetujuan.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
