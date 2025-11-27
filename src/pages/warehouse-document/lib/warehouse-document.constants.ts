import type { DocumentType, DocumentStatus } from "./warehouse-document.interface";

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "ENTRADA_DEVOLUCION", label: "Entrada por Devolución" },
  { value: "ENTRADA_AJUSTE", label: "Entrada por Ajuste" },
  { value: "ENTRADA_TRANSFERENCIA", label: "Entrada por Transferencia" },
  { value: "ENTRADA_DONACION", label: "Entrada por Donación" },
  { value: "SALIDA_DEVOLUCION", label: "Salida por Devolución" },
  { value: "SALIDA_AJUSTE", label: "Salida por Ajuste" },
  { value: "SALIDA_TRANSFERENCIA", label: "Salida por Transferencia" },
  { value: "SALIDA_MERMA", label: "Salida por Merma" },
  { value: "SALIDA_DONACION", label: "Salida por Donación" },
  { value: "SALIDA_USO_INTERNO", label: "Salida por Uso Interno" },
];

export const DOCUMENT_STATUS: { value: DocumentStatus; label: string; variant: "default" | "secondary" | "destructive" }[] = [
  { value: "BORRADOR", label: "Borrador", variant: "secondary" },
  { value: "CONFIRMADO", label: "Confirmado", variant: "default" },
  { value: "CANCELADO", label: "Cancelado", variant: "destructive" },
];

export const MOVEMENT_TYPES = [
  { value: "ENTRADA", label: "Entrada" },
  { value: "SALIDA", label: "Salida" },
];

export const getDocumentTypeLabel = (type: DocumentType): string => {
  return DOCUMENT_TYPES.find((dt) => dt.value === type)?.label || type;
};

export const getDocumentStatusLabel = (status: DocumentStatus): string => {
  return DOCUMENT_STATUS.find((ds) => ds.value === status)?.label || status;
};

export const getDocumentStatusVariant = (status: DocumentStatus): "default" | "secondary" | "destructive" => {
  return DOCUMENT_STATUS.find((ds) => ds.value === status)?.variant || "default";
};

export const isEntryDocument = (type: DocumentType): boolean => {
  return type.startsWith("ENTRADA_");
};

export const isExitDocument = (type: DocumentType): boolean => {
  return type.startsWith("SALIDA_");
};
