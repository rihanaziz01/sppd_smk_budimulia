import { usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    CheckCircle2,
    CheckSquare,
    ClipboardList,
    Clock,
    CreditCard,
    FilePlus,
    FileText,
    History,
    Landmark,
    LayoutGrid,
    Printer,
    Settings,
    UserCheck,
    Users,
    WalletCards,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/resources/js/types';

export function AppSidebar() {
    const { auth, badges } = usePage().props as {
        auth?: {
            user?: {
                id: number;
                name: string;
                role?: string;
            };
        };
        badges?: {
            pending_approvals?: number;
            pending_finance?: number;
            pending_verification?: number;
            unread_notifications?: number;
        };
    };

    const isGuru = auth?.user?.role === 'pegawai' || auth?.user?.role === 'guru';

    // Menu Guru sesuai spesifikasi sistem SPPD SMK Budi Mulia
    const guruNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Profil Saya',
            href: '/guru/profil',
            icon: UserCheck,
        },
        {
            title: 'Pengajuan SPPD',
            href: '/sppd/create',
            icon: FilePlus,
        },
        {
            title: 'Riwayat Pengajuan',
            href: '/sppd',
            icon: Clock,
        },
        {
            title: 'Dokumen Perjalanan',
            href: '/dokumen',
            icon: Printer,
        },
        {
            title: 'Laporan Perjalanan',
            href: '/laporan-perjalanan',
            icon: ClipboardList,
        },
        {
            title: 'Notifikasi',
            href: '/notifikasi',
            icon: Bell,
            badge: badges?.unread_notifications ? badges.unread_notifications : null,
        },
        {
            title: 'Pengaturan',
            href: '/settings/profile',
            icon: Settings,
        },
    ];

    // Menu Manajemen (Admin, Kepala Sekolah, Bendahara)
    const adminNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Data Guru',
            href: '/pegawai',
            icon: Users,
        },
        {
            title: 'Pengajuan SPPD Guru',
            href: '/sppd',
            icon: FileText,
        },
        {
            title: 'Persetujuan (Kepsek)',
            href: '/persetujuan',
            icon: CheckCircle2,
            badge: badges?.pending_approvals ? badges.pending_approvals : null,
        },
        {
            title: 'Surat Tugas & SPPD',
            href: '/dokumen',
            icon: Printer,
        },
        {
            title: 'Biaya Perjalanan Dinas',
            href: '/keuangan',
            icon: WalletCards,
            badge: badges?.pending_finance ? badges.pending_finance : null,
        },
        {
            title: 'Laporan SPPD',
            href: '/laporan',
            icon: BarChart3,
        },
        {
            title: 'Notifikasi',
            href: '/notifikasi',
            icon: Bell,
            badge: badges?.unread_notifications ? badges.unread_notifications : null,
        },
        {
            title: 'Pengaturan',
            href: '/settings/profile',
            icon: Settings,
        },
    ];

    // Menu Khusus Bendahara Sekolah
    const isBendahara = auth?.user?.role === 'bendahara';
    const bendaharaNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Verifikasi Biaya',
            href: '/bendahara/verifikasi',
            icon: CheckSquare,
            badge: badges?.pending_verification ? badges.pending_verification : null,
        },
        {
            title: 'Anggaran Perjalanan',
            href: '/bendahara/anggaran',
            icon: Landmark,
        },
        {
            title: 'Pembayaran',
            href: '/bendahara/pembayaran',
            icon: CreditCard,
            badge: badges?.pending_finance ? badges.pending_finance : null,
        },
        {
            title: 'Laporan Keuangan',
            href: '/keuangan',
            icon: BarChart3,
        },
        {
            title: 'Riwayat Pembayaran',
            href: '/bendahara/riwayat-pembayaran',
            icon: History,
        },
        {
            title: 'Data Biaya',
            href: '/bendahara/data-biaya',
            icon: WalletCards,
        },
        {
            title: 'Profil Saya',
            href: '/settings/profile',
            icon: UserCheck,
        },
    ];

    const mainNavItems = isGuru ? guruNavItems : isBendahara ? bendaharaNavItems : adminNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/dashboard">
                                <AppLogo />
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
