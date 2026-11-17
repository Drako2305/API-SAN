import { useState, type FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button, Input } from '@/componentes';
import { useToast } from '@/componentes/Toast';
import { ApiError, mensajeError, usuarios } from '@/lib/api';
import type { ActualizarUsuarioRequest, UsuarioDetalle } from '@/lib/modelos';
import { useSesion } from '@/lib/sesion';
import { FotoPerfil } from './FotoPerfil';

interface Props {
  detalle: UsuarioDetalle;
  onGuardado: (nuevo: UsuarioDetalle) => void;
}

/** Campos editables de la pestaña Datos. */
function valoresDe(d: UsuarioDetalle) {
  return {
    nombre: d.nombre,
    correo: d.correo,
    apellido: d.perfil?.apellido ?? '',
    ciudad: d.perfil?.ciudad ?? '',
  };
}

/** Edita nombre, correo y perfil. Solo envía por PATCH lo que cambió. */
export function FormularioDatos({ detalle, onGuardado }: Props) {
  const { actualizarSesion } = useSesion();
  const toast = useToast();
  const base = valoresDe(detalle);
  const [v, setV] = useState(base);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<{ mensaje: string; detalles: string[] } | null>(null);

  const cambiar = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const cuerpo: ActualizarUsuarioRequest = {};
    if (v.nombre.trim() !== base.nombre) cuerpo.nombre = v.nombre.trim();
    if (v.correo.trim() !== base.correo) cuerpo.correo = v.correo.trim();
    const perfil: NonNullable<ActualizarUsuarioRequest['perfil']> = {};
    if (v.apellido.trim() !== base.apellido) perfil.apellido = v.apellido.trim();
    if (v.ciudad.trim() !== base.ciudad) perfil.ciudad = v.ciudad.trim();
    if (Object.keys(perfil).length) cuerpo.perfil = perfil;

    if (Object.keys(cuerpo).length === 0) {
      toast.mostrar('No hay cambios para guardar.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const resp = await usuarios.actualizar(detalle.id, cuerpo);
      const nuevo: UsuarioDetalle = {
        ...detalle,
        ...resp,
        perfil: resp.perfil ?? (cuerpo.perfil ? { ...(detalle.perfil ?? { apellido: '', ciudad: '' }), ...cuerpo.perfil } : detalle.perfil),
      };
      actualizarSesion({ nombre: nuevo.nombre, correo: nuevo.correo });
      setV(valoresDe(nuevo));
      onGuardado(nuevo);
      toast.ok('Guardamos tus datos.');
    } catch (err) {
      setError({
        mensaje: mensajeError(err, 'No pudimos guardar tus datos.'),
        detalles: err instanceof ApiError && err.status === 400 ? err.detalles : [],
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="grid max-w-2xl gap-4 sm:grid-cols-2" aria-label="Datos personales">
      <FotoPerfil detalle={detalle} nombre={`${detalle.nombre} ${detalle.perfil?.apellido ?? ''}`.trim()} onGuardado={onGuardado} />
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md bg-peligro-suave p-3 text-sm text-peligro sm:col-span-2">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">{error.mensaje}</p>
            {error.detalles.length > 1 && (
              <ul className="mt-1 list-disc pl-4">
                {error.detalles.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <Input etiqueta="Nombre" value={v.nombre} onChange={cambiar('nombre')} required maxLength={100} autoComplete="given-name" />
      <Input etiqueta="Apellido" value={v.apellido} onChange={cambiar('apellido')} required maxLength={100} autoComplete="family-name" />
      <Input etiqueta="Correo" type="email" value={v.correo} onChange={cambiar('correo')} required maxLength={150} autoComplete="email" className="sm:col-span-2" />
      <Input etiqueta="Ciudad" value={v.ciudad} onChange={cambiar('ciudad')} required maxLength={100} autoComplete="address-level2" />
      <div className="sm:col-span-2">
        <Button type="submit" cargando={guardando}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
