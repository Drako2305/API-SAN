import { useId, useRef, useState, type DragEvent } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';
import { Avatar, Button } from '@/componentes';
import { useToast } from '@/componentes/Toast';
import { mensajeError, usuarios } from '@/lib/api';
import { cn } from '@/lib/cn';
import { prepararAvatar } from '@/lib/imagen';
import type { UsuarioDetalle } from '@/lib/modelos';
import { useSesion } from '@/lib/sesion';

interface Props {
  detalle: UsuarioDetalle;
  nombre: string;
  onGuardado: (nuevo: UsuarioDetalle) => void;
  /** `compacta`: solo el avatar con un botón de cámara (cabecera). `completa`: avatar grande, botones y ayuda. */
  variante?: 'compacta' | 'completa';
}

/**
 * Foto de perfil como en cualquier app: se elige (o se arrastra) una imagen, se recorta cuadrada y se reduce en el
 * navegador, y se guarda al instante. "Quitar" vuelve a las iniciales.
 */
export function FotoPerfil({ detalle, nombre, onGuardado, variante = 'completa' }: Props) {
  const id = useId();
  const entrada = useRef<HTMLInputElement>(null);
  const { actualizarSesion } = useSesion();
  const toast = useToast();
  const [guardando, setGuardando] = useState(false);
  const [encima, setEncima] = useState(false);
  const actual = detalle.perfil?.avatar ?? null;

  const guardar = async (avatar: string | null) => {
    setGuardando(true);
    try {
      const resp = await usuarios.actualizar(detalle.id, { perfil: { avatar } });
      const perfil = resp.perfil ?? (detalle.perfil ? { ...detalle.perfil, avatar } : null);
      onGuardado({ ...detalle, ...resp, perfil });
      actualizarSesion({ avatar });
      toast.ok(avatar ? 'Actualizamos tu foto.' : 'Quitamos tu foto.');
    } catch (e) {
      toast.error(mensajeError(e, 'No pudimos guardar la foto.'));
    } finally {
      setGuardando(false);
    }
  };

  const elegir = async (archivo: File | undefined) => {
    if (!archivo) return;
    try {
      setGuardando(true);
      const datos = await prepararAvatar(archivo);
      await guardar(datos);
    } catch (e) {
      setGuardando(false);
      toast.error(e instanceof Error ? e.message : 'No pudimos usar esa foto.');
    } finally {
      if (entrada.current) entrada.current.value = '';
    }
  };

  const soltar = (e: DragEvent) => {
    e.preventDefault();
    setEncima(false);
    void elegir(e.dataTransfer.files[0]);
  };
  const arrastre = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      setEncima(true);
    },
    onDragLeave: () => setEncima(false),
    onDrop: soltar,
  };

  const input = (
    <input
      ref={entrada}
      id={id}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/heic,image/avif"
      className="sr-only"
      tabIndex={-1}
      onChange={(e) => void elegir(e.target.files?.[0])}
    />
  );

  if (variante === 'compacta') {
    return (
      <div className="relative shrink-0" {...arrastre}>
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          disabled={guardando}
          aria-label={actual ? 'Cambiar foto de perfil' : 'Subir foto de perfil'}
          className={cn('group relative block rounded-full outline-offset-2', encima && 'ring-2 ring-acento ring-offset-2 ring-offset-superficie')}
        >
          <Avatar nombre={nombre} src={actual} tamano="lg" className={cn(guardando && 'opacity-50')} />
          <span
            aria-hidden
            className="absolute -right-0.5 -bottom-0.5 grid size-6 place-items-center rounded-full border-2 border-superficie bg-acento text-sobre-acento transition-transform group-hover:scale-110 motion-reduce:transition-none"
          >
            <Camera className="size-3" />
          </span>
        </button>
        {input}
      </div>
    );
  }

  return (
    <div
      {...arrastre}
      className={cn(
        'flex flex-wrap items-center gap-5 rounded-lg border border-dashed p-4 transition-colors sm:col-span-2',
        encima ? 'border-acento bg-acento-suave' : 'border-borde-fuerte',
      )}
    >
      <Avatar nombre={nombre} src={actual} tamano="xl" className={cn(guardando && 'opacity-50')} />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Foto de perfil</p>
        <p className="mt-0.5 text-sm text-texto-3">JPG, PNG o WebP. La recortamos cuadrada y la reducimos antes de guardarla. También puedes arrastrarla aquí.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variante="secundario" tamano="sm" cargando={guardando} onClick={() => entrada.current?.click()} icono={<Upload className="size-4" aria-hidden />}>
            {actual ? 'Cambiar foto' : 'Subir foto'}
          </Button>
          {actual && (
            <Button type="button" variante="fantasma" tamano="sm" disabled={guardando} onClick={() => void guardar(null)} icono={<Trash2 className="size-4" aria-hidden />}>
              Quitar
            </Button>
          )}
        </div>
      </div>
      {input}
    </div>
  );
}
