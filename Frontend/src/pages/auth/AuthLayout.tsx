
import type { ReactNode } from 'react';
import { Building2 } from 'lucide-react';

interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    reverse?: boolean;
}

export function AuthLayout({
    children,
    title,
    subtitle,
    reverse = false,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
            <div
                className={`grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2 md: min-h-[640px] ${reverse ? 'md:[&>*:first-child]:order-2' : ''
                    }`}
            >
                <div className="relative flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-900 p-8 text-white sm:p-12">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                            <Building2 size={28} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Hostel OS
                            </h1>
                            <p className="text-sm text-indigo-200">
                                Hostel Management System
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-10">
                        <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                            Manage your hostel.
                            <br />
                            Simplify your life.
                        </h2>

                        <p className="mt-4 max-w-sm text-sm leading-6 text-indigo-100 sm:text-base">
                            A smarter way to manage residents, rooms, operations,
                            and everyday hostel activities — all in one place.
                        </p>
                    </div>

                    <p className="mt-10 text-xs text-indigo-200">
                        © {new Date().getFullYear()} Hostel OS. All rights reserved.
                    </p>

                    <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
                </div>


                <div className="flex h-full items-center justify-center p-6 sm:p-10 md:p-12">
                    <div className="w-full max-w-md">
                        {(title || subtitle) && (
                            <div className="mb-8">
                                {title && (
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                        {title}
                                    </h2>
                                )}

                                {subtitle && (
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        )}

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
