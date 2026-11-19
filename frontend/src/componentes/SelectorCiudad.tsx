import { useState } from 'react';
import { cn } from '@/lib/cn';
import { buscarCiudad, DEPARTAMENTOS, valorCiudad } from '@/lib/municipios';
import { Select } from './Campo';

interface Props {
  /** Valor guardado de la ciudad (sin tildes, como lo guarda la API). */
  valor: string;
  onCambio: (valor: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string | null;
  className?: string;
}

const municipiosDe = (departamento: string): string[] =>
  DEPARTAMENTOS.find((d) => d.departamento === departamento)?.municipios ?? [];

/** Departamento y luego municipio, con todos los municipios de Colombia. */
export function SelectorCiudad({ valor, onCambio, name, required, disabled, error, className }: Props) {
  const [departamento, setDepartamento] = useState(() => (valor ? (buscarCiudad(valor)?.departamento ?? '') : ''));
  const [valorVisto, setValorVisto] = useState(valor);
  const municipios = municipiosDe(departamento);

  // Si el valor cambia desde afuera (otro registro en el formulario) y no es de este departamento, se sigue al suyo.
  if (valor !== valorVisto) {
    setValorVisto(valor);
    const suyo = buscarCiudad(valor)?.departamento;
    if (valor && suyo && !municipios.some((m) => valorCiudad(m) === valor)) setDepartamento(suyo);
  }

  const elegirDepartamento = (d: string) => {
    setDepartamento(d);
    const lista = municipiosDe(d);
    // Bogotá D.C. tiene un solo municipio: se elige solo.
    onCambio(lista.length === 1 ? valorCiudad(lista[0]!) : '');
  };

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      <Select etiqueta="Departamento" required={required} disabled={disabled} value={departamento} onChange={(e) => elegirDepartamento(e.target.value)}>
        <option value="" disabled>
          Elige el departamento
        </option>
        {DEPARTAMENTOS.map((d) => (
          <option key={d.departamento} value={d.departamento}>
            {d.departamento}
          </option>
        ))}
      </Select>
      <Select
        etiqueta="Ciudad o municipio"
        name={name}
        required={required}
        disabled={disabled || !departamento}
        error={error}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
      >
        <option value="" disabled>
          {departamento ? 'Elige el municipio' : 'Primero el departamento'}
        </option>
        {municipios.map((m) => (
          <option key={m} value={valorCiudad(m)}>
            {m}
          </option>
        ))}
      </Select>
    </div>
  );
}
