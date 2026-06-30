import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
     async authorize(credentials) {
  try {
    console.log("LOGIN START")

    const user = await prisma.user.findUnique({
      where: {
        email: credentials?.email as string,
      },
    })

    console.log(user)

    if (!user) return null

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    }

  } catch (e) {
    console.error("AUTHORIZE ERROR:", e)
    throw e
  }
}
    }),
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) { token.id = user.id; token.role = user.role }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) { session.user.id = token.id; session.user.role = token.role }
      return session
    },
  },
  pages: { signIn: '/login', error: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
}

export async function auth() {
  const { getServerSession } = await import('next-auth')
  return getServerSession(authOptions)
}
