import { Textarea } from "@/components/ui/textarea";

export interface ClinicalEvolutionEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
  name?: string;
}

/**
 * Editor de Evolução Clínica.
 *
 * Abstração deliberada sobre o controle de texto: hoje um Textarea,
 * amanhã um Rich Text Editor. Nenhum consumidor conhece a implementação.
 */
export function ClinicalEvolutionEditor({
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder,
  rows = 8,
  className,
  name,
}: ClinicalEvolutionEditorProps) {
  return (
    <Textarea
      name={name}
      value={value}
      rows={rows}
      disabled={disabled}
      placeholder={placeholder}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
      className={className}
    />
  );
}
