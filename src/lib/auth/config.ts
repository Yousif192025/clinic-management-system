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
  console.log('===== LOGIN START =====')
  console.log('Credentials:', credentials)

  if (!credentials?.email || !credentials?.password) {
    console.log('Missing credentials')
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email as string },
  })

  console.log('User found:', !!user)

  if (!user) {
    console.log('User not found')
    return null
  }

  console.log('isActive:', user.isActive)
  console.log('Has password:', !!user.password)

  if (!user.password || !user.isActive) {
    console.log('Inactive user or missing password')
    return null
  }

  const isValid = await bcrypt.compare(
    credentials.password as string,
    user.password
  )

  console.log('Password valid:', isValid)

  if (!isValid) {
    console.log('Wrong password')
    return null
  }

  console.log('Login success')

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
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
