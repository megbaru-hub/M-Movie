import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import EditContentForm from '@/components/admin/EditContentForm'

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params
    const id = parseInt(idStr)

    if (isNaN(id)) return notFound()

    const movie = await prisma.movie.findUnique({
        where: { id }
    })

    if (!movie) return notFound()

    // Authorization check
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('nexus_admin_session')?.value
    const [role, userId] = sessionToken?.includes(':') ? sessionToken.split(':') : [null, null]

    if (role !== 'SUPER_ADMIN' && movie.uploaderId !== userId) {
        return redirect('/admin/content')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 mb-24">
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Modify Record</h1>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Updating Metadata for: {movie.title}</p>
            </div>

            <EditContentForm movie={movie as any} />
        </div>
    )
}
