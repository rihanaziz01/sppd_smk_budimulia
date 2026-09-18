import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Coins,
    Edit,
    FileText,
    MapPin,
    PlusCircle,
    SlidersHorizontal,
    Trash2,
    WalletCards,
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

interface StandarBiayaItem {
    id: number;
    kategori: 'Uang Harian' | 'Transportasi' | 'Penginapan' | 'Biaya Lainnya';
    tingkat_golongan: string;
    wilayah: string;
    nominal_standar: number;
    satuan: string;
    keterangan?: string;
    status_aktif: boolean;
}

interface SppdBiayaRow {
    id: number;
    sppd_id: number;
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
    catatan_bendahara?: string;
    sppd?: {
        id: number;
        nomor_sppd: string;
        tempat_tujuan: string;
        pegawai?: {
            nama: string;
            golongan: string;
        };
    };
}

interface DataBiayaProps {
    standar_biayas: StandarBiayaItem[];
    sppd_biayas: SppdBiayaRow[];
    filters: {
        kategori: string;
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

export default function BendaharaDataBiayaIndex({
    standar_biayas,
    sppd_biayas,
    filters,
}: DataBiayaProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedStandar, setSelectedStandar] = useState<StandarBiayaItem | null>(null);
    const [selectedAdjustBiaya, setSelectedAdjustBiaya] = useState<SppdBiayaRow | null>(null);

    // Form Standar Biaya
    const standarForm = useForm({
        kategori: 'Uang Harian',
        tingkat_golongan: 'Semua Golongan',
        wilayah: 'Dalam Kota Karawang',
        nominal_standar: 150000,
        satuan: 'per hari',
        keterangan: '',
        status_aktif: true,
    });

    // Form Penyesuaian SPPD
    const adjustForm = useForm({
        uang_harian_per_hari: 0,
        biaya_transportasi: 0,
        biaya_penginapan_per_malam: 0,
        biaya_lainnya: 0,
        keterangan_biaya_lainnya: '',
        catatan_bendahara: '',
    });

    const openAddModal = () => {
        standarForm.reset();
        standarForm.setData({
            kategori: 'Uang Harian',
            tingkat_golongan: 'Semua Golongan',
            wilayah: 'Dalam Kota Karawang',
            nominal_standar: 150000,
            satuan: 'per hari',
            keterangan: '',
            status_aktif: true,
        });
        setIsAddModalOpen(true);
    };

    const openEditStandarModal = (item: StandarBiayaItem) => {
        setSelectedStandar(item);
        standarForm.setData({
            kategori: item.kategori,
            tingkat_golongan: item.tingkat_golongan,
            wilayah: item.wilayah,
            nominal_standar: item.nominal_standar,
            satuan: item.satuan,
            keterangan: item.keterangan || '',
            status_aktif: item.status_aktif,
        });
    };

    const openAdjustModal = (biaya: SppdBiayaRow) => {
        setSelectedAdjustBiaya(biaya);
        adjustForm.setData({
            uang_harian_per_hari: biaya.uang_harian_per_hari,
            biaya_transportasi: biaya.biaya_transportasi,
            biaya_penginapan_per_malam: biaya.biaya_penginapan_per_malam,
            biaya_lainnya: biaya.biaya_lainnya,
            keterangan_biaya_lainnya: biaya.keterangan_biaya_lainnya || '',
            catatan_bendahara: biaya.catatan_bendahara || '',
        });
    };

    const handleSubmitStandarAdd = (e: React.FormEvent) => {
        e.preventDefault();
        standarForm.post('/bendahara/data-biaya', {
            onSuccess: () => setIsAddModalOpen(false),
        });
    };

    const handleSubmitStandarEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStandar) return;

