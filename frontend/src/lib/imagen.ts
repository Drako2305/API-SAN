/** Lado del avatar que se guarda (px). Se muestra a 96 px como máximo: 256 cubre pantallas de alta densidad. */
const LADO = 256;
/** Tope del data URL (el validador de la API acepta hasta 90 000 caracteres). */
const TOPE = 85_000;
/** Fotos de más de 20 MB se rechazan antes de decodificarlas. */
export const MAX_BYTES_FOTO = 20 * 1024 * 1024;

async function decodificar(archivo: File): Promise<CanvasImageSource & { width: number; height: number }> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(archivo, { imageOrientation: 'from-image' });
    } catch {
      /* formatos que createImageBitmap no lee: se intenta con <img> */
    }
  }
  const url = URL.createObjectURL(archivo);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return Object.assign(img, { width: img.naturalWidth, height: img.naturalHeight });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Convierte una foto elegida por la persona en un avatar cuadrado de 256 px (recorte centrado) como data URL WebP
 * (JPEG si el navegador no codifica WebP), bajando la calidad hasta que quepa en el tope de la API.
 */
export async function prepararAvatar(archivo: File): Promise<string> {
  if (!archivo.type.startsWith('image/')) throw new Error('Elige un archivo de imagen (JPG, PNG o WebP).');
  if (archivo.size > MAX_BYTES_FOTO) throw new Error('La foto pesa más de 20 MB. Elige una más liviana.');
  let fuente: Awaited<ReturnType<typeof decodificar>>;
  try {
    fuente = await decodificar(archivo);
  } catch {
    throw new Error('No pudimos leer esa imagen. Prueba con un JPG o PNG.');
  }
  const lado = Math.min(fuente.width, fuente.height);
  const lienzo = document.createElement('canvas');
  lienzo.width = LADO;
  lienzo.height = LADO;
  const ctx = lienzo.getContext('2d');
  if (!ctx) throw new Error('Tu navegador no pudo procesar la foto.');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(fuente, (fuente.width - lado) / 2, (fuente.height - lado) / 2, lado, lado, 0, 0, LADO, LADO);
  if ('close' in fuente && typeof fuente.close === 'function') fuente.close();

  for (const calidad of [0.86, 0.75, 0.6, 0.45]) {
    let datos = lienzo.toDataURL('image/webp', calidad);
    if (!datos.startsWith('data:image/webp')) datos = lienzo.toDataURL('image/jpeg', calidad);
    if (datos.length <= TOPE) return datos;
  }
  throw new Error('No pudimos reducir la foto lo suficiente. Prueba con otra.');
}
