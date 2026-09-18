import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    FileCheck,
    FileText,
    Lock,
    Mail,
    Plane,
    Shield,
    ShieldCheck,
    Sparkles,
    User,
    UserCheck,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword?: boolean;
};

export default function Login({ status, canResetPassword = true }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Masuk - e-SPPD Guru SMK Budi Mulia" />
            <PasskeyVerify />

            <div className="relative min-h-screen w-full lg:grid lg:grid-cols-12 bg-background">
                {/* LEFT HERO / BRANDING PANEL */}
                <div className="relative hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between overflow-hidden bg-neutral-950 p-10 xl:p-14 text-white border-r border-border/50">
                    {/* Subtle Grid Pattern */}
                    <div 
                        className="absolute inset-0 opacity-[0.03]" 
                        style={{ 
                            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                            backgroundSize: '40px 40px' 
                        }} 
                    />

                    {/* Top Header Logo */}
                    <div className="relative z-10 flex items-center gap-3.5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white p-1.5 shadow-xs border border-white/20 shrink-0">
                            <img
                                src="/images/logo-smk-budi-mulia.png"
                                alt="Logo SMK Budi Mulia Karawang"
                                className="size-full object-contain"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold tracking-tight text-white">e-SPPD Guru</span>
                                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-neutral-300 border border-white/20">
                                    SMK Budi Mulia Karawang
                                </span>
                            </div>
                            <p className="text-xs text-neutral-400">Yayasan Pendidikan Budi Mulia Karawang</p>
                        </div>
                    </div>

                    {/* Center Core Presentation */}
                    <div className="relative z-10 my-auto py-12 max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-neutral-200 mb-6 backdrop-blur-md">
                            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                            <span>Sistem Informasi SPPD Guru • SMK Budi Mulia Karawang</span>
                        </div>

                        <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            Pengelolaan Perjalanan Dinas Guru yang Tertib, Transparan & Akuntabel
                        </h1>

                        <p className="mt-4 text-sm xl:text-base text-neutral-400 leading-relaxed">
                            Aplikasi terpadu untuk pengajuan tugas guru, persetujuan Kepala Sekolah, penerbitan Surat Tugas (SPT), formulir SPPD 9 poin & visum, hingga verifikasi biaya riil oleh Bendahara Sekolah.
                        </p>

                        {/* Feature Badges List */}
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:bg-white/10">
                                <div className="mt-0.5 rounded-lg bg-white/10 p-2 text-white border border-white/15">
                                    <FileCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-semibold text-white">Surat Tugas & 9 Poin SPPD</h2>
                                    <p className="text-[11px] text-neutral-400 mt-0.5">Format standar A4 resmi Kop SMK Budi Mulia dengan lembar visum kehadiran.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:bg-white/10">
                                <div className="mt-0.5 rounded-lg bg-white/10 p-2 text-white border border-white/15">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-semibold text-white">Approval Kepala Sekolah</h2>
                                    <p className="text-[11px] text-neutral-400 mt-0.5">Verifikasi tugas kedinasan, persetujuan, permintaan revisi, atau penolakan.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:bg-white/10">
                                <div className="mt-0.5 rounded-lg bg-white/10 p-2 text-white border border-white/15">
                                    <Wallet className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-semibold text-white">Rincian Biaya Riil (BKK)</h2>
                                    <p className="text-[11px] text-neutral-400 mt-0.5">Uang harian guru, transportasi, penginapan, dan verifikasi Bendahara Sekolah.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:bg-white/10">
                                <div className="mt-0.5 rounded-lg bg-white/10 p-2 text-white border border-white/15">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-semibold text-white">Laporan Hasil Tugas</h2>
                                    <p className="text-[11px] text-neutral-400 mt-0.5">Pertanggungjawaban hasil kegiatan dan unggah bukti pelaksanaan tugas dinas.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Security Assurance */}
                    <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-neutral-400">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-neutral-300" />
                            <span>Portal Resmi Kepegawaian SMK Budi Mulia Karawang</span>
                        </div>
                        <span>&copy; {new Date().getFullYear()} SMK Budi Mulia</span>
                    </div>
                </div>

                {/* RIGHT LOGIN FORM PANEL */}
                <div className="flex col-span-12 lg:col-span-6 xl:col-span-5 flex-col justify-center px-6 py-10 sm:px-12 lg:px-10 xl:px-14">
                    <div className="mx-auto w-full max-w-md">
                        {/* Mobile Header Brand (Visible only on mobile/tablet) */}
                        <div className="flex lg:hidden items-center gap-3.5 mb-8">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1 shadow-md border border-orange-200 shrink-0">
                                <img
                                    src="/images/logo-smk-budi-mulia.png"
                                    alt="Logo SMK Budi Mulia Karawang"
                                    className="size-full object-contain"
                                />
                            </div>
                            <div>
                                <span className="text-lg font-bold tracking-tight text-foreground">e-SPPD Guru</span>
                                <p className="text-xs text-muted-foreground">SMK Budi Mulia Karawang</p>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1.5 text-left mb-6">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Masuk ke Portal SPPD Guru
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Masukkan username atau email dan kata sandi Anda untuk mengakses portal e-SPPD SMK Budi Mulia Karawang.
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                {status}
                            </div>
                        )}

                        {/* Petunjuk Akun Akses */}
                        <div className="mb-5 rounded-xl border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-2">
                            <div className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                                <ShieldCheck className="size-4 text-orange-600" />
                                <span>Akses Login Per Role:</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData((prev) => ({ ...prev, email: 'admin', password: 'admin123' }));
                                    }}
                                    className="text-left rounded-md bg-background border border-border/80 px-2.5 py-1.5 hover:border-orange-500 transition cursor-pointer"
                                >
                                    <div className="font-semibold text-foreground">Admin</div>
                                    <div className="text-muted-foreground">admin / admin123</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData((prev) => ({ ...prev, email: 'kepsek', password: 'kepsek123' }));
                                    }}
                                    className="text-left rounded-md bg-background border border-border/80 px-2.5 py-1.5 hover:border-orange-500 transition cursor-pointer"
                                >
                                    <div className="font-semibold text-foreground">Kepala Sekolah</div>
                                    <div className="text-muted-foreground">kepsek / kepsek123</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData((prev) => ({ ...prev, email: 'bendahara', password: 'bendahara123' }));
                                    }}
                                    className="text-left rounded-md bg-background border border-border/80 px-2.5 py-1.5 hover:border-orange-500 transition cursor-pointer"
                                >
                                    <div className="font-semibold text-foreground">Bendahara</div>
                                    <div className="text-muted-foreground">bendahara / bendahara123</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData((prev) => ({ ...prev, email: 'guru', password: 'guru123' }));
                                    }}
                                    className="text-left rounded-md bg-background border border-border/80 px-2.5 py-1.5 hover:border-orange-500 transition cursor-pointer"
                                >
                                    <div className="font-semibold text-foreground">Guru</div>
                                    <div className="text-muted-foreground">guru / guru123</div>
                                </button>
                            </div>
                        </div>

                        {/* LOGIN FORM */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Username or Email Address */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                                    Username atau Email Kedinasan
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="text"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="username"
                                        placeholder="Contoh: admin, guru, kepsek, atau bendahara"
                                        className="pl-9 text-sm h-10 rounded-lg"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href={request()}
                                            tabIndex={5}
                                            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition"
                                        >
                                            Lupa kata sandi?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi..."
                                        className="pl-9 pr-10 text-sm h-10 rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', Boolean(checked))}
                                        tabIndex={3}
                                    />
                                    <Label htmlFor="remember" className="text-xs font-normal text-muted-foreground cursor-pointer">
                                        Ingat saya di perangkat ini
                                    </Label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={processing}
                                tabIndex={4}
                                className="w-full h-11 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-xs transition-all gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Spinner />
                                        <span>Memproses Verifikasi...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Masuk ke Sistem e-SPPD</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            {/* Bottom Register Option */}
                            <div className="text-center pt-2">
                                <p className="text-xs text-muted-foreground">
                                    Belum memiliki akun pegawai?{' '}
                                    <Link
                                        href={register()}
                                        tabIndex={6}
                                        className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline underline-offset-4"
                                    >
                                        Registrasi Akun Baru
                                    </Link>
                                </p>
                            </div>
                        </form>

                        {/* Security Footer Notice */}
                        <div className="mt-8 border-t border-border/60 pt-4 text-center">
                            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Portal Resmi Dilindungi Enkripsi SSL Kedinasan</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
