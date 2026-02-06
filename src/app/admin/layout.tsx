import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { cn } from '@/lib/utils'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('nexus_admin_session')?.value

    if (!sessionToken) {
        redirect('/404')
    }

    const [role, userId] = sessionToken.includes(':') ? sessionToken.split(':') : ['SUPER_ADMIN', sessionToken]

    const isValidRole = role === 'SUPER_ADMIN' || role === 'CONTENT_ADMIN'

    if (!isValidRole) {
        redirect('/404')
    }

    return (
        <div className="flex min-h-screen bg-zinc-950 text-white overflow-hidden">
            <AdminSidebar role={role as 'SUPER_ADMIN' | 'CONTENT_ADMIN'} />
            <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
                {/* Top Bar */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-zinc-950/50 backdrop-blur-xl shrink-0">
                    <div className="flex flex-col">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Status: Operational</p>
                        <p className="text-zinc-500 font-bold text-xs">Vortex Engine v1.2.0 (Stable)</p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col text-right">
                            <p className="text-sm font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Megbaru</p>
                            <p className={cn(
                                "text-[9px] font-black uppercase tracking-widest",
                                role === 'SUPER_ADMIN' ? "text-emerald-500" : "text-amber-500"
                            )}>
                                {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Content Archiver'}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-rose-600 p-[1px] shadow-lg shadow-primary/20">
                            <div className="h-full w-full rounded-xl bg-zinc-950 flex items-center justify-center font-black text-xs">M</div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto no-scrollbar bg-gradient-to-br from-zinc-950 to-zinc-900/40">
                    <div className="p-12">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
