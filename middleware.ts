import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Protected routes
  const protectedRoutes = ["/tasks", "/settings"]
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  // Auth routes (login page)
  const authRoutes = ["/login"]
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect to login if not logged in and trying to access protected route
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Redirect to tasks if logged in and trying to access auth route
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/tasks", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
