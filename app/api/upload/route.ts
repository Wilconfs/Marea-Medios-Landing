import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se envió ningún archivo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    // Convertimos directamente a Uint8Array para evitar cualquier conflicto de tipos con TypeScript
    const buffer = new Uint8Array(bytes);

    // 1. Generar un nombre único para evitar que se sobreescriban
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    
    // 2. Ruta donde se guardará (en public/uploads)
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filepath = path.join(uploadDir, filename);

    // 3. Crear la carpeta si no existe
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 4. Escribir el archivo en el servidor
    await writeFile(filepath, buffer);

    // 5. Retornar la URL pública
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error('Error al subir el archivo:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}