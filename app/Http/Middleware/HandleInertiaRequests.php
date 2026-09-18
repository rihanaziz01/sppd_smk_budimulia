<?php

namespace App\Http\Middleware;

use App\Models\Sppd;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user) {
            $user->loadMissing('pegawai');
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'badges' => [
                'pending_approvals' => $user ? Sppd::where('status', 'diajukan')->count() : 0,
                'pending_finance' => $user ? Sppd::where('status', 'disetujui')
                    ->whereHas('biaya', function ($q) {
                        $q->where('status_pembayaran', '!=', 'lunas');
                    })->count() : 0,
                'pending_verification' => $user ? Sppd::whereIn('status', ['disetujui', 'selesai'])
                    ->whereHas('biaya', function ($q) {
                        $q->where('status_verifikasi', 'menunggu_verifikasi');
                    })->count() : 0,
                'unread_notifications' => $user ? $user->unreadNotifications()->count() : 0,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
