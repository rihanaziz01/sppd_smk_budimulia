<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SppdStatusUpdatedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public int $sppdId,
        public string $nomorSp,
        public string $judul,
        public string $pesan,
        public string $status,
        public ?string $catatan = null,
        public ?string $actionUrl = null,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'sppd_id' => $this->sppdId,
            'nomor_sp' => $this->nomorSp,
            'judul' => $this->judul,
            'pesan' => $this->pesan,
            'status' => $this->status,
            'catatan' => $this->catatan,
            'action_url' => $this->actionUrl ?? "/sppd/{$this->sppdId}",
        ];
    }
}
