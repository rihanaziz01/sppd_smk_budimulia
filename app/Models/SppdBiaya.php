<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SppdBiaya extends Model
{
    protected $fillable = [
        'sppd_id',
        'uang_harian_hari',
        'uang_harian_per_hari',
        'uang_harian_total',
        'biaya_transportasi',
        'biaya_penginapan_malam',
        'biaya_penginapan_per_malam',
        'biaya_penginapan_total',
        'biaya_lainnya',
        'keterangan_biaya_lainnya',
        'total_biaya',
        'status_pembayaran',
        'tanggal_bayar',
        'metode_pembayaran',
        'nomor_bukti_kas',
        'catatan_bendahara',
        'status_verifikasi',
        'catatan_verifikasi',
        'verified_by_user_id',
        'verified_at',
        'file_bukti_bayar',
        'anggaran_id',
    ];

    protected function casts(): array
    {
        return [
            'uang_harian_hari' => 'integer',
            'uang_harian_per_hari' => 'float',
            'uang_harian_total' => 'float',
            'biaya_transportasi' => 'float',
            'biaya_penginapan_malam' => 'integer',
            'biaya_penginapan_per_malam' => 'float',
            'biaya_penginapan_total' => 'float',
            'biaya_lainnya' => 'float',
            'total_biaya' => 'float',
            'tanggal_bayar' => 'date',
            'verified_at' => 'datetime',
        ];
    }

    public function sppd()
    {
        return $this->belongsTo(Sppd::class, 'sppd_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    public function anggaran()
    {
        return $this->belongsTo(SppdAnggaran::class, 'anggaran_id');
    }
}
