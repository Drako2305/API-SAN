import { useState } from 'react';
import { EncabezadoPagina, Tabs } from '@/componentes';
import { SeccionCarreras, SeccionOfertas, SeccionUniversidades } from '@/componentes/admin/Secciones';

export default function Admin() {
  const [activa, setActiva] = useState('carreras');
  return (
    <>
      <title>Administración · SAN</title>
      <EncabezadoPagina titulo="Administración" descripcion="Gestiona carreras, universidades y ofertas del catálogo." />
      <Tabs
        nombre="Recursos del catálogo"
        valor={activa}
        onCambio={setActiva}
        tabs={[
          { id: 'carreras', etiqueta: 'Carreras', contenido: activa === 'carreras' && <SeccionCarreras /> },
          { id: 'universidades', etiqueta: 'Universidades', contenido: activa === 'universidades' && <SeccionUniversidades /> },
          { id: 'ofertas', etiqueta: 'Ofertas', contenido: activa === 'ofertas' && <SeccionOfertas /> },
        ]}
      />
    </>
  );
}
