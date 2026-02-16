import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
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
import { useSidebar } from "@/components/ui/sidebar";
import FormSkeleton from "@/components/FormSkeleton";

export default function ShippingGuideCarrierEditPage() {
  const { ROUTE, MODEL } = SHIPPING_GUIDE_CARRIER;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { guide, fetchGuide, updateGuide, isSubmitting, isFinding } =
    useShippingGuideCarrierStore();

  const { setOpen, setOpenMobile } = useSidebar();
  // Hooks para datos

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  // Cargar guía al montar
  useEffect(() => {
    if (id) {
      fetchGuide(parseInt(id));
    }
  }, [id, fetchGuide]);

  const isLoading = isFinding;

  const onSubmit = async (values: ShippingGuideCarrierFormValues) => {
    if (!id) return;
    try {
      await updateGuide(parseInt(id), values as any);
      successToast(SUCCESS_MESSAGE(MODEL, "edit"));
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(error.response?.data?.message || ERROR_MESSAGE(MODEL, "edit"));
    }
  };

  if (isLoading || !guide) {
    return <FormSkeleton />;
  }

  // Mapear datos de la guía a initialValues
  const initialValues: ShippingGuideCarrierFormValues = {
    transport_modality: "PRIVADO",
    carrier_id: guide.carrier.id.toString(),
    issue_date: guide.issue_date,
    transfer_start_date: guide.transfer_start_date,
    remittent_id: guide.remittent?.id?.toString() || "",
    recipient_id: guide.recipient?.id?.toString() || "",
    shipping_guide_remittent_id: "",
    driver_id: guide.driver.id.toString(),
    vehicle_id: guide.vehicle.id.toString(),
    secondary_vehicle_id: guide.secondary_vehicle?.id.toString() || "",
    driver_license: guide.driver_license,
    origin_address: guide.origin_address,
    origin_ubigeo_id: guide.origin_ubigeo?.id.toString() || "",
    destination_address: guide.destination_address,
    destination_ubigeo_id: guide.destination_ubigeo?.id.toString() || "",
    observations: guide.observations || "",
    details: guide.details.map((d) => ({
      product_id: d.product_id.toString(),
      description: d.description,
      quantity: d.quantity,
      unit: d.unit || "",
      weight: d.weight,
    })),
    total_weight: Number(guide.total_weight),
    total_packages: guide.total_packages,
  };

  return (
    <ShippingGuideCarrierForm
      mode="edit"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={initialValues}
    />
  );
}
