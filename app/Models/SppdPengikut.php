<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SppdPengikut extends Model
{
    protected $fillable = [
        'sppd_id',
        'pegawai_id',
        'keterangan',
    ];

    public function sppd()
    {
        return $this->belongsTo(Sppd::class, 'sppd_id');
    }

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'pegawai_id');
    }
}
