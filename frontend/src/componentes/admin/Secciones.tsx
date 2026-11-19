import { Badge, Input, Select, SelectorCiudad } from '@/componentes';
import { catalogo } from '@/lib/api';
import { ciudadLegible, etiquetaJornada, etiquetaModalidad, formatoCop, nombreLegible } from '@/lib/formato';
import { JORNADAS, MODALIDADES, type Carrera, type Jornada, type Modalidad, type OfertaAcademica, type Universidad } from '@/lib/modelos';
import { useCarga } from '@/lib/useCarga';
import { SeccionCrud, type ConfigCrud } from './SeccionCrud';

type VCarrera = { nombre: string };
const configCarreras: ConfigCrud<Carrera, VCarrera> = {
  singular: 'carrera',
  plural: 'carreras',
  femenino: true,
  columnas: [{ etiqueta: 'Nombre', celda: (c) => nombreLegible(c.nombre) }],
  cargar: () => catalogo.carreras(),
  textoBusqueda: (c) => c.nombre,
  nombreItem: (c) => c.nombre,
  vacio: { nombre: '' },
  desde: (c) => ({ nombre: c.nombre }),
  aCuerpo: (v) => ({ nombre: v.nombre.trim() }),
  campos: (v, cambiar) => <Input etiqueta="Nombre" value={v.nombre} onChange={(e) => cambiar('nombre', e.target.value)} required maxLength={150} />,
  crear: (b) => catalogo.crearCarrera(b as { nombre: string }),
  actualizar: (id, b) => catalogo.actualizarCarrera(id, b),
  eliminar: (id) => catalogo.eliminarCarrera(id),
  avisoEliminar: 'También se eliminan las ofertas de esta carrera.',
};

export function SeccionCarreras() {
  return <SeccionCrud config={configCarreras} />;
}

type VUniversidad = { nombre: string; ciudad: string; imagenUrl: string };
const configUniversidades: ConfigCrud<Universidad, VUniversidad> = {
  singular: 'universidad',
  plural: 'universidades',
  femenino: true,
  columnas: [
    { etiqueta: 'Nombre', celda: (u) => u.nombre },
    { etiqueta: 'Ciudad', celda: (u) => ciudadLegible(u.ciudad) },
  ],
  cargar: () => catalogo.universidades(),
  textoBusqueda: (u) => `${u.nombre} ${u.ciudad}`,
  nombreItem: (u) => u.nombre,
  vacio: { nombre: '', ciudad: '', imagenUrl: '' },
  desde: (u) => ({ nombre: u.nombre, ciudad: u.ciudad, imagenUrl: u.imagenUrl ?? '' }),
  aCuerpo: (v) => ({ nombre: v.nombre.trim(), ciudad: v.ciudad.trim(), ...(v.imagenUrl.trim() ? { imagenUrl: v.imagenUrl.trim() } : {}) }),
  campos: (v, cambiar) => (
    <>
      <Input etiqueta="Nombre" value={v.nombre} onChange={(e) => cambiar('nombre', e.target.value)} required maxLength={150} />
      <SelectorCiudad valor={v.ciudad} onCambio={(c) => cambiar('ciudad', c)} required />
      <Input etiqueta="Imagen (ruta o enlace)" ayuda="Opcional." value={v.imagenUrl} onChange={(e) => cambiar('imagenUrl', e.target.value)} maxLength={255} />
    </>
  ),
  crear: (b) => catalogo.crearUniversidad(b as { nombre: string; ciudad: string }),
  actualizar: (id, b) => catalogo.actualizarUniversidad(id, b),
  eliminar: (id) => catalogo.eliminarUniversidad(id),
  avisoEliminar: 'También se eliminan sus ofertas.',
};

export function SeccionUniversidades() {
  return <SeccionCrud config={configUniversidades} />;
}

type VOferta = {
  universidadId: string;
  carreraId: string;
  snies: string;
  ciudad: string;
  costo: string;
  duracion: string;
  modalidad: Modalidad;
  jornada: Jornada;
  acreditacion: boolean;
};

