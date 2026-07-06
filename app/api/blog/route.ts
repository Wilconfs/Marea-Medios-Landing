import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db' // Asegúrate de que la ruta a prisma sea la correcta

export async function GET() {
  try {
    // Traemos solo los artículos PUBLICADOS, del más nuevo al más viejo
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        excerpt: true,
        content: true,
        coverImage: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ success: true, data: posts })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}