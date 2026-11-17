import { Briefcase, FlaskConical, GraduationCap, HeartPulse, Landmark, Palette, BookOpen, Cpu, type LucideIcon } from 'lucide-react';
import { slug } from './fotos';

interface InfoArea {
  etiqueta: string;
  icono: LucideIcon;
}

const AREAS: Record<string, InfoArea> = {
  ingenieria: { etiqueta: 'Ingeniería', icono: Cpu },
  salud: { etiqueta: 'Salud', icono: HeartPulse },
  'ciencias-sociales': { etiqueta: 'Ciencias Sociales', icono: Landmark },
  negocios: { etiqueta: 'Negocios', icono: Briefcase },
  'artes-y-diseno': { etiqueta: 'Artes y Diseño', icono: Palette },
  educacion: { etiqueta: 'Educación', icono: BookOpen },
  ciencias: { etiqueta: 'Ciencias', icono: FlaskConical },
};

/** Áreas con ortografía correcta (la API las guarda sin tildes). */
export const etiquetaArea = (area: string): string => AREAS[slug(area)]?.etiqueta ?? area;
export const iconoArea = (area?: string | null): LucideIcon => (area ? AREAS[slug(area)]?.icono : undefined) ?? GraduationCap;
