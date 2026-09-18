import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Edit,
    Landmark,
    PlusCircle,
    Trash2,
    TrendingUp,
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

interface AnggaranItem {
    id: number;
    tahun_anggaran: number;
    nama_anggaran: string;
    kode_rekening?: string;
    total_anggaran: number;
    periode: string;
    keterangan?: string;
    status: 'aktif' | 'nonaktif';
    terpakai: number;
    sisa_anggaran: number;
    persentase_serapan: number;
    transaksi_count: number;
}

interface AnggaranProps {
    anggarans: AnggaranItem[];
    summary: {
        total_pagu: number;
        total_terpakai: number;
        total_sisa: number;
        serapan_persen: number;
        tahun: number;
    };
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function BendaharaAnggaranIndex({
    anggarans,
    summary,
}: AnggaranProps) {
    const [selectedAnggaran, setSelectedAnggaran] = useState<AnggaranItem | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const form = useForm({
        tahun_anggaran: summary.tahun,
        nama_anggaran: '',
        kode_rekening: '',
        total_anggaran: 0,
        periode: `Tahun Anggaran ${summary.tahun}`,
        keterangan: '',
        status: 'aktif',
    });

    const openAddModal = () => {
        form.reset();
        form.setData({
            tahun_anggaran: summary.tahun,
            nama_anggaran: '',
            kode_rekening: '',
            total_anggaran: 0,
            periode: `Tahun Anggaran ${summary.tahun}`,
            keterangan: '',
            status: 'aktif',
        });
        setIsAddModalOpen(true);
    };

    const openEditModal = (item: AnggaranItem) => {
        setSelectedAnggaran(item);
        form.setData({
            tahun_anggaran: item.tahun_anggaran,
            nama_anggaran: item.nama_anggaran,
            kode_rekening: item.kode_rekening || '',
            total_anggaran: item.total_anggaran,
            periode: item.periode,
            keterangan: item.keterangan || '',
            status: item.status,
        });
        setIsEditModalOpen(true);
    };

    const handleSubmitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/bendahara/anggaran', {
            onSuccess: () => setIsAddModalOpen(false),
        });
    };

    const handleSubmitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAnggaran) return;

        form.put(`/bendahara/anggaran/${selectedAnggaran.id}`, {
            onSuccess: () => setIsEditModalOpen(false),
        });
    };

    const handleDelete = (item: AnggaranItem) => {
        if (confirm(`Hapus pos anggaran "${item.nama_anggaran}"?`)) {
            router.delete(`/bendahara/anggaran/${item.id}`);
        }
    };

    return (
        <>
            <Head title="Pengelolaan Anggaran Perjalanan Dinas - Bendahara" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header Card */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2.5">
                            <Landmark className="size-7 text-orange-600" />
                            Pengelolaan Anggaran Perjalanan Dinas
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Alokasi pagu anggaran, pemantauan serapan dana penugasan guru, dan transparansi sisa anggaran sekolah.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            onClick={openAddModal}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-xs"
                        >
                            <PlusCircle className="mr-1.5 size-4" />
                            Tambah Anggaran Baru
                        </Button>
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Pagu */}
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
                            <div className="text-xl font-bold text-foreground">
                                {formatRupiah(summary.total_pagu)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Tahun Anggaran {summary.tahun}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card 2: Total Realisasi / Terpakai */}
                    <Card className="hover:border-foreground/30 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Anggaran Terpakai
                            </CardTitle>
                            <div className="rounded-lg bg-muted p-2 text-foreground">
                                <CheckCircle2 className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-foreground">
                                {formatRupiah(summary.total_terpakai)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Realisasi pencairan biaya
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card 3: Sisa Anggaran */}
                    <Card className="hover:border-emerald-500/40 border-emerald-500/20 bg-emerald-500/5 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                Sisa Anggaran Tersedia
                            </CardTitle>
                            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                                <Landmark className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                                {formatRupiah(summary.total_sisa)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Saldo siap dialokasikan
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card 4: Persentase Serapan */}
                    <Card className="hover:border-foreground/30 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Serapan Anggaran
                            </CardTitle>
                            <div className="rounded-lg bg-muted p-2 text-foreground">
                                <TrendingUp className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-foreground">
                                {summary.serapan_persen}%
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-orange-600 rounded-full transition-all"
                                    style={{ width: `${Math.min(summary.serapan_persen, 100)}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table Anggaran */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Daftar Pos Alokasi Anggaran Sekolah</CardTitle>
                        <CardDescription>
                            Daftar mata anggaran dan sumber pembebanan biaya perjalanan dinas guru SMK Budi Mulia
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-xs uppercase text-muted-foreground">
                                        <th className="pb-3 pl-1">Nama Pos Anggaran & Rekening</th>
                                        <th className="pb-3">Periode</th>
                                        <th className="pb-3">Total Pagu (Rp)</th>
                                        <th className="pb-3">Terpakai (Rp)</th>
                                        <th className="pb-3">Sisa Anggaran (Rp)</th>
                                        <th className="pb-3">Serapan Dana</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right pr-1">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {anggarans.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                                Belum ada data alokasi anggaran perjalanan dinas.
                                            </td>
                                        </tr>
                                    ) : (
                                        anggarans.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-3.5 pl-1">
                                                    <div className="font-semibold text-foreground">{item.nama_anggaran}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Kode: {item.kode_rekening || '-'} • {item.transaksi_count} SPPD
                                                    </div>
                                                </td>
                                                <td className="py-3.5 text-xs text-foreground">
                                                    {item.periode}
                                                </td>
                                                <td className="py-3.5 text-xs font-bold text-foreground">
                                                    {formatRupiah(item.total_anggaran)}
                                                </td>
                                                <td className="py-3.5 text-xs font-semibold text-muted-foreground">
                                                    {formatRupiah(item.terpakai)}
                                                </td>
                                                <td className="py-3.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatRupiah(item.sisa_anggaran)}
                                                </td>
                                                <td className="py-3.5 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-foreground w-10">
                                                            {item.persentase_serapan}%
                                                        </span>
                                                        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-orange-600 rounded-full"
                                                                style={{ width: `${Math.min(item.persentase_serapan, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5">
                                                    {item.status === 'aktif' ? (
                                                        <Badge className="bg-emerald-600 text-white border-emerald-600">
                                                            Aktif
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-muted-foreground">
                                                            Nonaktif
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-3.5 text-right pr-1">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openEditModal(item)}
                                                        >
                                                            <Edit className="size-3.5 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(item)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                        >
                                                            <Trash2 className="size-3.5" />
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

                {/* Modal Tambah Anggaran */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                <PlusCircle className="size-5 text-orange-600" />
                                Tambah Alokasi Anggaran Baru
                            </DialogTitle>
                            <DialogDescription>
                                Masukkan pos pagu anggaran sekolah untuk keperluan perjalanan dinas guru
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmitAdd} className="space-y-4 py-2">
                            <div>
                                <Label htmlFor="add_nama">Nama Pos Anggaran *</Label>
                                <Input
                                    id="add_nama"
                                    required
                                    value={form.data.nama_anggaran}
                                    onChange={(e) => form.setData('nama_anggaran', e.target.value)}
                                    placeholder="Contoh: Dana BOS Reguler - Penugasan Diklat Guru"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="add_kode">Kode Rekening</Label>
                                    <Input
                                        id="add_kode"
                                        value={form.data.kode_rekening}
                                        onChange={(e) => form.setData('kode_rekening', e.target.value)}
                                        placeholder="5.1.02.04.01.0001"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="add_tahun">Tahun Anggaran *</Label>
                                    <Input
                                        id="add_tahun"
                                        type="number"
                                        required
                                        value={form.data.tahun_anggaran}
                                        onChange={(e) => form.setData('tahun_anggaran', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="add_total">Total Pagu Alokasi (Rp) *</Label>
                                    <Input
                                        id="add_total"
                                        type="number"
                                        required
                                        min="0"
                                        value={form.data.total_anggaran}
                                        onChange={(e) => form.setData('total_anggaran', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="add_periode">Periode Anggaran *</Label>
                                    <Input
                                        id="add_periode"
                                        required
                                        value={form.data.periode}
                                        onChange={(e) => form.setData('periode', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="add_ket">Keterangan / Tujuan Pos Dana</Label>
                                <textarea
                                    id="add_ket"
                                    rows={2}
                                    value={form.data.keterangan}
                                    onChange={(e) => form.setData('keterangan', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background p-2.5 text-sm"
                                />
                            </div>

                            <div>
                                <Label htmlFor="add_status">Status Anggaran</Label>
                                <select
                                    id="add_status"
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-medium"
                                >
                                    <option value="aktif">Aktif (Dapat digunakan transaksi)</option>
                                    <option value="nonaktif">Nonaktif</option>
                                </select>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                                >
                                    {form.processing ? 'Menyimpan...' : 'Simpan Anggaran'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Edit Anggaran */}
                {selectedAnggaran && (
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                    <Edit className="size-5 text-orange-600" />
                                    Edit Pos Anggaran
                                </DialogTitle>
                                <DialogDescription>
                                    Perbarui nominal alokasi atau status pos anggaran
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmitEdit} className="space-y-4 py-2">
                                <div>
                                    <Label htmlFor="edit_nama">Nama Pos Anggaran *</Label>
                                    <Input
                                        id="edit_nama"
                                        required
                                        value={form.data.nama_anggaran}
                                        onChange={(e) => form.setData('nama_anggaran', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="edit_kode">Kode Rekening</Label>
                                        <Input
                                            id="edit_kode"
                                            value={form.data.kode_rekening}
                                            onChange={(e) => form.setData('kode_rekening', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_tahun">Tahun Anggaran *</Label>
                                        <Input
                                            id="edit_tahun"
                                            type="number"
                                            required
                                            value={form.data.tahun_anggaran}
                                            onChange={(e) => form.setData('tahun_anggaran', Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="edit_total">Total Pagu Alokasi (Rp) *</Label>
                                        <Input
                                            id="edit_total"
                                            type="number"
                                            required
                                            min="0"
                                            value={form.data.total_anggaran}
                                            onChange={(e) => form.setData('total_anggaran', Number(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_periode">Periode Anggaran *</Label>
                                        <Input
                                            id="edit_periode"
                                            required
                                            value={form.data.periode}
                                            onChange={(e) => form.setData('periode', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="edit_ket">Keterangan</Label>
                                    <textarea
                                        id="edit_ket"
                                        rows={2}
                                        value={form.data.keterangan}
                                        onChange={(e) => form.setData('keterangan', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background p-2.5 text-sm"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="edit_status">Status</Label>
                                    <select
                                        id="edit_status"
                                        value={form.data.status}
                                        onChange={(e) => form.setData('status', e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-medium"
                                    >
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif</option>
                                    </select>
                                </div>

                                <DialogFooter className="pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                                    >
                                        {form.processing ? 'Menyimpan...' : 'Perbarui Anggaran'}
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
