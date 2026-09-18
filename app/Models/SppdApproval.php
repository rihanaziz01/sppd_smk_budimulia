<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SppdApproval extends Model
{
    protected $fillable = [
        'sppd_id',
        'user_id',
        'role',
        'action',
        'catatan',
    ];

    public function sppd()
    {
        return $this->belongsTo(Sppd::class, 'sppd_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
