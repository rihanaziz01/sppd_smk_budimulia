<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sppd extends Model
{
    protected $fillable = [
        'nomor_sp',
        'nomor_sppd',
        'pegawai_id',
        'pejabat_pemberi_perintah_id',
        'created_by_user_id',
        'maksud_tujuan',
        'tempat_berangkat',
        'tempat_tujuan',
        'tingkat_biaya',
        'alat_angkut',
        'tanggal_berangkat',
        'tanggal_kembali',
        'lama_hari',
        'instansi_pembebanan',
        'mata_anggaran',
        'status',
        'catatan_revisi',
        'catatan_atasan',
        'keterangan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_berangkat' => 'date',
            'tanggal_kembali' => 'date',
            'lama_hari' => 'integer',
        ];
    }

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'pegawai_id');
    }

    public function pejabatPemberiPerintah()
    {
        return $this->belongsTo(Pegawai::class, 'pejabat_pemberi_perintah_id');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function pengikuts()
    {
        return $this->hasMany(SppdPengikut::class, 'sppd_id');
    }

    public function biaya()
    {
        return $this->hasOne(SppdBiaya::class, 'sppd_id');
    }

    public function approvals()
    {
        return $this->hasMany(SppdApproval::class, 'sppd_id')->latest();
    }

    public function dokumens()
    {
        return $this->hasMany(SppdDokumen::class, 'sppd_id');
    }

    public function laporan()
    {
        return $this->hasOne(SppdLaporan::class, 'sppd_id');
    }
}
