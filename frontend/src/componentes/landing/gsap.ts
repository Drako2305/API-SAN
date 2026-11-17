import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Todo el movimiento de la portada se registra dentro de esta consulta (reduced motion recibe el contenido estático). */
export const SIN_REDUCCION = '(prefers-reduced-motion: no-preference)';
/** Fijado con scrub solo donde hay espacio y puntero; en móvil la galería es scroll nativo. */
export const ESCRITORIO = '(min-width: 768px)';

export { gsap, ScrollTrigger, SplitText, useGSAP };
