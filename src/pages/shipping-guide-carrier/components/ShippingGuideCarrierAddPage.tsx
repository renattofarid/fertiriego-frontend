import { useNavigate } from "react-router-dom";
import { useShippingGuideCarrierStore } from "../lib/shipping-guide-carrier.store";
import {
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
  errorToast,
  successToast,
} from "@/lib/core.function";
import { SHIPPING_GUIDE_CARRIER } from "../lib/shipping-guide-carrier.interface";
import {
  ShippingGuideCarrierForm,
  type ShippingGuideCarrierFormValues,
} from "./ShippingGuideCarrierForm";
import { useAllSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { useAllVehicles } from "@/pages/vehicle/lib/vehicle.hook";
import PageSkeleton from "@/components/PageSkeleton";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { useAllGuides } from "@/pages/guide/lib/guide.hook";

export default function ShippingGuideCarrierAddPage() {
  const { ROUTE, MODEL } = SHIPPING_GUIDE_CARRIER;
  const navigate = useNavigate();
  const { createGuide, isSubmitting } = useShippingGuideCarrierStore();

  // Hooks para datos
  const { data: suppliers = [], isLoading: loadingSuppliers } =
    useAllSuppliers();
  const workers = useAllWorkers();
  const { data: vehicles = [], isLoading: loadingVehicles } = useAllVehicles();
  const remittents = useAllPersons();
  const recipients = useAllPersons();
  const { data: guides = [], isLoading: loadingGuides } = useAllGuides();

  const isLoading =
    loadingSuppliers ||
    loadingVehicles ||
    loadingGuides ||
    !workers ||
    !remittents ||
    !recipients;

  const onSubmit = async (values: ShippingGuideCarrierFormValues) => {
    try {
      await createGuide(values as any);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || ERROR_MESSAGE(MODEL, "create")
      );
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <ShippingGuideCarrierForm
      mode="create"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      carriers={suppliers || []}
      remittents={remittents || []}
      recipients={recipients || []}
      drivers={workers || []}
      vehicles={vehicles || []}
      guides={guides || []}
    />
  );
}
