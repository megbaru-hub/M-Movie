import { prisma } from '@/lib/prisma'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import AdminContentList from '@/components/admin/AdminContentList'

export const dynamic = 'force-dynamic'

export default async function AdminContent() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('nexus_admin_session')?.value
    const [role, sessionUserId] = sessionToken?.includes(':') ? sessionToken.split(':') : [null, null]

    // Fetch movies based on role permissions
    // Super Admins see all, Content Admins see only their own uploads + legacy global content
    const movies = await prisma.movie.findMany({
        where: role?.toUpperCase() === 'SUPER_ADMIN'
            ? {}
            : {
                OR: [
                    { uploaderId: sessionUserId },
                    { uploaderId: null } // Show legacy/global content to all admins
                ]
            },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">Vault Inventory</h1>
                    <p className="text-zinc-500 font-medium">
                        {role === 'SUPER_ADMIN'
                            ? "Global Command: Full access to the entire content library."
                            : "Archiver Node: Manage your contributed content collection."}
                    </p>
                </div>
                <Link href="/admin/content/new" className="btn-premium flex items-center gap-3">
                    <Plus className="h-5 w-5" />
                    Deploy New Content
                </Link>
            </div>

            {/* Client-side content list with search, filter, and management actions */}
            <AdminContentList initialMovies={movies as any} role={role as any} userId={sessionUserId as any} />
        </div>
    )
}
