<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StandarBiaya extends Model
{
    use HasFactory;

    protected $fillable = [
        'kategori',
        'tingkat_golongan',
        'wilayah',
        'nominal_standar',
        'satuan',
        'keterangan',
        'status_aktif',
    ];

    protected function casts(): array
    {
        return [
            'nominal_standar' => 'float',
            'status_aktif' => 'boolean',
        ];
    }
}
