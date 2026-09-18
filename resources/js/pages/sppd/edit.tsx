import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Coins,
    FileText,
    MapPin,
    Save,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PegawaiItem {
    id: number;
    nip: string;
    nuptk?: string;
    nama: string;
    jabatan: string;
    mata_pelajaran?: string;
    golongan: string;
    unit_kerja: string;
}

interface SppdData {
    id: number;
    nomor_sp: string;
    nomor_sppd: string;
    pegawai_id: number;
    pejabat_pemberi_perintah_id?: number | null;
    maksud_tujuan: string;
    tempat_berangkat: string;
    tempat_tujuan: string;
    tingkat_biaya: string;
    alat_angkut: string;
    tanggal_berangkat: string;
    tanggal_kembali: string;
    lama_hari: number;
    instansi_pembebanan?: string;
    mata_anggaran?: string;
    keterangan?: string;
    biaya?: {
        uang_harian_per_hari: number;
        biaya_transportasi: number;
        biaya_penginapan_malam: number;
        biaya_penginapan_per_malam: number;
        biaya_lainnya: number;
        keterangan_biaya_lainnya: string;
    };
}

interface SppdEditProps {
    sppd: SppdData;
    pegawais: PegawaiItem[];
    pejabats: PegawaiItem[];
    selected_pengikut_ids: number[];
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function SppdEdit({
    sppd,
    pegawais,
    pejabats,
    selected_pengikut_ids,
}: SppdEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        nomor_sp: sppd.nomor_sp,
        nomor_sppd: sppd.nomor_sppd,
        pegawai_id: String(sppd.pegawai_id),
        pejabat_pemberi_perintah_id: sppd.pejabat_pemberi_perintah_id ? String(sppd.pejabat_pemberi_perintah_id) : '',
        pengikut_ids: selected_pengikut_ids.map(String),
        maksud_tujuan: sppd.maksud_tujuan,
        tempat_berangkat: sppd.tempat_berangkat,
        tempat_tujuan: sppd.tempat_tujuan,
        tingkat_biaya: sppd.tingkat_biaya,
        alat_angkut: sppd.alat_angkut,
        tanggal_berangkat: sppd.tanggal_berangkat,
        tanggal_kembali: sppd.tanggal_kembali,
        instansi_pembebanan: sppd.instansi_pembebanan || 'SMK Budi Mulia',
        mata_anggaran: sppd.mata_anggaran || 'BOS/BOP-2026',
        keterangan: sppd.keterangan || '',
        uang_harian_per_hari: sppd.biaya?.uang_harian_per_hari || 430000,
        biaya_transportasi: sppd.biaya?.biaya_transportasi || 0,
        biaya_penginapan_malam: sppd.biaya?.biaya_penginapan_malam || 0,
        biaya_penginapan_per_malam: sppd.biaya?.biaya_penginapan_per_malam || 0,
        biaya_lainnya: sppd.biaya?.biaya_lainnya || 0,
        keterangan_biaya_lainnya: sppd.biaya?.keterangan_biaya_lainnya || '',
    });

    const [lamaHari, setLamaHari] = useState(sppd.lama_hari || 1);

    useEffect(() => {
        if (data.tanggal_berangkat && data.tanggal_kembali) {
            const start = new Date(data.tanggal_berangkat);
            const end = new Date(data.tanggal_kembali);
            const diffTime = end.getTime() - start.getTime();
            const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
            setLamaHari(days);
        }
    }, [data.tanggal_berangkat, data.tanggal_kembali]);

    const totalUangHarian = (data.uang_harian_per_hari || 0) * lamaHari;
    const totalHotel = (data.biaya_penginapan_malam || 0) * (data.biaya_penginapan_per_malam || 0);
    const grandTotal = totalUangHarian + Number(data.biaya_transportasi || 0) + totalHotel + Number(data.biaya_lainnya || 0);

    const handlePengikutToggle = (pegawaiId: string) => {
        if (data.pengikut_ids.includes(pegawaiId)) {
            setData('pengikut_ids', data.pengikut_ids.filter((id) => id !== pegawaiId));
        } else {
            setData('pengikut_ids', [...data.pengikut_ids, pegawaiId]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/sppd/${sppd.id}`);
    };

    return (
        <>
            <Head title={`Edit SPPD ${sppd.nomor_sppd}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild className="size-9">
                        <Link href={`/sppd/${sppd.id}`}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Edit Pengajuan SPPD
                        </h1>
                        <p className="text-sm text-muted-foreground font-mono">
                            {sppd.nomor_sppd}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Nomor Surat & Legalitas */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <FileText className="size-5" />
                                <CardTitle className="text-base">1. Nomor Registrasi & Legalitas</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="nomor_sp">Nomor Surat Tugas (SPT) *</Label>
                                    <Input
                                        id="nomor_sp"
                                        required
                                        value={data.nomor_sp}
                                        onChange={(e) => setData('nomor_sp', e.target.value)}
                                    />
                                    {errors.nomor_sp && <p className="text-xs text-rose-500 mt-1">{errors.nomor_sp}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="nomor_sppd">Nomor SPPD *</Label>
                                    <Input
                                        id="nomor_sppd"
                                        required
                                        value={data.nomor_sppd}
                                        onChange={(e) => setData('nomor_sppd', e.target.value)}
                                    />
                                    {errors.nomor_sppd && <p className="text-xs text-rose-500 mt-1">{errors.nomor_sppd}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="pejabat">Pejabat Pemberi Perintah *</Label>
                                    <select
                                        id="pejabat"
                                        value={data.pejabat_pemberi_perintah_id}
                                        onChange={(e) => setData('pejabat_pemberi_perintah_id', e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        {pejabats.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nama} ({p.jabatan} - {p.golongan})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="instansi">Instansi Pembebanan Anggaran</Label>
                                    <Input
                                        id="instansi"
                                        value={data.instansi_pembebanan}
                                        onChange={(e) => setData('instansi_pembebanan', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Data Guru & Pengikut */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <Users className="size-5" />
                                <CardTitle className="text-base">2. Guru & Tim Pendamping</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="pegawai">Guru Pelaksana Tugas (Utama) *</Label>
                                <select
                                    id="pegawai"
                                    required
                                    value={data.pegawai_id}
                                    onChange={(e) => setData('pegawai_id', e.target.value)}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                                >
                                    {pegawais.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nama} • {p.mata_pelajaran ? `${p.mata_pelajaran} • ` : ''}{p.nuptk ? `NUPTK: ${p.nuptk}` : `NIP: ${p.nip}`} ({p.jabatan})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Accompanying members */}
                            <div>
                                <Label className="mb-2 block">Pengikut / Guru Pendamping (Opsional):</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-border/80 rounded-xl p-3 bg-muted/20">
                                    {pegawais
                                        .filter((p) => String(p.id) !== data.pegawai_id)
                                        .map((p) => {
                                            const isChecked = data.pengikut_ids.includes(String(p.id));
                                            return (
                                                <label
                                                    key={p.id}
                                                    className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                                        isChecked
                                                            ? 'border-emerald-500 bg-emerald-500/10 text-foreground font-semibold'
                                                            : 'border-border/60 hover:bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handlePengikutToggle(String(p.id))}
                                                        className="size-3.5 mt-0.5 rounded border-border"
                                                    />
                                                    <div>
                                                        <div className="text-foreground">{p.nama}</div>
                                                        <div className="text-[10px] text-muted-foreground">{p.mata_pelajaran || p.jabatan}</div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Rincian Perjalanan Dinas */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <MapPin className="size-5" />
                                <CardTitle className="text-base">3. Rincian Perjalanan & Waktu</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="keperluan">Maksud Perjalanan Dinas / Keperluan Tugas *</Label>
                                <textarea
                                    id="keperluan"
                                    required
                                    rows={3}
                                    value={data.maksud_tujuan}
                                    onChange={(e) => setData('maksud_tujuan', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>

                            <div>
                                <Label htmlFor="keterangan">Keterangan Tambahan / Penugasan Khusus (Opsional)</Label>
                                <textarea
                                    id="keterangan"
                                    rows={2}
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    placeholder="Contoh: Guru mendapat tugas menghadiri seminar/pelatihan di sekolah atau instansi lain..."
                                    className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="tempat_berangkat">Tempat Berangkat *</Label>
                                    <Input
                                        id="tempat_berangkat"
                                        required
                                        value={data.tempat_berangkat}
                                        onChange={(e) => setData('tempat_berangkat', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tempat_tujuan">Tempat Tujuan *</Label>
                                    <Input
                                        id="tempat_tujuan"
                                        required
                                        value={data.tempat_tujuan}
                                        onChange={(e) => setData('tempat_tujuan', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="tanggal_berangkat">Tanggal Berangkat *</Label>
                                    <Input
                                        id="tanggal_berangkat"
                                        type="date"
                                        required
                                        value={data.tanggal_berangkat}
                                        onChange={(e) => setData('tanggal_berangkat', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tanggal_kembali">Tanggal Kembali *</Label>
                                    <Input
                                        id="tanggal_kembali"
                                        type="date"
                                        required
                                        value={data.tanggal_kembali}
                                        onChange={(e) => setData('tanggal_kembali', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>Lama Perjalanan (Hari)</Label>
                                    <div className="h-9 px-3 py-1.5 rounded-md border border-border bg-muted/60 text-sm font-semibold flex items-center justify-between">
                                        <span>{lamaHari} Hari</span>
                                        <span className="text-xs text-muted-foreground">(Otomatis)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="alat_angkut">Moda Transportasi *</Label>
                                    <select
                                        id="alat_angkut"
                                        value={data.alat_angkut}
                                        onChange={(e) => setData('alat_angkut', e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="Pesawat Udara">Pesawat Udara</option>
                                        <option value="Kereta Api">Kereta Api</option>
                                        <option value="Mobil Dinas">Mobil Dinas</option>
                                        <option value="Bus / Travel">Bus / Travel</option>
                                        <option value="Kendaraan Pribadi">Kendaraan Pribadi</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="tingkat_biaya">Tingkat Biaya *</Label>
                                    <select
                                        id="tingkat_biaya"
                                        value={data.tingkat_biaya}
                                        onChange={(e) => setData('tingkat_biaya', e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="Tingkat A (Eselon II / Kepala Dinas)">Tingkat A (Eselon II / Kepala Dinas)</option>
                                        <option value="Tingkat B (Eselon III / Pejabat Fungsional Ahli)">Tingkat B (Eselon III / Fungsional Ahli)</option>
                                        <option value="Tingkat C (Eselon IV / Pelaksana)">Tingkat C (Eselon IV / Pelaksana)</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Estimasi Biaya */}
                    <Card className="border-emerald-500/30">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <Coins className="size-5" />
                                    <CardTitle className="text-base">4. Rincian Estimasi Biaya</CardTitle>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-muted-foreground mr-2">Total Estimasi:</span>
                                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatRupiah(grandTotal)}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="uang_harian">Uang Harian (Rp / Hari) *</Label>
                                    <Input
                                        id="uang_harian"
                                        type="number"
                                        value={data.uang_harian_per_hari}
                                        onChange={(e) => setData('uang_harian_per_hari', Number(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Subtotal: {lamaHari} hari = <strong className="text-foreground">{formatRupiah(totalUangHarian)}</strong>
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="transportasi">Biaya Transportasi (Tiket PP / Tol) *</Label>
                                    <Input
                                        id="transportasi"
                                        type="number"
                                        value={data.biaya_transportasi}
                                        onChange={(e) => setData('biaya_transportasi', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="hotel_malam">Penginapan (Malam) *</Label>
                                    <Input
                                        id="hotel_malam"
                                        type="number"
                                        value={data.biaya_penginapan_malam}
                                        onChange={(e) => setData('biaya_penginapan_malam', Number(e.target.value))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="hotel_tarif">Tarif Penginapan (Rp / Malam) *</Label>
                                    <Input
                                        id="hotel_tarif"
                                        type="number"
                                        value={data.biaya_penginapan_per_malam}
                                        onChange={(e) => setData('biaya_penginapan_per_malam', Number(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Subtotal: <strong className="text-foreground">{formatRupiah(totalHotel)}</strong>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="biaya_lainnya">Biaya Lainnya</Label>
                                    <Input
                                        id="biaya_lainnya"
                                        type="number"
                                        value={data.biaya_lainnya}
                                        onChange={(e) => setData('biaya_lainnya', Number(e.target.value))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="ket_lainnya">Keterangan Biaya Lainnya</Label>
                                    <Input
                                        id="ket_lainnya"
                                        value={data.keterangan_biaya_lainnya}
                                        onChange={(e) => setData('keterangan_biaya_lainnya', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button variant="outline" asChild>
                            <Link href={`/sppd/${sppd.id}`}>Batal</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 font-semibold"
                        >
                            <Save className="mr-2 size-4" />
                            {processing ? 'Menyimpan...' : 'Perbarui Pengajuan SPPD'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
