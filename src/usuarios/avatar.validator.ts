import {
  isURL,
  registerDecorator,
  type ValidationOptions,
} from 'class-validator';

/** Tamaño máximo de una foto subida como data URL (el cuerpo JSON de Express tiene tope de 100 KB; una WebP de 256 px ocupa ~20 KB). */
export const AVATAR_DATA_MAX = 90_000;
const DATA_IMAGEN = /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/]+=*$/;

/** Avatar válido: enlace http(s) de hasta 255 caracteres o una imagen pequeña en data URL (webp, png o jpeg). */
export function esAvatarValido(valor: unknown): boolean {
  if (typeof valor !== 'string') return false;
  if (valor.startsWith('data:'))
    return valor.length <= AVATAR_DATA_MAX && DATA_IMAGEN.test(valor);
  return (
    valor.length <= 255 &&
    isURL(valor, { protocols: ['http', 'https'], require_protocol: true })
  );
}

export function EsAvatar(opciones?: ValidationOptions) {
  return (objeto: object, propiedad: string) =>
    registerDecorator({
      name: 'esAvatar',
      target: objeto.constructor,
      propertyName: propiedad,
      options: {
        message:
          'avatar debe ser un enlace http(s) o una imagen webp, png o jpeg de hasta 65 KB',
        ...opciones,
      },
      validator: { validate: esAvatarValido },
    });
}
