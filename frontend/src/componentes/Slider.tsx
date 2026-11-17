import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface PropsSlider extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  etiqueta: string;
  valor: number;
  onCambio: (v: number) => void;
  min?: number;
  max?: number;
  paso?: number;
  /** Texto del valor actual (por defecto, el número). */
  formatoValor?: (v: number) => string;
}

/** Control deslizante nativo (range) con etiqueta y valor visibles; por defecto, pesos 0 a 5. */
export function Slider({ etiqueta, valor, onCambio, min = 0, max = 5, paso = 1, formatoValor, className, ...resto }: PropsSlider) {
  const id = useId();
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.8125rem] font-medium">
          {etiqueta}
        </label>
        <output htmlFor={id} className="numeros text-sm font-semibold text-acento-texto">
          {formatoValor ? formatoValor(valor) : valor}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="san-slider h-6 w-full cursor-pointer"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => onCambio(Number(e.target.value))}
        {...resto}
      />
    </div>
  );
}
