import { Head, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    Check,
    CreditCard,
    Edit2,
    GraduationCap,
    Phone,
    Plus,
    Search,
    Trash2,
    UserCheck,
    Users,
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

interface PegawaiItem {
    id: number;
    nip: string;
    nik?: string;
    nuptk?: string;
    nama: string;
    jabatan: string;
    mata_pelajaran?: string;
    unit_kerja: string;
    golongan: string;
    status_guru?: string;
    nomor_rekening: string;
    nama_bank: string;
    telepon?: string;
    email?: string;
    status_aktif: boolean;
    is_pejabat_penandatangan: boolean;
    sppds_count?: number;
}

interface PegawaiIndexProps {
    pegawais: {
        data: PegawaiItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
        unit_kerja?: string;
    };
    unit_kerja_list: string[];
}

export default function PegawaiIndex({
    pegawais,
    filters,
    unit_kerja_list,
}: PegawaiIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [unitKerja, setUnitKerja] = useState(filters.unit_kerja || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPegawai, setEditingPegawai] = useState<PegawaiItem | null>(null);

    const createForm = useForm({
        nip: '',
        nik: '',
        nuptk: '',
        nama: '',
        jabatan: '',
        mata_pelajaran: '',
        unit_kerja: 'Program Keahlian TKJ',
        golongan: 'Penata (III/c)',
        status_guru: 'Guru Tetap Yayasan (GTY)',
        nomor_rekening: '',
        nama_bank: 'Bank BJB',
        telepon: '',
        email: '',
        status_aktif: true,
        is_pejabat_penandatangan: false,
        create_user_account: false,
    });

    const editForm = useForm({
        nip: '',
        nik: '',
        nuptk: '',
        nama: '',
        jabatan: '',
        mata_pelajaran: '',
        unit_kerja: '',
        golongan: '',
        status_guru: 'Guru Tetap Yayasan (GTY)',
        nomor_rekening: '',
        nama_bank: '',
        telepon: '',
        email: '',
        status_aktif: true,
        is_pejabat_penandatangan: false,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/pegawai', { search, unit_kerja: unitKerja }, { preserveState: true });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/pegawai', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const openEdit = (p: PegawaiItem) => {
        setEditingPegawai(p);
        editForm.setData({
            nip: p.nip,
            nik: p.nik || '',
            nuptk: p.nuptk || '',
            nama: p.nama,
            jabatan: p.jabatan,
            mata_pelajaran: p.mata_pelajaran || '',
            unit_kerja: p.unit_kerja,
            golongan: p.golongan,
            status_guru: p.status_guru || 'Guru Tetap Yayasan (GTY)',
            nomor_rekening: p.nomor_rekening,
            nama_bank: p.nama_bank,
            telepon: p.telepon || '',
            email: p.email || '',
            status_aktif: p.status_aktif,
            is_pejabat_penandatangan: p.is_pejabat_penandatangan,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPegawai) return;
        editForm.put(`/pegawai/${editingPegawai.id}`, {
            onSuccess: () => {
                setEditingPegawai(null);
            },
        });
    };

    const handleDelete = (p: PegawaiItem) => {
        if (confirm(`Hapus data guru: "${p.nama}"?`)) {
            router.delete(`/pegawai/${p.id}`);
        }
    };

    return (
        <>
            <Head title="Data Guru - SMK Budi Mulia" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Data Guru & Tenaga Kependidikan
                            </h1>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                                SMK Budi Mulia
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola data NIP/NIK, NUPTK, Mata Pelajaran, Jabatan, Nomor Rekening pencairan, dan status kepegawaian guru.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold"
                    >
                        <Plus className="size-4" />
                        <span>Tambah Data Guru</span>
                    </Button>
                </div>

                {/* Filter & Search */}
                <Card className="border-border">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari berdasarkan nama guru, NIP, NUPTK, mapel, atau jabatan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 text-sm"
                                />
                            </div>
                            <div className="w-full sm:w-64">
                                <select
                                    value={unitKerja}
                                    onChange={(e) => setUnitKerja(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">Semua Program / Bagian</option>
                                    {(unit_kerja_list || []).map((uk: string) => (
                                        <option key={uk} value={uk}>
                                            {uk}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button type="submit" variant="secondary" size="sm" className="h-9">
                                    Filter
                                </Button>
                                {(search || unitKerja) && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearch('');
                                            setUnitKerja('');
                                            router.get('/pegawai');
                                        }}
                                        className="h-9"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table Data Guru */}
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-foreground">
                                    Daftar Dewan Guru & Karyawan ({pegawais.total} Orang)
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Data terdaftar digunakan otomatis untuk penugasan Surat Tugas (SPT) dan lembar SPPD.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b text-xs font-medium text-muted-foreground uppercase bg-muted/30">
                                    <tr>
                                        <th className="py-3 pl-4">Nama & NIP / NUPTK</th>
                                        <th className="py-3">Mata Pelajaran & Jabatan</th>
                                        <th className="py-3">Status Guru</th>
                                        <th className="py-3">Golongan</th>
                                        <th className="py-3">Rekening Bank</th>
                                        <th className="py-3">No. Telepon</th>
                                        <th className="py-3 text-right pr-4">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {pegawais.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                Tidak ada data guru ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        pegawais.data.map((p) => (
                                            <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-3.5 pl-4">
                                                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                                                        <span>{p.nama}</span>
                                                        {p.is_pejabat_penandatangan && (
                                                            <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 text-[10px] px-1.5 py-0">
                                                                Kepala Sekolah
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                                                        <div>NIP: {p.nip}</div>
                                                        {p.nuptk && (
                                                            <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                                                                NUPTK: {p.nuptk}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3.5">
                                                    <div className="font-medium text-foreground flex items-center gap-1.5">
                                                        <GraduationCap className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                        <span>{p.mata_pelajaran || 'Umum / Administrasi'}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {p.jabatan} • <span className="font-medium">{p.unit_kerja}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 text-xs">
                                                    <Badge variant="outline" className="bg-slate-500/10 text-slate-800 dark:text-slate-300 border-slate-500/20 text-[11px]">
                                                        {p.status_guru || 'Guru Tetap'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 text-xs font-mono">
                                                    <Badge variant="outline">
                                                        {p.golongan}
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 text-xs">
                                                    <div className="font-mono font-medium text-foreground flex items-center gap-1">
                                                        <CreditCard className="size-3 text-muted-foreground" />
                                                        <span>{p.nomor_rekening}</span>
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {p.nama_bank}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 text-xs font-mono">
                                                    {p.telepon ? (
                                                        <div className="flex items-center gap-1 text-foreground">
                                                            <Phone className="size-3 text-muted-foreground" />
                                                            <span>{p.telepon}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 text-right pr-4">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEdit(p)}
                                                            className="size-8 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Edit2 className="size-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(p)}
                                                            className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pegawais.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-border p-4">
                                <span className="text-xs text-muted-foreground">
                                    Halaman {pegawais.current_page} dari {pegawais.last_page}
                                </span>
                                <div className="flex items-center gap-1">
                                    {pegawais.links.map((link, i) => (
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

                {/* Dialog Tambah Guru */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <GraduationCap className="size-5 text-emerald-600" />
                                <span>Tambah Data Guru Baru</span>
                            </DialogTitle>
                            <DialogDescription>
                                Masukkan profil guru untuk pengajuan tugas dinas SMK Budi Mulia.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1 sm:col-span-2">
                                    <Label htmlFor="create_nama">Nama Lengkap & Gelar *</Label>
                                    <Input
                                        id="create_nama"
                                        required
                                        placeholder="Contoh: Budi Santoso, S.Kom., Gr."
                                        value={createForm.data.nama}
                                        onChange={(e) => createForm.setData('nama', e.target.value)}
                                    />
                                    {createForm.errors.nama && (
                                        <p className="text-xs text-destructive">{createForm.errors.nama}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_nip">NIP / NIK *</Label>
                                    <Input
                                        id="create_nip"
                                        required
                                        placeholder="NIP atau NIK Guru"
                                        value={createForm.data.nip}
                                        onChange={(e) => createForm.setData('nip', e.target.value)}
                                    />
                                    {createForm.errors.nip && (
                                        <p className="text-xs text-destructive">{createForm.errors.nip}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_nuptk">NUPTK (Nomor Unik Pendidik)</Label>
                                    <Input
                                        id="create_nuptk"
                                        placeholder="Contoh: 8439762663130122"
                                        value={createForm.data.nuptk}
                                        onChange={(e) => createForm.setData('nuptk', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_mapel">Mata Pelajaran yang Diampu</Label>
                                    <Input
                                        id="create_mapel"
                                        placeholder="Contoh: Produktif TKJ, RPL, Matematika..."
                                        value={createForm.data.mata_pelajaran}
                                        onChange={(e) => createForm.setData('mata_pelajaran', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_jabatan">Jabatan Kedinasan *</Label>
                                    <Input
                                        id="create_jabatan"
                                        required
                                        placeholder="Contoh: Guru Produktif / Kaprog TKJ"
                                        value={createForm.data.jabatan}
                                        onChange={(e) => createForm.setData('jabatan', e.target.value)}
                                    />
                                    {createForm.errors.jabatan && (
                                        <p className="text-xs text-destructive">{createForm.errors.jabatan}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_status_guru">Status Guru *</Label>
                                    <select
                                        id="create_status_guru"
                                        value={createForm.data.status_guru}
                                        onChange={(e) => createForm.setData('status_guru', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background p-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="Guru Tetap Yayasan (GTY)">Guru Tetap Yayasan (GTY)</option>
                                        <option value="Guru Tidak Tetap (GTT)">Guru Tidak Tetap (GTT)</option>
                                        <option value="PPPK Guru">PPPK Guru</option>
                                        <option value="PNS Dpk">PNS Dpk</option>
                                        <option value="Tenaga Kependidikan">Tenaga Kependidikan</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_unit_kerja">Unit Kerja / Bagian *</Label>
                                    <Input
                                        id="create_unit_kerja"
                                        required
                                        placeholder="Contoh: Program Keahlian TKJ, RPL..."
                                        value={createForm.data.unit_kerja}
                                        onChange={(e) => createForm.setData('unit_kerja', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_golongan">Pangkat / Golongan *</Label>
                                    <Input
                                        id="create_golongan"
                                        required
                                        placeholder="Contoh: Penata (III/c), III/a, dll"
                                        value={createForm.data.golongan}
                                        onChange={(e) => createForm.setData('golongan', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_telepon">Nomor Telepon / WA</Label>
                                    <Input
                                        id="create_telepon"
                                        placeholder="08xxxxxxxxxx"
                                        value={createForm.data.telepon}
                                        onChange={(e) => createForm.setData('telepon', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_rekening">Nomor Rekening Bank *</Label>
                                    <Input
                                        id="create_rekening"
                                        required
                                        placeholder="Nomor rekening untuk transfer"
                                        value={createForm.data.nomor_rekening}
                                        onChange={(e) => createForm.setData('nomor_rekening', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_bank">Nama Bank *</Label>
                                    <Input
                                        id="create_bank"
                                        required
                                        placeholder="Contoh: Bank BJB, Mandiri, BCA..."
                                        value={createForm.data.nama_bank}
                                        onChange={(e) => createForm.setData('nama_bank', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <Label htmlFor="create_email">Email Kedinasan</Label>
                                    <Input
                                        id="create_email"
                                        type="email"
                                        placeholder="nama.guru@smkbudimulia.sch.id"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 border-t pt-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="create_penandatangan"
                                        checked={createForm.data.is_pejabat_penandatangan}
                                        onChange={(e) => createForm.setData('is_pejabat_penandatangan', e.target.checked)}
                                        className="rounded border-input text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <Label htmlFor="create_penandatangan" className="cursor-pointer text-xs font-normal">
                                        Pejabat Penandatangan Surat Tugas (Kepala Sekolah)
                                    </Label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="create_user_account"
                                        checked={createForm.data.create_user_account}
                                        onChange={(e) => createForm.setData('create_user_account', e.target.checked)}
                                        className="rounded border-input text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <Label htmlFor="create_user_account" className="cursor-pointer text-xs font-normal">
                                        Buat Akun Pengguna Sistem (Login menggunakan email di atas, password default: <strong>password</strong>)
                                    </Label>
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={createForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                    {createForm.processing ? 'Menyimpan...' : 'Simpan Data Guru'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog Edit Guru */}
                <Dialog open={!!editingPegawai} onOpenChange={(open) => !open && setEditingPegawai(null)}>
                    <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Edit2 className="size-4 text-emerald-600" />
                                <span>Edit Data Guru: {editingPegawai?.nama}</span>
                            </DialogTitle>
                            <DialogDescription>
                                Perbarui informasi profil guru, mata pelajaran, dan nomor rekening.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1 sm:col-span-2">
                                    <Label htmlFor="edit_nama">Nama Lengkap & Gelar *</Label>
                                    <Input
                                        id="edit_nama"
                                        required
                                        value={editForm.data.nama}
                                        onChange={(e) => editForm.setData('nama', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_nip">NIP / NIK *</Label>
                                    <Input
                                        id="edit_nip"
                                        required
                                        value={editForm.data.nip}
                                        onChange={(e) => editForm.setData('nip', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_nuptk">NUPTK</Label>
                                    <Input
                                        id="edit_nuptk"
                                        value={editForm.data.nuptk}
                                        onChange={(e) => editForm.setData('nuptk', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_mapel">Mata Pelajaran</Label>
                                    <Input
                                        id="edit_mapel"
                                        value={editForm.data.mata_pelajaran}
                                        onChange={(e) => editForm.setData('mata_pelajaran', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_jabatan">Jabatan Kedinasan *</Label>
                                    <Input
                                        id="edit_jabatan"
                                        required
                                        value={editForm.data.jabatan}
                                        onChange={(e) => editForm.setData('jabatan', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_status_guru">Status Guru *</Label>
                                    <select
                                        id="edit_status_guru"
                                        value={editForm.data.status_guru}
                                        onChange={(e) => editForm.setData('status_guru', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background p-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="Guru Tetap Yayasan (GTY)">Guru Tetap Yayasan (GTY)</option>
                                        <option value="Guru Tidak Tetap (GTT)">Guru Tidak Tetap (GTT)</option>
                                        <option value="PPPK Guru">PPPK Guru</option>
                                        <option value="PNS Dpk">PNS Dpk</option>
                                        <option value="Tenaga Kependidikan">Tenaga Kependidikan</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_unit_kerja">Unit Kerja / Bagian *</Label>
                                    <Input
                                        id="edit_unit_kerja"
                                        required
                                        value={editForm.data.unit_kerja}
                                        onChange={(e) => editForm.setData('unit_kerja', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_golongan">Pangkat / Golongan *</Label>
                                    <Input
                                        id="edit_golongan"
                                        required
                                        value={editForm.data.golongan}
                                        onChange={(e) => editForm.setData('golongan', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_telepon">Nomor Telepon / WA</Label>
                                    <Input
                                        id="edit_telepon"
                                        value={editForm.data.telepon}
                                        onChange={(e) => editForm.setData('telepon', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_rekening">Nomor Rekening Bank *</Label>
                                    <Input
                                        id="edit_rekening"
                                        required
                                        value={editForm.data.nomor_rekening}
                                        onChange={(e) => editForm.setData('nomor_rekening', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_bank">Nama Bank *</Label>
                                    <Input
                                        id="edit_bank"
                                        required
                                        value={editForm.data.nama_bank}
                                        onChange={(e) => editForm.setData('nama_bank', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <Label htmlFor="edit_email">Email Kedinasan</Label>
                                    <Input
                                        id="edit_email"
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 border-t pt-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="edit_penandatangan"
                                        checked={editForm.data.is_pejabat_penandatangan}
                                        onChange={(e) => editForm.setData('is_pejabat_penandatangan', e.target.checked)}
                                        className="rounded border-input text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <Label htmlFor="edit_penandatangan" className="cursor-pointer text-xs font-normal">
                                        Pejabat Penandatangan Surat Tugas (Kepala Sekolah)
                                    </Label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="edit_status_aktif"
                                        checked={editForm.data.status_aktif}
                                        onChange={(e) => editForm.setData('status_aktif', e.target.checked)}
                                        className="rounded border-input text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <Label htmlFor="edit_status_aktif" className="cursor-pointer text-xs font-normal">
                                        Status Guru Aktif
                                    </Label>
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button type="button" variant="outline" onClick={() => setEditingPegawai(null)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                    {editForm.processing ? 'Menyimpan...' : 'Perbarui Data Guru'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
