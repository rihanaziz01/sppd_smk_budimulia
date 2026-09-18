import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-white p-0.5 shadow-xs border border-border shrink-0">
                <img
                    src="/images/logo-smk-budi-mulia.png"
                    alt="Logo SMK Budi Mulia Karawang"
                    className="size-full object-contain"
                />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-tight text-foreground">
                    e-SPPD Guru
                </span>
                <span className="truncate text-[10px] font-medium text-muted-foreground">
                    SMK Budi Mulia Karawang
                </span>
            </div>
        </>
    );
}
