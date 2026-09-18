<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string|null $username
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'username', 'email', 'password', 'role', 'nip', 'phone', 'pegawai_id'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the associated employee profile.
     *
     * @return BelongsTo<Pegawai, self>
     */
    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'pegawai_id');
    }

    /**
     * Role Constants
     */
    public const ROLE_ADMIN = 'admin';

    public const ROLE_KEPALA_SEKOLAH = 'kepala_sekolah';

    public const ROLE_ATASAN = 'atasan';

    public const ROLE_BENDAHARA = 'bendahara';

    public const ROLE_GURU = 'guru';

    public const ROLE_PEGAWAI = 'pegawai';

    /**
     * Check if user is an Administrator.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is Kepala Sekolah / Atasan (or Admin).
     */
    public function isKepalaSekolah(): bool
    {
        return in_array($this->role, ['kepala_sekolah', 'atasan', 'admin'], true);
    }

    /**
     * Alias for isKepalaSekolah for backward compatibility.
     */
    public function isAtasan(): bool
    {
        return $this->isKepalaSekolah();
    }

    /**
     * Check if user is Bendahara (or Admin).
     */
    public function isBendahara(): bool
    {
        return in_array($this->role, ['bendahara', 'admin'], true);
    }

    /**
     * Check if user is Guru / Pegawai.
     */
    public function isGuru(): bool
    {
        return in_array($this->role, ['guru', 'pegawai'], true);
    }

    /**
     * Alias for isGuru for backward compatibility.
     */
    public function isPegawai(): bool
    {
        return $this->isGuru();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
