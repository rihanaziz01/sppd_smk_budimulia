import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    className,
    alt = 'Logo SMK Budi Mulia Karawang',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/logo-smk-budi-mulia.png"
            alt={alt}
            className={`object-contain ${className || ''}`}
            {...props}
        />
    );
}
