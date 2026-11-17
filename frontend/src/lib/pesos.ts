import { CRITERIOS, type Pesos } from './modelos';

/** Porcentajes enteros que suman 100 (método del mayor resto). Con suma 0, todos en 0. */
export function normalizar(p: Pesos): Pesos {
  const suma = CRITERIOS.reduce((s, c) => s + p[c], 0);
  const cero: Pesos = { costo: 0, modalidad: 0, ubicacion: 0, acreditacion: 0 };
  if (suma === 0) return cero;
  const brutos = CRITERIOS.map((c) => ({ c, v: (p[c] / suma) * 100 }));
  const res = { ...cero };
  let usados = 0;
  for (const b of brutos) {
    res[b.c] = Math.floor(b.v);
    usados += res[b.c];
  }
  [...brutos]
    .sort((a, b) => b.v - Math.floor(b.v) - (a.v - Math.floor(a.v)))
    .slice(0, 100 - usados)
    .forEach((b) => (res[b.c] += 1));
  return res;
}
