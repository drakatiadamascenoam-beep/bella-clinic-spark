import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  conselhoLabels,
  conselhoValues,
  professionalRoleLabels,
  professionalRoleValues,
  professionalWeekdays,
} from "../types/professional-view";
import type { ProfessionalFormData } from "../types/professional-form.types";

const FOCUS_RING = "focus-visible:ring-2 focus-visible:ring-marsala";

export interface ProfessionalFormFieldsProps {
  control: Control<ProfessionalFormData>;
}

/** Campos do formulário de Profissional — apresentação pura, sem acesso a dados. */
export function ProfessionalFormFields({ control }: ProfessionalFormFieldsProps) {
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="papel_clinico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Papel</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className={FOCUS_RING}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {professionalRoleValues.map((role) => (
                    <SelectItem key={role} value={role}>
                      {professionalRoleLabels[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="especialidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidade</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Opcional" className={FOCUS_RING} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="conselho_profissional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conselho profissional</FormLabel>
              <Select
                value={field.value && field.value.length > 0 ? field.value : undefined}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className={FOCUS_RING}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {conselhoValues.map((conselho) => (
                    <SelectItem key={conselho} value={conselho}>
                      {conselhoLabels[conselho]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="registro_profissional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registro (número/UF)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex.: 123456/MT" className={FOCUS_RING} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Opcional" className={FOCUS_RING} />
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
                <Input {...field} placeholder="Opcional" className={FOCUS_RING} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="dias_atendimento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dias de atendimento</FormLabel>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {professionalWeekdays.map((day) => {
                const checked = field.value.includes(day.value);
                return (
                  <label
                    key={day.value}
                    className="flex flex-col items-center gap-1 rounded-lg border border-border p-2 text-xs"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) => {
                        field.onChange(
                          next
                            ? [...field.value, day.value]
                            : field.value.filter((value) => value !== day.value),
                        );
                      }}
                      className={FOCUS_RING}
                    />
                    {day.short}
                  </label>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="horario_inicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Início da jornada</FormLabel>
              <FormControl>
                <Input {...field} type="time" className={FOCUS_RING} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="horario_fim"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fim da jornada</FormLabel>
              <FormControl>
                <Input {...field} type="time" className={FOCUS_RING} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="intervalo_inicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Início do intervalo</FormLabel>
              <FormControl>
                <Input {...field} type="time" className={FOCUS_RING} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="intervalo_fim"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fim do intervalo</FormLabel>
              <FormControl>
                <Input {...field} type="time" className={FOCUS_RING} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="ativo"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
            <FormLabel className="mb-0">Profissional ativo</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} className={FOCUS_RING} />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
