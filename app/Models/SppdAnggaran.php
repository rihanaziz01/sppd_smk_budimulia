<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SppdAnggaran extends Model
{
    use HasFactory;

    protected $fillable = [
        'tahun_anggaran',
        'nama_anggaran',
        'kode_rekening',
        'total_anggaran',
        'periode',
        'keterangan',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'tahun_anggaran' => 'integer',
            'total_anggaran' => 'float',
        ];
    }

    public function biayas(): HasMany
    {
        return $this->hasMany(SppdBiaya::class, 'anggaran_id');
    }

    /**
     * Total biaya yang sudah terpakai/dicairkan pada pos anggaran ini.
     */
    public function getTerpakaiAttribute(): float
    {
        return (float) $this->biayas()
            ->whereIn('status_pembayaran', ['sudah_dibayar', 'lunas', 'diproses', 'menunggu_pencairan'])
            ->sum('total_biaya');
    }

    /**
     * Sisa anggaran tersedia.
     */
    public function getSisaAnggaranAttribute(): float
    {
        return max(0, (float) $this->total_anggaran - $this->terpakai);
    }

    /**
     * Persentase serapan anggaran.
     */
    public function getPersentaseSerapanAttribute(): float
    {
        if ($this->total_anggaran <= 0) {
            return 0;
        }

        return round(($this->terpakai / $this->total_anggaran) * 100, 1);
    }
}
