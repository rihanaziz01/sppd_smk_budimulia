<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pegawai extends Model
{
    protected $fillable = [
        'user_id',
        'nip',
        'nik',
        'nuptk',
        'nama',
        'jabatan',
        'mata_pelajaran',
        'unit_kerja',
        'golongan',
        'status_guru',
        'nomor_rekening',
        'nama_bank',
        'telepon',
        'email',
        'status_aktif',
        'is_pejabat_penandatangan',
    ];

    protected function casts(): array
    {
        return [
            'status_aktif' => 'boolean',
            'is_pejabat_penandatangan' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sppds()
    {
        return $this->hasMany(Sppd::class, 'pegawai_id');
    }

    public function penugasanSppds()
    {
        return $this->hasMany(Sppd::class, 'pejabat_pemberi_perintah_id');
    }

    public function sppdPengikuts()
    {
        return $this->hasMany(SppdPengikut::class, 'pegawai_id');
    }
}
