import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PATIENT_SEXO_LABELS,
  maskCpf,
  maskPhone,
  type PatientFormData,
} from "../types/patient-form.types";

const FOCUS_RING = "focus-visible:ring-2 focus-visible:ring-marsala";
const SEXO_ITEMS = Object.entries(PATIENT_SEXO_LABELS);

export interface PatientFormFieldsProps {
  control: Control<PatientFormData>;
}

/** Campos do formulário de Paciente — apresentação pura, sem acesso a dados. */
export function PatientFormFields({ control }: PatientFormFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome completo</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Digite o nome completo" className={FOCUS_RING} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="nome_social"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome social</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Opcional" className={FOCUS_RING} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  onChange={(event) => field.onChange(maskCpf(event.target.value))}
                  className={FOCUS_RING}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="data_nascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de nascimento</FormLabel>
              <FormControl>
                <Input {...field} type="date" className={FOCUS_RING} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                  onChange={(event) => field.onChange(maskPhone(event.target.value))}
                  className={FOCUS_RING}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="sexo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexo</FormLabel>
              <Select
                value={field.value.length > 0 ? field.value : undefined}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className={FOCUS_RING}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SEXO_ITEMS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                placeholder="paciente@email.com"
                className={FOCUS_RING}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="observacoes_alergias"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alergias e observações técnicas</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={4}
                placeholder="Registre alergias, restrições e observações clínicas relevantes"
                className={FOCUS_RING}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
