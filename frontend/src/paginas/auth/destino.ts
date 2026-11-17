/** Solo se permiten rutas internas como destino tras ingresar (evita redirecciones abiertas). */
export function destinoSeguro(returnUrl: string | null, porDefecto = '/inicio'): string {
  return returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : porDefecto;
}