export function SeccionOfertas() {
  const unis = useCarga(() => catalogo.universidades(), []);
  const carreras = useCarga(() => catalogo.carreras(), []);
  const listaUnis = unis.datos ?? [];
  const listaCarreras = carreras.datos ?? [];

  const config: ConfigCrud<OfertaAcademica, VOferta> = {
    singular: 'oferta',
    plural: 'ofertas',
    femenino: true,
    bloqueado: unis.cargando || carreras.cargando || !!unis.error || !!carreras.error,
    columnas: [
      { etiqueta: 'Carrera', celda: (o) => nombreLegible(o.carrera) },
      { etiqueta: 'Universidad', celda: (o) => o.universidad },
      { etiqueta: 'Ciudad', celda: (o) => ciudadLegible(o.ciudad) },
      { etiqueta: 'Costo', celda: (o) => <span className="numeros">{formatoCop(o.costo)}</span> },
      {
        etiqueta: 'Modalidad',
        celda: (o) => (
          <span className="flex flex-wrap gap-1">
            <Badge>{etiquetaModalidad(o.modalidad)}</Badge>
            <Badge>{etiquetaJornada(o.jornada)}</Badge>
          </span>
        ),
      },
      { etiqueta: 'SNIES', celda: (o) => <span className="numeros">{o.snies}</span> },
    ],
    cargar: () => catalogo.ofertas(),
    textoBusqueda: (o) => `${o.carrera} ${o.universidad} ${o.ciudad} ${o.snies}`,
    nombreItem: (o) => `${o.carrera} en ${o.universidad}`,
    vacio: { universidadId: '', carreraId: '', snies: '', ciudad: '', costo: '', duracion: '', modalidad: 'presencial', jornada: 'diurna', acreditacion: false },
    desde: (o) => ({
      universidadId: o.universidadId ?? listaUnis.find((u) => u.nombre === o.universidad)?.id ?? '',
      carreraId: o.carreraId ?? listaCarreras.find((c) => c.nombre === o.carrera)?.id ?? '',
      snies: o.snies,
      ciudad: o.ciudad,
      costo: String(o.costo),
      duracion: String(o.duracion),
      modalidad: o.modalidad,
      jornada: o.jornada,
      acreditacion: o.acreditacion,
    }),
    aCuerpo: (v) => ({
      universidadId: v.universidadId,
      carreraId: v.carreraId,
      snies: v.snies.trim(),
      ciudad: v.ciudad.trim(),
      costo: Number(v.costo),
      duracion: Number(v.duracion),
      modalidad: v.modalidad,
      jornada: v.jornada,
      acreditacion: v.acreditacion,
    }),
    campos: (v, cambiar) => (
      <>
        <Select etiqueta="Universidad" value={v.universidadId} onChange={(e) => cambiar('universidadId', e.target.value)} required>
          <option value="" disabled>
            Elige una universidad
          </option>
          {listaUnis.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </Select>
        <Select etiqueta="Carrera" value={v.carreraId} onChange={(e) => cambiar('carreraId', e.target.value)} required>
          <option value="" disabled>
            Elige una carrera
          </option>
          {listaCarreras.map((c) => (
            <option key={c.id} value={c.id}>
              {nombreLegible(c.nombre)}
            </option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input etiqueta="SNIES" value={v.snies} onChange={(e) => cambiar('snies', e.target.value)} required maxLength={50} />
          <SelectorCiudad valor={v.ciudad} onCambio={(c) => cambiar('ciudad', c)} required className="sm:col-span-2" />
          <Input etiqueta="Costo por periodo (COP)" type="number" inputMode="numeric" min={0} step={1} value={v.costo} onChange={(e) => cambiar('costo', e.target.value)} required />
          <Input etiqueta="Duración (periodos)" type="number" inputMode="numeric" min={1} step={1} value={v.duracion} onChange={(e) => cambiar('duracion', e.target.value)} required />
          <Select etiqueta="Modalidad" value={v.modalidad} onChange={(e) => cambiar('modalidad', e.target.value as Modalidad)}>
            {MODALIDADES.map((m) => (
              <option key={m} value={m}>
                {etiquetaModalidad(m)}
              </option>
            ))}
          </Select>
          <Select etiqueta="Jornada" value={v.jornada} onChange={(e) => cambiar('jornada', e.target.value as Jornada)}>
            {JORNADAS.map((j) => (
              <option key={j} value={j}>
                {etiquetaJornada(j)}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="size-4 accent-[var(--color-acento)]" checked={v.acreditacion} onChange={(e) => cambiar('acreditacion', e.target.checked)} />
          Acreditación de alta calidad
        </label>
      </>
    ),
    crear: (b) => catalogo.crearOferta(b as never),
    actualizar: (id, b) => catalogo.actualizarOferta(id, b),
    eliminar: (id) => catalogo.eliminarOferta(id),
  };
  return <SeccionCrud config={config} />;
}
