import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ClipboardList,
    DollarSign,
    FileCheck,
    FileText,
    MapPin,
    Paperclip,
    PlusCircle,
    Send,
    Upload,
    User,
} from 'lucide-react';
import React, { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    status: string;
    pegawai?: {
        nama: string;
        nip: string;
        jabatan: string;
    };
    biaya?: {
        uang_harian_total: number;
        biaya_transportasi: number;
        biaya_penginapan_total: number;
        biaya_lainnya: number;
        total_biaya: number;
        status_pembayaran: string;
    };
    dokumens?: {
        id: number;
        jenis_dokumen: string;
        nama_dokumen: string;
        file_path: string;
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
}

interface PageProps {
    sppds: {
        data: SppdItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function GuruLaporan({ sppds }: PageProps) {
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };
    const [selectedSppd, setSelectedSppd] = useState<SppdItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form data for trip report & proof upload
    const { data, setData, post, processing, errors, reset } = useForm({
        ringkasan_kegiatan: '',
        hasil_kegiatan: '',
        kendala: '',
        saran_tindak_lanjut: '',
        tanggal_laporan: new Date().toISOString().split('T')[0],
        realisasi_transportasi: '',
        realisasi_penginapan: '',
        realisasi_lainnya: '',
        keterangan_biaya_lainnya: '',
        jenis_bukti: 'foto_kegiatan',
        nama_bukti: '',
        bukti_file: null as File | null,
    });

    const openLaporanModal = (sppd: SppdItem) => {
        setSelectedSppd(sppd);
        setData({
            ringkasan_kegiatan: sppd.laporan?.ringkasan_kegiatan || '',
            hasil_kegiatan: sppd.laporan?.hasil_kegiatan || '',
            kendala: sppd.laporan?.kendala || '',
            saran_tindak_lanjut: sppd.laporan?.saran_tindak_lanjut || '',
            tanggal_laporan: sppd.laporan?.tanggal_laporan || new Date().toISOString().split('T')[0],
            realisasi_transportasi: sppd.biaya?.biaya_transportasi ? String(sppd.biaya.biaya_transportasi) : '',
            realisasi_penginapan: sppd.biaya?.biaya_penginapan_total ? String(sppd.biaya.biaya_penginapan_total) : '',
            realisasi_lainnya: sppd.biaya?.biaya_lainnya ? String(sppd.biaya.biaya_lainnya) : '',
            keterangan_biaya_lainnya: '',
            jenis_bukti: 'foto_kegiatan',
            nama_bukti: '',
            bukti_file: null,
        });
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSppd) return;

        post(`/laporan-perjalanan/${selectedSppd.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    return (
        <>
            <Head title="Laporan Perjalanan Dinas Guru - SMK Budi Mulia" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
                {/* Header Card */}
                <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xs">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border">
                                <ClipboardList className="size-3.5 text-orange-600" />
                                <span>Pertanggungjawaban Pelaksanaan Tugas Guru</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Laporan Hasil Perjalanan Dinas
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-2xl">
                                Setelah bertugas, isikan ringkasan & hasil kegiatan, unggah berkas bukti perjalanan (tiket/foto kegiatan), dan laporkan realisasi biaya dinas Anda.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Flash Message */}
                {flash?.success && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted p-4 text-sm text-foreground">
                        <CheckCircle2 className="size-4 text-orange-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Sppd Trip List */}
                <div className="grid gap-4">
                    {sppds.data.length === 0 ? (
                        <Card className="border-dashed py-12 text-center">
                            <CardContent className="space-y-3">
                                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    <ClipboardList className="size-6" />
                                </div>
                                <h3 className="text-base font-semibold text-foreground">
                                    Belum Ada Perjalanan Dinas yang Perlu Dilaporkan
                                </h3>
                                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                    Laporan perjalanan dinas dapat diisi setelah pengajuan SPPD Anda disetujui oleh Kepala Sekolah.
                                </p>
                                <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white font-medium mt-2">
                                    <Link href="/sppd/create">
                                        <PlusCircle className="mr-1.5 size-4" />
                                        Buat Pengajuan Baru
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        sppds.data.map((item) => {
                            const hasLaporan = Boolean(item.laporan);

                            return (
                                <Card key={item.id} className="hover:border-foreground/30 transition-colors">
                                    <CardHeader className="pb-3">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-foreground text-base">
                                                        {item.nomor_sp}
                                                    </span>
                                                    {hasLaporan ? (
                                                        <Badge className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900">
                                                            Laporan Diserahkan
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-orange-500 text-orange-600 font-medium">
                                                            Belum Mengisi Laporan
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    SPPD: {item.nomor_sppd}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => openLaporanModal(item)}
                                                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs gap-1.5 h-8"
                                                >
                                                    <ClipboardList className="size-3.5" />
                                                    <span>{hasLaporan ? 'Edit / Perbarui Laporan' : 'Isi Laporan Sekarang'}</span>
                                                </Button>
                                                <Button variant="outline" asChild className="text-xs h-8">
                                                    <Link href={`/sppd/${item.id}`}>
                                                        Lihat Detail
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3 pt-0">
                                        <div className="rounded-lg bg-muted/50 p-3 text-sm text-foreground space-y-1">
                                            <div className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                                                Maksud & Tujuan Perjalanan:
                                            </div>
                                            <p className="text-xs sm:text-sm line-clamp-2">
                                                {item.maksud_tujuan}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground border-t border-border pt-3">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="size-3.5 shrink-0 text-foreground" />
                                                <span className="truncate">{item.tempat_tujuan}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="size-3.5 shrink-0 text-foreground" />
                                                <span>{item.tanggal_berangkat} ({item.lama_hari} hari)</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <DollarSign className="size-3.5 shrink-0 text-foreground" />
                                                <span>{formatRupiah(item.biaya?.total_biaya || 0)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Paperclip className="size-3.5 shrink-0 text-foreground" />
                                                <span>{item.dokumens?.length || 0} berkas bukti terunggah</span>
                                            </div>
                                        </div>

                                        {hasLaporan && (
                                            <div className="rounded-md border border-border bg-background p-2.5 text-xs space-y-1">
                                                <span className="font-semibold text-foreground">Ringkasan Hasil Tugas:</span>
                                                <p className="text-muted-foreground line-clamp-2">
                                                    {item.laporan?.ringkasan_kegiatan}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Dialog Form Pengisian Laporan Perjalanan */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">
                                Form Laporan Hasil Tugas & Realisasi Biaya
                            </DialogTitle>
                            <DialogDescription>
                                {selectedSppd?.nomor_sp} • Tujuan: {selectedSppd?.tempat_tujuan}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={submit} className="space-y-4 pt-2">
                            {/* 1. Ringkasan Kegiatan */}
                            <div className="space-y-1.5">
                                <Label htmlFor="ringkasan_kegiatan" className="text-xs font-semibold">
                                    Ringkasan Pelaksanaan Kegiatan <span className="text-red-500">*</span>
                                </Label>
                                <textarea
                                    id="ringkasan_kegiatan"
                                    rows={3}
                                    value={data.ringkasan_kegiatan}
                                    onChange={(e) => setData('ringkasan_kegiatan', e.target.value)}
                                    required
                                    placeholder="Jelaskan jalannya kegiatan atau pelatihan yang telah diikuti..."
                                    className="w-full rounded-md border border-input bg-background p-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                <InputError message={errors.ringkasan_kegiatan} />
                            </div>

                            {/* 2. Hasil Kegiatan */}
                            <div className="space-y-1.5">
                                <Label htmlFor="hasil_kegiatan" className="text-xs font-semibold">
                                    Hasil / Output yang Dicapai <span className="text-red-500">*</span>
                                </Label>
                                <textarea
                                    id="hasil_kegiatan"
                                    rows={3}
                                    value={data.hasil_kegiatan}
                                    onChange={(e) => setData('hasil_kegiatan', e.target.value)}
                                    required
                                    placeholder="Jelaskan hasil, sertifikat yang diperoleh, atau rencana implementasi di SMK Budi Mulia..."
                                    className="w-full rounded-md border border-input bg-background p-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                <InputError message={errors.hasil_kegiatan} />
                            </div>

                            {/* 3. Kendala & Saran Tindak Lanjut */}
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="kendala" className="text-xs font-semibold">
                                        Kendala yang Dihadapi (Opsional)
                                    </Label>
                                    <textarea
                                        id="kendala"
                                        rows={2}
                                        value={data.kendala}
                                        onChange={(e) => setData('kendala', e.target.value)}
                                        placeholder="Kendala selama perjalanan..."
                                        className="w-full rounded-md border border-input bg-background p-2 text-xs placeholder:text-muted-foreground focus-visible:outline-hidden"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="saran_tindak_lanjut" className="text-xs font-semibold">
                                        Saran / Tindak Lanjut
                                    </Label>
                                    <textarea
                                        id="saran_tindak_lanjut"
                                        rows={2}
                                        value={data.saran_tindak_lanjut}
                                        onChange={(e) => setData('saran_tindak_lanjut', e.target.value)}
                                        placeholder="Saran untuk pihak sekolah..."
                                        className="w-full rounded-md border border-input bg-background p-2 text-xs placeholder:text-muted-foreground focus-visible:outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* 4. Realisasi Biaya Riil */}
                            <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-3">
                                <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                    <DollarSign className="size-4 text-orange-600" />
                                    <span>Realisasi Biaya Riil (Pertanggungjawaban ke Bendahara)</span>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="realisasi_transportasi" className="text-[11px]">
                                            Transportasi Riil (Rp)
                                        </Label>
                                        <Input
                                            id="realisasi_transportasi"
                                            type="number"
                                            value={data.realisasi_transportasi}
                                            onChange={(e) => setData('realisasi_transportasi', e.target.value)}
                                            placeholder="Sesuai bukti tiket"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="realisasi_penginapan" className="text-[11px]">
                                            Penginapan Riil (Rp)
                                        </Label>
                                        <Input
                                            id="realisasi_penginapan"
                                            type="number"
                                            value={data.realisasi_penginapan}
                                            onChange={(e) => setData('realisasi_penginapan', e.target.value)}
                                            placeholder="Sesuai nota hotel"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="realisasi_lainnya" className="text-[11px]">
                                            Biaya Lainnya (Rp)
                                        </Label>
                                        <Input
                                            id="realisasi_lainnya"
                                            type="number"
                                            value={data.realisasi_lainnya}
                                            onChange={(e) => setData('realisasi_lainnya', e.target.value)}
                                            placeholder="Tol, parkir, dll"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 5. Unggah Berkas Bukti Kegiatan */}
                            <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-3">
                                <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                    <Upload className="size-4 text-orange-600" />
                                    <span>Unggah Bukti Perjalanan (Tiket, Kuitansi, Foto Kegiatan)</span>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label className="text-[11px]">Jenis Bukti</Label>
                                        <select
                                            value={data.jenis_bukti}
                                            onChange={(e) => setData('jenis_bukti', e.target.value)}
                                            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                                        >
                                            <option value="foto_kegiatan">Foto Dokumentasi Kegiatan</option>
                                            <option value="tiket">Tiket / Boarding Pass</option>
                                            <option value="nota_hotel">Nota / Kuitansi Hotel</option>
                                            <option value="laporan_kegiatan">Sertifikat / Piagam</option>
                                            <option value="lainnya">Kuitansi / Bukti Lainnya</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[11px]">Nama / Keterangan Berkas</Label>
                                        <Input
                                            value={data.nama_bukti}
                                            onChange={(e) => setData('nama_bukti', e.target.value)}
                                            placeholder="Contoh: Foto Workshop Hari Ke-1.jpg"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1 sm:col-span-2">
                                        <Label className="text-[11px]">Pilih File Bukti (PDF / JPG / PNG max 10MB)</Label>
                                        <Input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setData('bukti_file', e.target.files ? e.target.files[0] : null)}
                                            className="h-9 text-xs file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-muted"
                                        />
                                        <InputError message={errors.bukti_file} />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold gap-1.5"
                                >
                                    <Send className="size-4" />
                                    <span>{processing ? 'Menyerahkan Laporan...' : 'Kirim Laporan ke Pimpinan'}</span>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
