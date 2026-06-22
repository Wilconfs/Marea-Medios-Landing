// lib/meta.ts

export async function publishVideoToFacebookPage({
  pageId,
  accessToken,
  videoUrl,
  description
}: {
  pageId: string;
  accessToken: string;
  videoUrl: string;
  description: string;
}) {
  // Usamos la Graph API v20.0 (la más reciente)
  const endpoint = `https://graph.facebook.com/v20.0/${pageId}/videos`;

  // Construimos los datos que Meta requiere
  const formData = new URLSearchParams();
  formData.append('file_url', videoUrl); // Meta descargará el video desde esta URL (Cloudinary)
  formData.append('description', description); // El "copy" o texto de la publicación
  formData.append('access_token', accessToken);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    // Si Meta devuelve un error de validación o token
    if (data.error) {
      console.error('Error de Meta API:', data.error);
      return { success: false, error: data.error.message };
    }

    // Si es exitoso, Meta nos devuelve el ID de la publicación en su plataforma
    return { success: true, remoteId: data.id };
  } catch (error) {
    console.error('Error de red al conectar con Meta:', error);
    return { success: false, error: 'Fallo en la comunicación con el servidor de Meta' };
  }
}