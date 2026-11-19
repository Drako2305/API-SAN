import { Compass } from 'lucide-react';
import { EmptyState, LinkButton } from '@/componentes';
import { useTituloPagina } from '@/lib/useTituloPagina';

export default function NoEncontrado() {
  useTituloPagina('Página no encontrada');
  return (
    <>
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
