import { Compass } from 'lucide-react';
import { EmptyState, LinkButton } from '@/componentes';

export default function NoEncontrado() {
  return (
    <>
      <title>Página no encontrada · SAN</title>
      <EmptyState
        className="mt-10"
        icono={<Compass />}
        titulo="No encontramos esta página"
        texto="Puede que el enlace esté mal escrito o que la página ya no exista."
        accion={<LinkButton to="/">Volver al inicio</LinkButton>}
      />
    </>
  );
}
