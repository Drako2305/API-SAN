import { useState } from 'react';
import { Cifras } from '@/componentes/landing/Cifras';
import { Collage } from '@/componentes/landing/Collage';
import { ComoFunciona } from '@/componentes/landing/ComoFunciona';
import { CtaFinal } from '@/componentes/landing/CtaFinal';
import { ExploraAreas } from '@/componentes/landing/ExploraAreas';
import { GaleriaCarreras } from '@/componentes/landing/GaleriaCarreras';
import { Hero } from '@/componentes/landing/Hero';
import { Marquesina } from '@/componentes/landing/Marquesina';
import { OfertasDestacadas } from '@/componentes/landing/OfertasDestacadas';
import { PiePortada } from '@/componentes/landing/PiePortada';
import { PreguntasFrecuentes } from '@/componentes/landing/PreguntasFrecuentes';
import { UniversidadesCatalogo } from '@/componentes/landing/UniversidadesCatalogo';
import { RegistroDialog } from './auth/RegistroDialog';

export default function Landing() {
  const [registro, setRegistro] = useState(false);
  const abrir = () => setRegistro(true);
  return (
    <>
      <title>SAN · Encuentra y compara carreras en Colombia</title>
      <Hero onRegistro={abrir} />
      <Cifras />
      <ExploraAreas />
      <ComoFunciona />
      <GaleriaCarreras />
      <UniversidadesCatalogo />
      <Marquesina />
      <OfertasDestacadas />
      <Collage />
      <PreguntasFrecuentes />
      <CtaFinal onRegistro={abrir} />
      <PiePortada />
      <RegistroDialog abierto={registro} onCerrar={() => setRegistro(false)} />
    </>
  );
}