        standarForm.put(`/bendahara/data-biaya/${selectedStandar.id}`, {
            onSuccess: () => setSelectedStandar(null),
        });
    };

    const handleDeleteStandar = (item: StandarBiayaItem) => {
        if (confirm(`Hapus standar biaya "${item.kategori} - ${item.wilayah}"?`)) {
            router.delete(`/bendahara/data-biaya/${item.id}`);
        }
    };

    const handleSubmitAdjust = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdjustBiaya) return;

        adjustForm.put(`/bendahara/data-biaya/adjust/${selectedAdjustBiaya.id}`, {
            onSuccess: () => setSelectedAdjustBiaya(null),
        });
    };

    return (
        <>
            <Head title="Data Biaya Perjalanan Dinas - Bendahara" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header Card */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2.5">
                            <WalletCards className="size-7 text-orange-600" />
                            Data Biaya Perjalanan Dinas
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola komponen tarif standar biaya masukan kebijakan sekolah dan penyesuaian biaya penugasan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            onClick={openAddModal}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-xs"
                        >
                            <PlusCircle className="mr-1.5 size-4" />
                            Tambah Standar Tarif
                        </Button>
                    </div>
                </div>

                {/* Section 1: Standar Biaya Masukan (SBM) Kebijakan Sekolah */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Coins className="size-4 text-orange-600" />
                                    Standar Tarif Biaya Kebijakan SMK Budi Mulia
                                </CardTitle>
                                <CardDescription>
                                    Pedoman pagu standar uang harian, tiket transportasi, penginapan, dan kontribusi diklat
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-xs uppercase text-muted-foreground">
                                        <th className="pb-3 pl-1">Komponen Biaya</th>
                                        <th className="pb-3">Wilayah Penugasan</th>
                                        <th className="pb-3">Golongan / Jabatan</th>
                                        <th className="pb-3">Besaran Standar (Rp)</th>
                                        <th className="pb-3">Satuan</th>
                                        <th className="pb-3">Keterangan</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right pr-1">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {standar_biayas.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                                Belum ada standar tarif kebijakan sekolah yang dikonfigurasi.
                                            </td>
                                        </tr>
                                    ) : (
                                        standar_biayas.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-3 pl-1 font-semibold text-foreground">
                                                    {item.kategori}
                                                </td>
                                                <td className="py-3 text-xs text-foreground font-medium">
                                                    {item.wilayah}
                                                </td>
                                                <td className="py-3 text-xs text-muted-foreground">
                                                    {item.tingkat_golongan}
                                                </td>
                                                <td className="py-3 text-xs font-bold text-foreground">
                                                    {formatRupiah(item.nominal_standar)}
                                                </td>
                                                <td className="py-3 text-xs text-muted-foreground">
                                                    {item.satuan}
                                                </td>
                                                <td className="py-3 text-xs text-muted-foreground max-w-xs truncate">
                                                    {item.keterangan || '-'}
                                                </td>
                                                <td className="py-3">
                                                    {item.status_aktif ? (
                                                        <Badge className="bg-emerald-600 text-white border-emerald-600">
                                                            Aktif
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-muted-foreground">
                                                            Nonaktif
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 text-right pr-1">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openEditStandarModal(item)}
                                                        >
                                                            <Edit className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDeleteStandar(item)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

                {/* Section 2: Penyesuaian Komponen Biaya SPPD Berjalan */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <SlidersHorizontal className="size-4 text-orange-600" />
                            Penyesuaian Biaya SPPD Berdasarkan Kebijakan Sekolah
                        </CardTitle>
                        <CardDescription>
                            Bendahara dapat menyesuaikan rincian komponen biaya perjalanan guru secara kasuistik
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-xs uppercase text-muted-foreground">
                                        <th className="pb-3 pl-1">Guru & SPPD</th>
                                        <th className="pb-3">Tujuan</th>
                                        <th className="pb-3">Uang Harian</th>
                                        <th className="pb-3">Transportasi</th>
                                        <th className="pb-3">Penginapan</th>
                                        <th className="pb-3">Biaya Lain</th>
                                        <th className="pb-3">Total Biaya</th>
                                        <th className="pb-3 text-right pr-1">Aksi Penyesuaian</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {sppd_biayas.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                                Belum ada SPPD disetujui yang dapat disesuaikan biayanya.
                                            </td>
                                        </tr>
                                    ) : (
                                        sppd_biayas.map((b) => (
                                            <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-3 pl-1">
                                                    <div className="font-semibold text-foreground">{b.sppd?.pegawai?.nama}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{b.sppd?.nomor_sppd}</div>
                                                </td>
                                                <td className="py-3 text-xs text-foreground">
                                                    {b.sppd?.tempat_tujuan}
                                                </td>
                                                <td className="py-3 text-xs">
                                                    {formatRupiah(b.uang_harian_total)}
                                                </td>
                                                <td className="py-3 text-xs">
                                                    {formatRupiah(b.biaya_transportasi)}
                                                </td>
                                                <td className="py-3 text-xs">
                                                    {formatRupiah(b.biaya_penginapan_total)}
                                                </td>
                                                <td className="py-3 text-xs">
                                                    {formatRupiah(b.biaya_lainnya)}
                                                </td>
                                                <td className="py-3 text-xs font-bold text-orange-600">
                                                    {formatRupiah(b.total_biaya)}
                                                </td>
                                                <td className="py-3 text-right pr-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openAdjustModal(b)}
                                                        className="font-medium"
                                                    >
                                                        <SlidersHorizontal className="size-3.5 mr-1 text-orange-600" />
                                                        Sesuaikan
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

                {/* Modal Tambah / Edit Standar Biaya */}
                {(isAddModalOpen || selectedStandar) && (
                    <Dialog
                        open={isAddModalOpen || !!selectedStandar}
                        onOpenChange={(open) => {
                            if (!open) {
                                setIsAddModalOpen(false);
                                setSelectedStandar(null);
                            }
                        }}
                    >
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                    <Coins className="size-5 text-orange-600" />
                                    {selectedStandar ? 'Edit Standar Tarif Kebijakan' : 'Tambah Standar Tarif Baru'}
                                </DialogTitle>
                                <DialogDescription>
                                    Konfigurasi plafon biaya penugasan kedinasan guru SMK Budi Mulia
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={selectedStandar ? handleSubmitStandarEdit : handleSubmitStandarAdd} className="space-y-4 py-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="sbm_kategori">Komponen Biaya *</Label>
                                        <select
                                            id="sbm_kategori"
                                            value={standarForm.data.kategori}
                                            onChange={(e) => standarForm.setData('kategori', e.target.value as any)}
                                            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-medium"
                                        >
                                            <option value="Uang Harian">Uang Harian</option>
                                            <option value="Transportasi">Biaya Transportasi</option>
                                            <option value="Penginapan">Biaya Penginapan</option>
                                            <option value="Biaya Lainnya">Biaya Lainnya</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="sbm_gol">Tingkat Golongan / Jabatan</Label>
                                        <Input
                                            id="sbm_gol"
                                            value={standarForm.data.tingkat_golongan}
                                            onChange={(e) => standarForm.setData('tingkat_golongan', e.target.value)}
                                            placeholder="Semua Golongan / Guru"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="sbm_wilayah">Wilayah Penugasan *</Label>
                                        <Input
                                            id="sbm_wilayah"
                                            required
                                            value={standarForm.data.wilayah}
                                            onChange={(e) => standarForm.setData('wilayah', e.target.value)}
                                            placeholder="Luar Kota (Jawa Barat)"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="sbm_satuan">Satuan Hitung *</Label>
                                        <Input
                                            id="sbm_satuan"
                                            required
                                            value={standarForm.data.satuan}
                                            onChange={(e) => standarForm.setData('satuan', e.target.value)}
                                            placeholder="per hari / per malam"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="sbm_nominal">Besaran Standar Plafon (Rp) *</Label>
                                    <Input
                                        id="sbm_nominal"
                                        type="number"
                                        required
                                        min="0"
                                        value={standarForm.data.nominal_standar}
                                        onChange={(e) => standarForm.setData('nominal_standar', Number(e.target.value))}
                                        className="mt-1 font-bold text-base"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="sbm_ket">Keterangan Tambahan</Label>
                                    <textarea
                                        id="sbm_ket"
                                        rows={2}
                                        value={standarForm.data.keterangan}
                                        onChange={(e) => standarForm.setData('keterangan', e.target.value)}
                                        placeholder="Uang saku perjalanan dinas diklat guru..."
                                        className="mt-1 w-full rounded-md border border-input bg-background p-2.5 text-sm"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="sbm_status">Status Tarif</Label>
                                    <select
                                        id="sbm_status"
                                        value={standarForm.data.status_aktif ? '1' : '0'}
                                        onChange={(e) => standarForm.setData('status_aktif', e.target.value === '1')}
                                        className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-medium"
                                    >
                                        <option value="1">Aktif (Diberlakukan)</option>
                                        <option value="0">Nonaktif</option>
                                    </select>
                                </div>

                                <DialogFooter className="pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddModalOpen(false);
                                            setSelectedStandar(null);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={standarForm.processing}
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                                    >
                                        {standarForm.processing ? 'Menyimpan...' : 'Simpan Standar'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Modal Penyesuaian Biaya SPPD */}
                {selectedAdjustBiaya && (
                    <Dialog open={!!selectedAdjustBiaya} onOpenChange={(open) => !open && setSelectedAdjustBiaya(null)}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                    <SlidersHorizontal className="size-5 text-orange-600" />
                                    Penyesuaian Biaya SPPD
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedAdjustBiaya.sppd?.pegawai?.nama} • {selectedAdjustBiaya.sppd?.nomor_sppd}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmitAdjust} className="space-y-4 py-2">
                                <div>
                                    <Label htmlFor="adj_uh">Uang Harian / Hari (Rp) *</Label>
                                    <Input
                                        id="adj_uh"
                                        type="number"
                                        required
                                        min="0"
                                        value={adjustForm.data.uang_harian_per_hari}
                                        onChange={(e) => adjustForm.setData('uang_harian_per_hari', Number(e.target.value))}
                                        className="mt-1 font-semibold"
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Durasi: {selectedAdjustBiaya.uang_harian_hari} Hari (Total: {formatRupiah(selectedAdjustBiaya.uang_harian_hari * adjustForm.data.uang_harian_per_hari)})
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="adj_trans">Biaya Transportasi (Rp) *</Label>
                                    <Input
                                        id="adj_trans"
                                        type="number"
                                        required
                                        min="0"
                                        value={adjustForm.data.biaya_transportasi}
                                        onChange={(e) => adjustForm.setData('biaya_transportasi', Number(e.target.value))}
                                        className="mt-1 font-semibold"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="adj_hotel">Biaya Penginapan / Malam (Rp) *</Label>
                                    <Input
                                        id="adj_hotel"
                                        type="number"
                                        required
                                        min="0"
                                        value={adjustForm.data.biaya_penginapan_per_malam}
                                        onChange={(e) => adjustForm.setData('biaya_penginapan_per_malam', Number(e.target.value))}
                                        className="mt-1 font-semibold"
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Lama Menginap: {selectedAdjustBiaya.biaya_penginapan_malam} Malam (Total: {formatRupiah(selectedAdjustBiaya.biaya_penginapan_malam * adjustForm.data.biaya_penginapan_per_malam)})
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="adj_lain">Biaya Lainnya (Rp)</Label>
                                    <Input
                                        id="adj_lain"
                                        type="number"
                                        min="0"
                                        value={adjustForm.data.biaya_lainnya}
                                        onChange={(e) => adjustForm.setData('biaya_lainnya', Number(e.target.value))}
                                        className="mt-1 font-semibold"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="adj_notes">Catatan Kebijakan Penyesuaian</Label>
                                    <textarea
                                        id="adj_notes"
                                        rows={2}
                                        value={adjustForm.data.catatan_bendahara}
                                        onChange={(e) => adjustForm.setData('catatan_bendahara', e.target.value)}
                                        placeholder="Dasar penyesuaian nominal sesuai ketentuan yayasan/sekolah..."
                                        className="mt-1 w-full rounded-md border border-input bg-background p-2.5 text-sm"
                                    />
                                </div>

                                <DialogFooter className="pt-2">
                                    <Button type="button" variant="outline" onClick={() => setSelectedAdjustBiaya(null)}>
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={adjustForm.processing}
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                                    >
                                        {adjustForm.processing ? 'Menyimpan...' : 'Terapkan Penyesuaian'}
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
