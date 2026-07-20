import { useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Calculator, Send } from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { GeneralModal } from "@/components/GeneralModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/formatCurrency";
import { errorToast, successToast } from "@/lib/core.function";
import { usePayrolls } from "../lib/payroll.hook";
import { downloadPayslipPdf, sendPayslips } from "../lib/payroll.actions";
import type { PayrollResource, PayslipResource } from "../lib/payroll.interface";
import { PAYROLL } from "../lib/payroll.interface";
import { PayslipColumns } from "./PayslipColumns";
import PayslipCalculateModal from "./PayslipCalculateModal";
import PayslipView from "./PayslipView";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function PayrollDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const payrollId = Number(id);

  const statePayroll = (location.state as { payroll?: PayrollResource } | null)
    ?.payroll;

  const { data: payrollsData } = usePayrolls({ per_page: 100 });
  const payroll =
    statePayroll ??
    payrollsData?.data.find((p) => p.id === payrollId) ??
    null;

  const [payslips, setPayslips] = useState<PayslipResource[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openCalculate, setOpenCalculate] = useState(false);
  const [recalculatePerson, setRecalculatePerson] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [viewingPayslip, setViewingPayslip] = useState<PayslipResource | null>(
    null,
  );
  const [openSendConfirm, setOpenSendConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const upsertPayslip = (payslip: PayslipResource) => {
    setPayslips((prev) => {
      const exists = prev.some((p) => p.person_id === payslip.person_id);
      if (exists) {
        return prev.map((p) =>
          p.person_id === payslip.person_id ? payslip : p,
        );
      }
      return [...prev, payslip];
    });
  };

  const toggleSelect = (personId: number) => {
    setSelectedIds((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId],
    );
  };

  const handleDownload = async (payslip: PayslipResource) => {
    try {
      await downloadPayslipPdf(
        payrollId,
        payslip.id,
        `boleta-${payslip.person_name}-${payroll?.period_label ?? ""}.pdf`,
      );
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "Error al descargar la boleta",
      );
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const response = await sendPayslips(payrollId, {
        person_ids: selectedIds.length ? selectedIds : null,
      });
      successToast(response.message);
      if (response.data.failed_count > 0) {
        response.data.failed.forEach((failure) => {
          errorToast(`${failure.name}: ${failure.reason}`);
        });
      }
      setSelectedIds([]);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "Error al enviar las boletas",
      );
    } finally {
      setIsSending(false);
      setOpenSendConfirm(false);
    }
  };

  const columns = useMemo(
    () =>
      PayslipColumns({
        selectedIds,
        onToggleSelect: toggleSelect,
        onView: setViewingPayslip,
        onDownload: handleDownload,
        onRecalculate: (payslip) => {
          setRecalculatePerson({
            id: payslip.person_id,
            label: payslip.person_name,
          });
          setOpenCalculate(true);
        },
      }),
    [selectedIds, payroll],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <TitleComponent
            title={payroll?.period_label ?? `Planilla #${payrollId}`}
            subtitle="Boletas de pago de la planilla"
            icon="FileSpreadsheet"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setRecalculatePerson(null);
              setOpenCalculate(true);
            }}
          >
            <Calculator className="size-4 mr-2" /> Calcular Boleta
          </Button>
          <Button onClick={() => setOpenSendConfirm(true)}>
            <Send className="size-4 mr-2" /> Enviar Boletas
          </Button>
        </div>
      </div>

      {payroll && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile
            label="Estado"
            value={payroll.status}
          />
          <StatTile
            label="Boletas"
            value={String(payroll.payslips_count)}
          />
          <StatTile
            label="Total Bruto"
            value={formatCurrency(Number(payroll.total_gross), {
              currencySymbol: "S/",
            })}
          />
          <StatTile
            label="Total Neto"
            value={formatCurrency(Number(payroll.total_net), {
              currencySymbol: "S/",
            })}
          />
        </div>
      )}

      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Las boletas calculadas en esta sesión se listan a continuación.
          Seleccione trabajadores para enviarles su boleta o deje la
          selección vacía para enviar a todos los calculados.
        </p>
        <DataTable
          columns={columns}
          data={payslips}
          initialColumnVisibility={{}}
        />
      </div>

      <PayslipCalculateModal
        open={openCalculate}
        payrollId={payrollId}
        presetPerson={recalculatePerson}
        onClose={() => setOpenCalculate(false)}
        onCalculated={(payslip) => {
          upsertPayslip(payslip);
          setOpenCalculate(false);
        }}
      />

      {viewingPayslip && (
        <GeneralModal
          open={!!viewingPayslip}
          onClose={() => setViewingPayslip(null)}
          title="Boleta de Pago"
          subtitle="Vista previa de la boleta virtual"
          icon="Receipt"
          size="2xl"
        >
          <div className="space-y-4">
            <PayslipView
              payslip={viewingPayslip}
              periodLabel={payroll?.period_label}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setViewingPayslip(null)}
              >
                Cerrar
              </Button>
              <Button onClick={() => handleDownload(viewingPayslip)}>
                Descargar PDF
              </Button>
            </div>
          </div>
        </GeneralModal>
      )}

      <AlertDialog open={openSendConfirm} onOpenChange={setOpenSendConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar Boletas</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIds.length
                ? `Se enviará la boleta a ${selectedIds.length} trabajador(es) seleccionado(s).`
                : "No hay trabajadores seleccionados: se enviarán las boletas a todos los trabajadores de la planilla."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSend} disabled={isSending}>
              {isSending ? "Enviando..." : "Enviar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const PAYROLL_DETAIL_ROUTE = `${PAYROLL.ROUTE}/:id`;
