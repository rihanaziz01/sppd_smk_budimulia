import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Bell,
    Check,
    CheckCheck,
    CheckCircle2,
    Clock,
    FileCheck,
    FileText,
    Inbox,
    Printer,
    XCircle,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NotificationItem {
    id: string;
    type: string;
    data: {
        sppd_id?: number;
        nomor_sp?: string;
        judul?: string;
        pesan?: string;
        status?: string;
        catatan?: string;
        action_url?: string;
    };
    read_at: string | null;
    created_at: string;
}

interface PageProps {
    notifications: {
        data: NotificationItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    unreadCount: number;
    filter: string;
    flash?: {
        success?: string;
        error?: string;
    };
}

function getNotificationIcon(status?: string) {
    switch (status) {
        case 'disetujui':
            return <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        case 'ditolak':
            return <XCircle className="size-5 text-red-600 dark:text-red-400 shrink-0" />;
        case 'revisi':
            return <AlertCircle className="size-5 text-orange-600 dark:text-orange-400 shrink-0" />;
        case 'selesai':
            return <FileCheck className="size-5 text-neutral-900 dark:text-neutral-100 shrink-0" />;
        default:
            return <Bell className="size-5 text-orange-600 shrink-0" />;
    }
}

export default function NotifikasiIndex({ notifications, unreadCount, filter }: PageProps) {
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };

    const markAsRead = (id: string) => {
        router.post(`/notifikasi/${id}/read`, {}, { preserveScroll: true });
    };

    const markAllAsRead = () => {
        router.post('/notifikasi/read-all', {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Pusat Notifikasi - e-SPPD SMK Budi Mulia" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xs">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border">
                                <Bell className="size-3.5 text-orange-600" />
                                <span>Pusat Pemberitahuan Sistem</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Notifikasi Pengajuan SPPD
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Informasi berkala status persetujuan Kepala Sekolah, penerbitan dokumen resmi, dan catatan revisi tugas dinas.
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <Button
                                onClick={markAllAsRead}
                                variant="outline"
                                className="text-xs font-medium gap-1.5 shrink-0"
                            >
                                <CheckCheck className="size-4" />
                                <span>Tandai Semua Dibaca</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        asChild
                        className={filter === 'all' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs h-8' : 'text-xs h-8'}
                    >
                        <Link href="/notifikasi?filter=all">
                            Semua ({notifications.total})
                        </Link>
                    </Button>
                    <Button
                        variant={filter === 'unread' ? 'default' : 'outline'}
                        asChild
                        className={filter === 'unread' ? 'bg-orange-600 text-white text-xs h-8' : 'text-xs h-8'}
                    >
                        <Link href="/notifikasi?filter=unread">
                            Belum Dibaca ({unreadCount})
                        </Link>
                    </Button>
                </div>

                {/* Notification List */}
                <div className="space-y-3">
                    {notifications.data.length === 0 ? (
                        <Card className="border-dashed py-12 text-center">
                            <CardContent className="space-y-3">
                                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    <Inbox className="size-6" />
                                </div>
                                <h3 className="text-base font-semibold text-foreground">
                                    Tidak Ada Notifikasi
                                </h3>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    {filter === 'unread'
                                        ? 'Semua notifikasi telah Anda baca.'
                                        : 'Belum ada notifikasi baru dari sistem SPPD.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        notifications.data.map((item) => {
                            const isUnread = !item.read_at;
                            const notifData = item.data;

                            return (
                                <div
                                    key={item.id}
                                    className={`relative flex items-start gap-4 rounded-xl border p-4 transition-all ${
                                        isUnread
                                            ? 'border-orange-500/40 bg-orange-500/5 dark:bg-orange-950/10 shadow-xs'
                                            : 'border-border bg-card'
                                    }`}
                                >
                                    <div className="mt-0.5">
                                        {getNotificationIcon(notifData.status)}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-foreground">
                                                    {notifData.judul || 'Pemberitahuan SPPD'}
                                                </h3>
                                                {isUnread && (
                                                    <span className="inline-flex size-2 rounded-full bg-orange-600" />
                                                )}
                                            </div>
                                            <span className="text-[11px] text-muted-foreground">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {notifData.pesan}
                                        </p>

                                        {notifData.catatan && (
                                            <div className="mt-2 rounded-md bg-muted/60 p-2.5 text-xs text-foreground border border-border/80">
                                                <span className="font-semibold">Catatan Kepala Sekolah:</span> {notifData.catatan}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 pt-2">
                                            {notifData.action_url && (
                                                <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs h-7">
                                                    <Link href={notifData.action_url}>
                                                        Buka Detail Pengajuan
                                                    </Link>
                                                </Button>
                                            )}

                                            {isUnread && (
                                                <button
                                                    type="button"
                                                    onClick={() => markAsRead(item.id)}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
                                                >
                                                    <Check className="size-3.5" />
                                                    <span>Tandai Sudah Dibaca</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}
