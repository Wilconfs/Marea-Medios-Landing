import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'SUPERADMIN' | 'ADMIN' | 'AUXILIAR' | 'CLIENTE'
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: 'SUPERADMIN' | 'ADMIN' | 'AUXILIAR' | 'CLIENTE'
    name?: string | null
    email?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'SUPERADMIN' | 'ADMIN' | 'AUXILIAR' | 'CLIENTE'
  }
}
