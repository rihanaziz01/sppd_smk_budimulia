import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    MapPin,
    Search,
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
import { Label } from '@/components/ui/label';

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
    status: 'draft' | 'diajukan' | 'disetujui' | 'ditolak' | 'selesai';
    catatan_revisi?: string;
    catatan_atasan?: string;
    pegawai?: {
        nama: string;
        nip: string;
        nuptk?: string | null;
        mata_pelajaran?: string | null;
        jabatan: string;
        golongan: string;
    };
    biaya?: {
        total_biaya: number;
    };
}

interface PersetujuanProps {
    sppds: {
        data: SppdRow[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    counts: {
        diajukan: number;
        disetujui: number;
        ditolak: number;
        selesai: number;
    };
    current_status: string;
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function PersetujuanIndex({
    sppds,
    counts,
    current_status,
}: PersetujuanProps) {
    const [selectedSppd, setSelectedSppd] = useState<SppdRow | null>(null);
    const [actionType, setActionType] = useState<'disetujui' | 'ditolak' | 'revisi'>('disetujui');
    const [catatan, setCatatan] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleTabChange = (status: string) => {
        router.get('/persetujuan', { status }, { preserveState: true });
    };

    const openActionDialog = (sppd: SppdRow, action: 'disetujui' | 'ditolak' | 'revisi') => {
        setSelectedSppd(sppd);
        setActionType(action);
        setCatatan(
            action === 'disetujui'
                ? 'Disetujui. Laksanakan tugas dan koordinasikan dengan pihak sekolah/penyelenggara.'
                : action === 'revisi'
                ? 'Mohon perbaiki tanggal penugasan atau rincian biaya.'
                : 'Ditolak karena berbenturan dengan agenda penting sekolah.'
        );
    };

    const submitAction = () => {
        if (!selectedSppd) return;
        setProcessing(true);
        router.post(
            `/persetujuan/${selectedSppd.id}`,
            {
                action: actionType,
                catatan,
            },
            {
                onSuccess: () => {
                    setSelectedSppd(null);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <>
            <Head title="Persetujuan SPPD Guru - Kepala Sekolah" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Persetujuan SPPD Guru (Kepala Sekolah)
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Verifikasi permohonan perjalanan dinas guru SMK Budi Mulia, berikan keputusan persetujuan, permintaan revisi, atau penolakan dengan alasan.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
                    <button
                        type="button"
                        onClick={() => handleTabChange('diajukan')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            current_status === 'diajukan'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                        <Clock className="size-3.5" />
                        <span>Menunggu Persetujuan</span>
                        <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                            {counts.diajukan}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('disetujui')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            current_status === 'disetujui'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                        <CheckCircle2 className="size-3.5" />
                        <span>Telah Disetujui</span>
                        <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                            {counts.disetujui}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('ditolak')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            current_status === 'ditolak'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                        <XCircle className="size-3.5" />
                        <span>Ditolak / Revisi</span>
                        <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                            {counts.ditolak}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('semua')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            current_status === 'semua'
                                ? 'bg-foreground text-background shadow-xs'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                        <span>Semua Riwayat</span>
                    </button>
                </div>

                {/* Table Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                            {current_status === 'diajukan'
                                ? 'Antrian Menunggu Persetujuan Anda'
                                : 'Riwayat Evaluasi Permohonan'}
                        </CardTitle>
                        <CardDescription>
                            Total {sppds.total} berkas SPPD dalam daftar ini
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b text-xs font-medium text-muted-foreground uppercase">
                                    <tr>
                                        <th className="pb-3 pl-1">No. SPPD & Guru</th>
                                        <th className="pb-3">Tujuan & Maksud Tugas</th>
                                        <th className="pb-3">Jadwal Penugasan</th>
                                        <th className="pb-3">Estimasi Biaya</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right pr-1">Aksi Keputusan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {sppds.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                                Tidak ada pengajuan SPPD guru pada status ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        sppds.data.map((sppd) => (
                                            <tr key={sppd.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-3.5 pl-1">
                                                    <div className="font-semibold text-foreground">{sppd.nomor_sppd}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {sppd.pegawai?.nama} {sppd.pegawai?.mata_pelajaran ? `• ${sppd.pegawai?.mata_pelajaran}` : ''}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 max-w-xs">
                                                    <div className="font-medium text-foreground flex items-center gap-1">
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
                                                        <span>{new Date(sppd.tanggal_berangkat).toLocaleDateString('id-ID')}</span>
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {sppd.lama_hari} Hari • {sppd.alat_angkut}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 text-xs font-semibold">
                                                    {sppd.biaya ? formatRupiah(sppd.biaya.total_biaya) : '-'}
                                                </td>

                                                <td className="py-3.5">
                                                    <Badge
                                                        className={
                                                            sppd.status === 'disetujui'
                                                                ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                                                                : sppd.status === 'diajukan'
                                                                ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                                                                : 'bg-rose-500/15 text-rose-700 border-rose-500/30'
                                                        }
                                                    >
                                                        {sppd.status.toUpperCase()}
                                                    </Badge>
                                                </td>

                                                <td className="py-3.5 text-right pr-1">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                                                            <Link href={`/sppd/${sppd.id}`}>
                                                                <Eye className="size-3.5 mr-1" />
                                                                Lihat
                                                            </Link>
                                                        </Button>

                                                        {sppd.status === 'diajukan' && (
                                                            <>
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    onClick={() => openActionDialog(sppd, 'disetujui')}
                                                                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5"
                                                                >
                                                                    Setujui
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openActionDialog(sppd, 'revisi')}
                                                                    className="h-8 border-amber-500 text-amber-700 hover:bg-amber-500/10 text-xs px-2"
                                                                >
                                                                    Revisi
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openActionDialog(sppd, 'ditolak')}
                                                                    className="h-8 border-rose-500 text-rose-700 hover:bg-rose-500/10 text-xs px-2"
                                                                >
                                                                    Tolak
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
                    </CardContent>
                </Card>

                {/* Decision Modal */}
                <Dialog open={!!selectedSppd} onOpenChange={(open) => !open && setSelectedSppd(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {actionType === 'disetujui' && <CheckCircle2 className="size-5 text-emerald-600" />}
                                {actionType === 'revisi' && <Clock className="size-5 text-amber-600" />}
                                {actionType === 'ditolak' && <XCircle className="size-5 text-rose-600" />}
                                <span>
                                    {actionType === 'disetujui' && 'Setujui Pengajuan SPPD'}
                                    {actionType === 'revisi' && 'Minta Catatan Revisi'}
                                    {actionType === 'ditolak' && 'Tolak Pengajuan SPPD'}
                                </span>
                            </DialogTitle>
                            <DialogDescription>
                                SPPD No: {selectedSppd?.nomor_sppd} ({selectedSppd?.pegawai?.nama})
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2">
                            <div>
                                <Label htmlFor="dialog_catatan">Catatan / Alasan Keputusan:</Label>
                                <textarea
                                    id="dialog_catatan"
                                    rows={3}
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setSelectedSppd(null)}>
                                Batal
                            </Button>
                            <Button
                                onClick={submitAction}
                                disabled={processing}
                                className={
                                    actionType === 'disetujui'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : actionType === 'revisi'
                                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                                }
                            >
                                {processing ? 'Memproses...' : 'Kirim Keputusan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
