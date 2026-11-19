import { useState, type FormEvent } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { AvisoError, Button, Input, SelectorCiudad } from '@/componentes';
import { ApiError, auth, mensajeError } from '@/lib/api';
import { useSesion } from '@/lib/sesion';
import type { UsuarioSesion } from '@/lib/modelos';

interface Props {
  paso: 1 | 2;
  onPaso: (p: 1 | 2) => void;
  onListo: (u: UsuarioSesion) => void;
}

export const TITULO_PASO = { 1: 'Crea tu cuenta', 2: 'Completa tu perfil' } as const;
export const SUBTITULO_PASO = {
  1: 'Guarda búsquedas, favoritos y tus pesos de comparación. Es gratis.',
  2: 'Con estos datos ordenamos los resultados cerca de ti.',
} as const;

const CORREO_REPETIDO = 'Ya existe una cuenta con este correo. Ingresa o usa otro correo.';

/** Registro en dos pasos: correo y clave, luego nombre, apellido y ciudad (la API exige `perfil`). */
export function FormularioRegistro({ paso, onPaso, onListo }: Props) {
  const { registro } = useSesion();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [revisando, setRevisando] = useState(false);

  // El correo se revisa antes de pedir nombre y ciudad, así el aviso de cuenta repetida sale en este paso.
  const siguiente = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (revisando) return;
    setErrorCorreo(null);
    setRevisando(true);
    try {
      const { disponible } = await auth.correoDisponible(correo.trim());
      if (!disponible) {
        setErrorCorreo(CORREO_REPETIDO);
        return;
      }
    } catch {
      // Sin respuesta de la API se sigue: al crear la cuenta el 409 vuelve a este paso.
    } finally {
      setRevisando(false);
    }
    onPaso(2);
  };

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      onListo(await registro({ nombre: nombre.trim(), correo: correo.trim(), clave, perfil: { apellido: apellido.trim(), ciudad: ciudad.trim() } }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrorCorreo(CORREO_REPETIDO);
        onPaso(1);
      } else setError(mensajeError(err, 'No pudimos crear tu cuenta. Intenta de nuevo.'));
    } finally {
      setEnviando(false);
    }
  };

  if (paso === 1) {
    return (
      <form onSubmit={siguiente} className="flex flex-col gap-4" key="paso1">
        <Input
          etiqueta="Correo electrónico"
          type="email"
          name="correo"
          autoComplete="email"
          required
          maxLength={150}
          placeholder="tu@correo.com"
          value={correo}
          error={errorCorreo}
          onChange={(e) => {
            setCorreo(e.target.value);
            setErrorCorreo(null);
          }}
          autoFocus
        />
        <Input
          etiqueta="Clave"
          ayuda="Mínimo 8 caracteres."
          type="password"
          name="clave"
          autoComplete="new-password"
          required
          minLength={8}
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />
        <Button type="submit" tamano="lg" cargando={revisando} icono={<Mail className="size-4" aria-hidden />}>
          Continuar con correo
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4" key="paso2">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input etiqueta="Nombre" name="nombre" autoComplete="given-name" required maxLength={100} value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
        <Input etiqueta="Apellido" name="apellido" autoComplete="family-name" required maxLength={100} value={apellido} onChange={(e) => setApellido(e.target.value)} />
      </div>
      <SelectorCiudad name="ciudad" required valor={ciudad} onCambio={setCiudad} />
      {error && (
        <AvisoError>{error}</AvisoError>
      )}
      <div className="flex items-center gap-2">
        <Button variante="fantasma" tamano="lg" onClick={() => onPaso(1)} icono={<ArrowLeft className="size-4" aria-hidden />} disabled={enviando}>
          Atrás
        </Button>
        <Button type="submit" tamano="lg" className="flex-1" cargando={enviando}>
          Crear cuenta
        </Button>
      </div>
    </form>
  );
}
