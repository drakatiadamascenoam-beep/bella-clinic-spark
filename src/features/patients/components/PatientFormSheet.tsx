import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { useCreatePaciente, usePaciente, useUpdatePaciente } from "../hooks/usePatient";
import type { Patient } from "../types/patient.types";
import {
  PATIENT_FORM_DEFAULTS,
  PATIENT_SEXO_LABELS,
  maskCpf,
  maskPhone,
  patientSchema,
  type PatientFormData,
} from "../types/patient-form.types";
import { toDateInputValue } from "./patient-format";

export interface PatientFormSheetProps {
  /** null → modo criação; Patient → modo edição. */
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SEXO_ITEMS = Object.entries(PATIENT_SEXO_LABELS);

function toFormValues(patient: Patient): PatientFormData {
  const sexo = patient.sexo?.toLowerCase() ?? "";
  return {
    nome: patient.nome,
    nome_social: patient.nomeSocial ?? "",
    cpf: patient.cpf ? maskCpf(patient.cpf) : "",
    data_nascimento: toDateInputValue(patient.dataNascimento),
    telefone: patient.telefone ? maskPhone(patient.telefone) : "",
    email: patient.email ?? "",
    sexo: sexo in PATIENT_SEXO_LABELS ? (sexo as PatientFormData["sexo"]) : "",
    observacoes_alergias: patient.observacoesAlergias ?? "",
  };
}

export function PatientFormSheet({ patient, open, onOpenChange }: PatientFormSheetProps) {
  const isEdit = patient !== null;
  const { data: loaded, isFetching } = usePaciente(open && patient ? patient.id : null);
  const current = loaded ?? patient;

  const createMutation = useCreatePaciente();
  const updateMutation = useUpdatePaciente();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: PATIENT_FORM_DEFAULTS,
    mode: "onBlur",
  });

  const { reset } = form;
  useEffect(() => {
    if (!open) return;
    reset(current ? toFormValues(current) : PATIENT_FORM_DEFAULTS);
  }, [open, current, reset]);

  const isDirty = form.formState.isDirty;
  const showSkeleton = isEdit && isFetching && !loaded;

  async function onSubmit(values: PatientFormData) {
    if (isSubmitting) return;
    try {
      if (isEdit && patient) {
        await updateMutation.mutateAsync({ ...values, id: patient.id });
        toast.success("Paciente atualizado com sucesso.");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Paciente cadastrado com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Não foi possível salvar o paciente.",
      );
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next && isSubmitting) return;
    if (!next && isDirty) {
      const confirmed = window.confirm(
        "Existem alterações não salvas. Deseja descartar as alterações?",
      );
      if (!confirmed) return;
    }
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-2 text-left">
          <SheetTitle className="font-serif text-2xl font-medium">
            {isEdit ? "Editar paciente" : "Novo paciente"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Atualize os dados cadastrais do paciente."
              : "Cadastre um novo paciente na Bella Clinic Platform."}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {showSkeleton ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Digite o nome completo"
                        className="focus-visible:ring-2 focus-visible:ring-marsala"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nome_social"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome social</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Opcional"
                        className="focus-visible:ring-2 focus-visible:ring-marsala"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
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
                          className="focus-visible:ring-2 focus-visible:ring-marsala"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_nascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de nascimento</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="focus-visible:ring-2 focus-visible:ring-marsala"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                          className="focus-visible:ring-2 focus-visible:ring-marsala"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sexo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo</FormLabel>
                      <Select
                        value={field.value.length > 0 ? field.value : undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-marsala">
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
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="paciente@email.com"
                        className="focus-visible:ring-2 focus-visible:ring-marsala"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacoes_alergias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alergias e observações técnicas</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Registre alergias, restrições e observações clínicas relevantes"
                        className="focus-visible:ring-2 focus-visible:ring-marsala"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter className="mt-auto flex-row justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleOpenChange(false)}
                  className="focus-visible:ring-2 focus-visible:ring-marsala"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || (isEdit && !isDirty)}
                  className="focus-visible:ring-2 focus-visible:ring-marsala"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {isEdit ? "Salvar alterações" : "Cadastrar paciente"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
