import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })
        
        if (!user) return null
        
        const ok = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!ok) return null

        // IMPORTANTE: Retornar el tenantId aquí para que el callback JWT pueda verlo
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId, 
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // 1. Si la url viene vacía o es solo una raíz, usar el origen dinámico
      if (!url || url === '/' || url === baseUrl) {
        return url;
      }

      // 2. FORZAR PERMISO ABSOLUTO EN DESARROLLO LOCAL:
      // Si la URL contiene tu puerto local o dominio personalizado de pruebas,
      // la retornamos directamente saltándonos la restricción de NEXTAUTH_URL
      if (url.includes('.local:3000') || url.includes('localhost:3000')) {
        return url;
      }

      // 3. Si es una ruta interna relativa (ej: /login o /admin)
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      return baseUrl;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
        token.tenantId = (user as any).tenantId // Guardamos el tenantId en el token
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        (session.user as any).tenantId = token.tenantId // Pasamos el tenantId a la sesión
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}