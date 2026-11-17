import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { Button, Input } from '@/componentes';
import { mensajeError } from '@/lib/api';
import { useSesion } from '@/lib/sesion';
import { AuthSplit } from './AuthSplit';
import { destinoSeguro } from './destino';

export default function Ingresar() {
  const { login, autenticado } = useSesion();
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const destino = destinoSeguro(params.get('returnUrl'));
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (autenticado && !enviando) return <Navigate to={destino} replace />;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(correo.trim(), clave);
      navegar(destino, { replace: true });
    } catch (err) {
      setError(mensajeError(err, 'No pudimos iniciar sesión. Intenta de nuevo.'));
      setEnviando(false);
    }
  };

  return (
    <AuthSplit foto="nacional">
      <title>Ingresar · SAN</title>
      <h1 className="text-3xl">Bienvenido de nuevo</h1>
      <p className="mt-2 mb-7 text-texto-2">Ingresa para ver tus búsquedas, favoritos y pesos.</p>
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <Input etiqueta="Correo electrónico" type="email" name="correo" autoComplete="username" required value={correo} onChange={(e) => setCorreo(e.target.value)} autoFocus />
        <Input etiqueta="Clave" type="password" name="clave" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
        {error && (
          <p role="alert" className="rounded-md bg-peligro-suave px-3 py-2 text-sm font-medium text-peligro">
            {error}
          </p>
        )}
        <Button type="submit" tamano="lg" cargando={enviando}>
          Ingresar
        </Button>
      </form>
      <p className="mt-6 text-sm text-texto-2">
        ¿Aún no tienes cuenta? <Link to="/registro">Crea una gratis</Link>
      </p>
    </AuthSplit>
  );
}
