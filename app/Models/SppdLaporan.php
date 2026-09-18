<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SppdLaporan extends Model
{
    protected $fillable = [
        'sppd_id',
        'ringkasan_kegiatan',
        'hasil_kegiatan',
        'kendala',
        'saran_tindak_lanjut',
        'tanggal_laporan',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_laporan' => 'date',
        ];
    }

    public function sppd()
    {
        return $this->belongsTo(Sppd::class, 'sppd_id');
    }
}
