import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { useSesion } from '@/lib/sesion';
import { AuthSplit } from './AuthSplit';
import { destinoSeguro } from './destino';
import { FormularioRegistro, SUBTITULO_PASO, TITULO_PASO } from './FormularioRegistro';

export default function Registro() {
  const { autenticado } = useSesion();
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const destino = destinoSeguro(params.get('returnUrl'));
  const [paso, setPaso] = useState<1 | 2>(1);
  const [listo, setListo] = useState(false);

  if (autenticado && !listo) return <Navigate to={destino} replace />;

  return (
    <AuthSplit foto="javeriana">
      <title>Crear cuenta · SAN</title>
      <h1 className="text-3xl">{TITULO_PASO[paso]}</h1>
      <p className="mt-2 mb-7 text-texto-2">{SUBTITULO_PASO[paso]}</p>
      <FormularioRegistro
        paso={paso}
        onPaso={setPaso}
        onListo={() => {
          setListo(true);
          navegar(destino, { replace: true, viewTransition: true });
        }}
      />
      <p className="mt-6 text-sm text-texto-2">
        ¿Ya tienes cuenta? <Link to="/ingresar">Ingresa</Link>
      </p>
    </AuthSplit>
  );
}
