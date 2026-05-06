import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { generatePresignedUploadUrl, deleteFile, getPublicUrl } from '@/lib/s3'

export const dynamic = 'force-dynamic'

// Generate presigned upload URL
export async function POST(req: Request) {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.error === 'unauthorized' ? 401 : 403 },
    )
  }

  try {
    const { fileName, contentType } = await req.json()
    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
    }

    const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(
      fileName,
      contentType,
      true, // product images are public
    )

    const publicUrl = getPublicUrl(cloud_storage_path)

    return NextResponse.json({ uploadUrl, cloud_storage_path, publicUrl })
  } catch (err) {
    console.error('[upload POST]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

// Delete file
export async function DELETE(req: Request) {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.error === 'unauthorized' ? 401 : 403 },
    )
  }

  try {
    const { cloud_storage_path } = await req.json()
    if (!cloud_storage_path) {
      return NextResponse.json({ error: 'missing_path' }, { status: 400 })
    }

    await deleteFile(cloud_storage_path)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[upload DELETE]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
