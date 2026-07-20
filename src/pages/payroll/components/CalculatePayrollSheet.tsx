"use client";

import { useState } from "react";
import GeneralSheet from "@/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, UserPlus } from "lucide-react";
import WorkerOverrideModal from "./WorkerOverrideModal";
import { calculateMonthlyPayroll } from "../lib/payroll.actions";
import type { WorkerOverrideInput } from "../lib/payroll.interface";
import { errorToast, successToast } from "@/lib/core.function";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

type OverrideRow = WorkerOverrideInput & { person_label: string };

interface CalculatePayrollSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (payrollId: number) => void;
}

export default function CalculatePayrollSheet({
  open,
  onClose,
  onSuccess,
}: CalculatePayrollSheetProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [overrides, setOverrides] = useState<OverrideRow[]>([]);
  const [openOverrideModal, setOpenOverrideModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setOverrides([]);
    setOpenOverrideModal(false);
    onClose();
  };

  const handleCalculate = async () => {
    setIsSubmitting(true);
    try {
      const response = await calculateMonthlyPayroll({
        year,
        month,
        worker_overrides: overrides.length
          ? overrides.map(({ person_label, ...rest }) => rest)
          : null,
      });
      successToast(response.message);
      setOverrides([]);
      onSuccess(response.data.id);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          "Error al calcular la planilla",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <GeneralSheet
        open={open}
        onClose={handleClose}
        title="Calcular Planilla Mensual"
        subtitle="Seleccione el periodo y agregue trabajadores con ingresos o descuentos adicionales (opcional)"
        icon="FileSpreadsheet"
        size="2xl"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="neutral" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleCalculate} disabled={isSubmitting}>
              {isSubmitting ? "Calculando..." : "Calcular Planilla"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Año</Label>
              <Input
                type="number"
                min={2000}
                max={2100}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mes</Label>
              <select
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {MONTHS.map((label, index) => (
                  <option key={label} value={index + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                Trabajadores con Ajustes (Opcional)
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenOverrideModal(true)}
              >
                <UserPlus className="size-4 mr-1" /> Agregar Trabajador
              </Button>
            </div>

            {overrides.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Por defecto se calculará la planilla para todos los
                trabajadores con salario base activo. Agregue trabajadores
                aquí solo si desea incluir ingresos o descuentos adicionales
                para este periodo.
              </p>
            ) : (
              <div className="space-y-2">
                {overrides.map((override, index) => (
                  <div
                    key={`${override.person_id}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {override.person_label}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {override.extra_incomes?.length ? (
                          <Badge variant="outline" className="text-green-600">
                            +{override.extra_incomes.length} ingreso(s)
                          </Badge>
                        ) : null}
                        {override.extra_deductions?.length ? (
                          <Badge variant="outline" className="text-red-600">
                            -{override.extra_deductions.length} descuento(s)
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      color="red"
                      onClick={() =>
                        setOverrides((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </GeneralSheet>

      <WorkerOverrideModal
        open={openOverrideModal}
        onClose={() => setOpenOverrideModal(false)}
        onSave={(override) => {
          setOverrides((prev) => [...prev, override]);
          setOpenOverrideModal(false);
        }}
      />
    </>
  );
}
