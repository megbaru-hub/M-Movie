import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'

export default async function ProfileRedirectPage() {
    const session = await getServerSession(authOptions)

    console.log('[ProfileRedirectPage] Session:', JSON.stringify(session, null, 2))

    if (!session || !(session.user as any).id) {
        console.log('[ProfileRedirectPage] No session or ID, redirecting to /signin')
        redirect('/signin')
    } else {
        const id = (session.user as any).id
        console.log('[ProfileRedirectPage] Redirecting to profile:', id)
        redirect(`/profile/${id}`)
    }
}
