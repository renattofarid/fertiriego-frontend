"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralModal } from "@/components/GeneralModal";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import {
  reviewOvertimeSchema,
  type ReviewOvertimeSchema,
} from "../lib/overtime.schema";
import { useOvertimeStore } from "../lib/overtime.store";
import type { OvertimeResource } from "../lib/overtime.interface";
import { errorToast, successToast } from "@/lib/core.function";

const STATUS_OPTIONS = [
  { value: "APROBADO", label: "Aprobado" },
  { value: "RECHAZADO", label: "Rechazado" },
];

interface Props {
  overtime: OvertimeResource;
  open: boolean;
  onClose: () => void;
  onReviewed: () => void;
}

export default function OvertimeReviewModal({
  overtime,
  open,
  onClose,
  onReviewed,
}: Props) {
  const { isReviewing, reviewOvertime } = useOvertimeStore();

  const form = useForm<ReviewOvertimeSchema>({
    resolver: zodResolver(reviewOvertimeSchema),
    defaultValues: { status: "", review_notes: "" },
    mode: "onChange",
  });

  const handleSubmit = async (data: ReviewOvertimeSchema) => {
    await reviewOvertime(overtime.id, {
      status: data.status as "APROBADO" | "RECHAZADO",
      review_notes: data.review_notes || null,
    })
      .then(() => {
        onClose();
        successToast("Hora extra revisada correctamente.");
        onReviewed();
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ??
            error?.response?.data?.error ??
            "Error al revisar la hora extra.",
        );
      });
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Revisar Hora Extra"
      subtitle={`Registro de ${overtime.person_name} - ${overtime.date}`}
      maxWidth="!max-w-lg"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 w-full"
        >
          <div className="grid grid-cols-1 gap-4 bg-muted p-4 rounded-lg">
            <FormSelect
              control={form.control}
              name="status"
              label="Estado"
              placeholder="Seleccione un estado"
              options={STATUS_OPTIONS}
            />

            <FormField
              control={form.control}
              name="review_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas de la revisión"
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4 w-full justify-end">
            <Button type="button" variant="neutral" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isReviewing || !form.formState.isValid}
            >
              <Loader
                className={`mr-2 h-4 w-4 ${!isReviewing ? "hidden" : ""}`}
              />
              {isReviewing ? "Guardando" : "Guardar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
