import { prisma } from '@/lib/prisma'
import { Shield, ShieldAlert, ShieldCheck, UserCog } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SecurityPage() {
    const admins = await prisma.user.findMany({
        where: {
            role: {
                in: ['SUPER_ADMIN', 'CONTENT_ADMIN']
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-12">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Security Detail</h1>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Authorized Personnel Registry</p>
                </div>
            </div>

            <div className="rounded-[2.5rem] bg-zinc-900/30 border border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Active Officers</h3>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        {admins.length} Personnel
                    </div>
                </div>
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-8 py-4 text-left text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Identity</th>
                            <th className="px-8 py-4 text-left text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Clearance Level</th>
                            <th className="px-8 py-4 text-left text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Enlisted</th>
                            <th className="px-8 py-4 text-right text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {admins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center">
                                            <UserCog className="h-4 w-4 text-zinc-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-wider">{admin.username || 'Redacted'}</p>
                                            <p className="text-[10px] font-medium text-zinc-600">{admin.name || 'Unknown Agent'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${admin.role === 'SUPER_ADMIN'
                                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                        }`}>
                                        {admin.role === 'SUPER_ADMIN' ? <ShieldAlert className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                        <span className="text-[9px] font-black uppercase tracking-widest">{admin.role.replace('_', ' ')}</span>
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        {new Date(admin.createdAt).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
