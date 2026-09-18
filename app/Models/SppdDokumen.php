<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SppdDokumen extends Model
{
    protected $fillable = [
        'sppd_id',
        'uploaded_by_user_id',
        'jenis_dokumen',
        'nama_dokumen',
        'file_path',
        'file_size',
        'catatan',
    ];

    public function sppd()
    {
        return $this->belongsTo(Sppd::class, 'sppd_id');
    }

    public function uploadedByUser()
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }
}
