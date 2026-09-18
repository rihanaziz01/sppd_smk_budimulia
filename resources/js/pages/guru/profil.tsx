import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Building2,
    CheckCircle2,
    CreditCard,
    FileText,
    GraduationCap,
    Mail,
    Phone,
    Save,
    Shield,
    User,
    UserCheck,
} from 'lucide-react';
import React from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PegawaiData {
    id: number;
    nama: string;
    nip?: string;
    nik?: string;
    nuptk?: string;
    jabatan: string;
    mata_pelajaran?: string;
    telepon?: string;
    email: string;
    nomor_rekening?: string;
    nama_bank?: string;
    unit_kerja?: string;
    golongan?: string;
    status_guru?: string;
}

interface PageProps {
    guru: PegawaiData;
    user: {
        id: number;
        name: string;
        username?: string;
        email: string;
        role: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function GuruProfil({ guru, user }: PageProps) {
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        nama: guru?.nama || user?.name || '',
        nip: guru?.nip || '',
        nik: guru?.nik || '',
        nuptk: guru?.nuptk || '',
        jabatan: guru?.jabatan || 'Guru Mata Pelajaran',
        mata_pelajaran: guru?.mata_pelajaran || '',
        telepon: guru?.telepon || '',
        email: guru?.email || user?.email || '',
        nomor_rekening: guru?.nomor_rekening || '',
        nama_bank: guru?.nama_bank || 'Bank BJB',
        unit_kerja: guru?.unit_kerja || 'Tenaga Pendidik SMK Budi Mulia',
        golongan: guru?.golongan || '',
        status_guru: guru?.status_guru || 'Guru Tetap Yayasan (GTY)',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/guru/profil', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Profil Saya - Guru SMK Budi Mulia" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
                {/* Header Profile Banner */}
                <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xs">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted border border-border text-foreground font-bold text-xl">
                                <UserCheck className="size-8 text-foreground" />
                            </div>
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border">
                                    <GraduationCap className="size-3.5" />
                                    <span>Profil Pendidik SMK Budi Mulia</span>
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    {data.nama || 'Profil Guru'}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {data.jabatan} • {data.mata_pelajaran ? `Mapel: ${data.mata_pelajaran}` : 'SMK Budi Mulia Karawang'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground">
                                Role: <span className="font-semibold uppercase tracking-wider">Guru</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Success Alert */}
                {(flash?.success || recentlySuccessful) && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted p-4 text-sm text-foreground">
                        <CheckCircle2 className="size-4 text-orange-600" />
                        <span>{flash?.success || 'Data profil guru berhasil diperbarui!'}</span>
                    </div>
                )}

                {/* Profile Form */}
                <form onSubmit={submit} className="space-y-6">
                    {/* 1. Informasi Identitas Guru */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <User className="size-4 text-orange-600" />
                                <span>Identitas Tenaga Pendidik</span>
                            </CardTitle>
                            <CardDescription>
                                Informasi identitas resmi guru yang tercantum pada kop dan lampiran SPPD.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            {/* Nama Lengkap & Gelar */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="nama" className="text-xs font-semibold">
                                    Nama Lengkap & Gelar <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="nama"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    required
                                    placeholder="Contoh: Budi Santoso, S.Kom., Gr."
                                />
                                <InputError message={errors.nama} />
                            </div>

                            {/* NIP / NIK */}
                            <div className="space-y-1.5">
                                <Label htmlFor="nip" className="text-xs font-semibold">
                                    NIP / NIK Pegawai
                                </Label>
                                <Input
                                    id="nip"
                                    value={data.nip}
                                    onChange={(e) => setData('nip', e.target.value)}
                                    placeholder="Nomor Induk Pegawai"
                                />
                                <InputError message={errors.nip} />
                            </div>

                            {/* NIK KTP */}
                            <div className="space-y-1.5">
                                <Label htmlFor="nik" className="text-xs font-semibold">
                                    NIK (Nomor Induk Kependudukan)
                                </Label>
                                <Input
                                    id="nik"
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                    placeholder="16 digit nomor KTP"
                                />
                                <InputError message={errors.nik} />
                            </div>

                            {/* NUPTK */}
                            <div className="space-y-1.5">
                                <Label htmlFor="nuptk" className="text-xs font-semibold">
                                    NUPTK (Nomor Unik Pendidik & Tenaga Kependidikan)
                                </Label>
                                <Input
                                    id="nuptk"
                                    value={data.nuptk}
                                    onChange={(e) => setData('nuptk', e.target.value)}
                                    placeholder="16 digit NUPTK"
                                />
                                <InputError message={errors.nuptk} />
                            </div>

                            {/* Status Guru */}
                            <div className="space-y-1.5">
                                <Label htmlFor="status_guru" className="text-xs font-semibold">
                                    Status Kepegawaian Guru
                                </Label>
                                <Input
                                    id="status_guru"
                                    value={data.status_guru}
                                    onChange={(e) => setData('status_guru', e.target.value)}
                                    placeholder="Contoh: Guru Tetap Yayasan (GTY) / PPPK / PNS Dpk"
                                />
                                <InputError message={errors.status_guru} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Tugas & Jabatan Akademik */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <BookOpen className="size-4 text-orange-600" />
                                <span>Jabatan & Penugasan Mengajar</span>
                            </CardTitle>
                            <CardDescription>
                                Unit penugasan dan mata pelajaran yang diampu di SMK Budi Mulia Karawang.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            {/* Jabatan */}
                            <div className="space-y-1.5">
                                <Label htmlFor="jabatan" className="text-xs font-semibold">
                                    Jabatan Kedinasan <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="jabatan"
                                    value={data.jabatan}
                                    onChange={(e) => setData('jabatan', e.target.value)}
                                    required
                                    placeholder="Contoh: Guru Produktif TKJ / Kepala Program Keahlian"
                                />
                                <InputError message={errors.jabatan} />
                            </div>

                            {/* Mata Pelajaran */}
                            <div className="space-y-1.5">
                                <Label htmlFor="mata_pelajaran" className="text-xs font-semibold">
                                    Mata Pelajaran yang Diampu
                                </Label>
                                <Input
                                    id="mata_pelajaran"
                                    value={data.mata_pelajaran}
                                    onChange={(e) => setData('mata_pelajaran', e.target.value)}
                                    placeholder="Contoh: Administrasi Infrastruktur Jaringan"
                                />
                                <InputError message={errors.mata_pelajaran} />
                            </div>

                            {/* Unit Kerja */}
                            <div className="space-y-1.5">
                                <Label htmlFor="unit_kerja" className="text-xs font-semibold">
                                    Unit Kerja
                                </Label>
                                <Input
                                    id="unit_kerja"
                                    value={data.unit_kerja}
                                    onChange={(e) => setData('unit_kerja', e.target.value)}
                                    placeholder="Contoh: Program Keahlian TKJ / Bagian Kurikulum"
                                />
                                <InputError message={errors.unit_kerja} />
                            </div>

                            {/* Golongan / Pangkat */}
                            <div className="space-y-1.5">
                                <Label htmlFor="golongan" className="text-xs font-semibold">
                                    Pangkat / Golongan Ruang
                                </Label>
                                <Input
                                    id="golongan"
                                    value={data.golongan}
                                    onChange={(e) => setData('golongan', e.target.value)}
                                    placeholder="Contoh: Penata Muda (III/a) atau Non-PNS"
                                />
                                <InputError message={errors.golongan} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Kontak & Data Keuangan (Rekening) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <CreditCard className="size-4 text-orange-600" />
                                <span>Kontak & Informasi Pencairan Biaya Dinas</span>
                            </CardTitle>
                            <CardDescription>
                                Digunakan oleh Bendahara Sekolah untuk verifikasi dan pencairan transfer uang harian/transport SPPD.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            {/* Nomor Telepon / WhatsApp */}
                            <div className="space-y-1.5">
                                <Label htmlFor="telepon" className="text-xs font-semibold">
                                    Nomor Telepon / WhatsApp Aktif
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        id="telepon"
                                        value={data.telepon}
                                        onChange={(e) => setData('telepon', e.target.value)}
                                        className="pl-9"
                                        placeholder="081234567890"
                                    />
                                </div>
                                <InputError message={errors.telepon} />
                            </div>

                            {/* Email Kedinasan */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold">
                                    Alamat Email Kedinasan <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        className="pl-9"
                                        placeholder="guru@smkbudimulia.sch.id"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Nomor Rekening */}
                            <div className="space-y-1.5">
                                <Label htmlFor="nomor_rekening" className="text-xs font-semibold">
                                    Nomor Rekening Bank (untuk Transfer BKK)
                                </Label>
                                <Input
                                    id="nomor_rekening"
                                    value={data.nomor_rekening}
                                    onChange={(e) => setData('nomor_rekening', e.target.value)}
                                    placeholder="Contoh: 0019827364501"
                                />
                                <InputError message={errors.nomor_rekening} />
                            </div>

                            {/* Nama Bank */}
                            <div className="space-y-1.5">
                                <Label htmlFor="nama_bank" className="text-xs font-semibold">
                                    Nama Bank Penerima
                                </Label>
                                <Input
                                    id="nama_bank"
                                    value={data.nama_bank}
                                    onChange={(e) => setData('nama_bank', e.target.value)}
                                    placeholder="Contoh: Bank BJB, Bank Mandiri, BCA, BRI, BNI"
                                />
                                <InputError message={errors.nama_bank} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-xs gap-2 h-10 px-6"
                        >
                            <Save className="size-4" />
                            <span>{processing ? 'Menyimpan Perubahan...' : 'Simpan Profil Guru'}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
