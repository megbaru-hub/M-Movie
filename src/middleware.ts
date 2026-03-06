import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware runs on every request to /admin/:path*
// It verifies the HTTP-only session cookie which contains the role and user ID.
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const adminToken = request.cookies.get('nexus_admin_session')

    // 1. Initial Presence Check
    if (!adminToken) {
        // If the cookie is missing, simulate a 404 to hide the portal's existence.
        return NextResponse.rewrite(new URL('/404', request.url))
    }

    // 2. Format Validation (role:id)
    const sessionValue = adminToken.value
    if (!sessionValue.includes(':')) {
        return NextResponse.rewrite(new URL('/404', request.url))
    }

    const [role] = sessionValue.split(':')

    // 3. Basic Role-Based Path Protection
    // Super Admins can access everything in /admin
    if (role === 'SUPER_ADMIN') {
        return NextResponse.next()
    }

    // Content Admins are restricted specifically to content paths
    if (role === 'CONTENT_ADMIN') {
        const allowedPaths = [
            '/admin',
            '/admin/content',
            '/admin/content/new'
        ]

        const isAllowed = allowedPaths.some(path => pathname === path)
        if (!isAllowed) {
            // If they try to access /admin/users or /admin/security, show 404
            return NextResponse.rewrite(new URL('/404', request.url))
        }
        return NextResponse.next()
    }

    // 4. Default Rejection for invalid roles
    return NextResponse.rewrite(new URL('/404', request.url))
}

export const config = {
    matcher: ['/admin/:path*'],
}
