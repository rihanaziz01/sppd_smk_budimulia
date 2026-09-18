<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display a listing of user notifications.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filter = $request->input('filter', 'all');

        $query = $user->notifications();

        if ($filter === 'unread') {
            $query = $user->unreadNotifications();
        }

        $notifications = $query->paginate(15)->withQueryString();
        $unreadCount = $user->unreadNotifications()->count();

        return Inertia::render('notifikasi/index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'filter' => $filter,
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
        }

        return redirect()->back()->with('success', 'Notifikasi ditandai telah dibaca.');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return redirect()->back()->with('success', 'Semua notifikasi ditandai telah dibaca.');
    }
}
