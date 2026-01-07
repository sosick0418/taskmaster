import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? "",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    // Development only: Credentials provider for testing
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            name: "Test Account",
            credentials: {
              email: { label: "Email", type: "email", placeholder: "test@example.com" },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null

              const email = credentials.email as string

              // Find or create test user
              let user = await prisma.user.findUnique({
                where: { email },
              })

              if (!user) {
                user = await prisma.user.create({
                  data: {
                    email,
                    name: email.split("@")[0] ?? email,
                  },
                })
              }

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
              }
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
