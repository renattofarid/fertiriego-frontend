import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { CompanySchema } from "../lib/company.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { COMPANY, type CompanyResource } from "../lib/company.interface";
import { useCompany, useCompanyById } from "../lib/company.hook";
import { useCompanyStore } from "../lib/company.store";
import { CompanyForm } from "./CompanyForm";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = COMPANY;

export default function CompanyModal({
  id,
  open,
  title,
  mode,
  onClose,
}: Props) {
  const { refetch } = useCompany();
  const { user } = useAuthStore();

  const {
    data: company,
    isFinding: findingCompany,
    refetch: refetchCompany,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useCompanyById(id!);

  const mapCompanyToForm = (data: CompanyResource): Partial<CompanySchema> => ({
    social_reason: data.social_reason,
    ruc: data.ruc,
    trade_name: data.trade_name,
    address: data.address,
    phone: data.phone,
    email: data.email,
    responsible_id: user?.id || data.responsible_id, // Usar el ID del usuario logueado
  });

  const { isSubmitting, updateCompany, createCompany } = useCompanyStore();

  const handleSubmit = async (data: CompanySchema) => {
    if (mode === "create") {
      await createCompany(data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            (error.response.data.message ?? error.response.data.error) ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "create")
          );
        });
    } else {
      await updateCompany(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchCompany();
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            (error.response.data.message ?? error.response.data.error) ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "update")
          );
        });
    }
  };

  const isLoadingAny = isSubmitting || findingCompany;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="!max-w-2xl"
    >
      {!isLoadingAny && company ? (
        <CompanyForm
          defaultValues={mapCompanyToForm(company)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onClose}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
