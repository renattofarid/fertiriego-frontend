import { toast } from "sonner";
import type { Action, ModelInterface } from "./core.interface";
import { ACTIONS, ACTIONS_NAMES } from "./core.constants";

export const successToast = (
  body: string,
  description: string = new Date().toLocaleString()
) => {
  return toast.success(body, {
    description,
    action: {
      label: "Listo",
      onClick: () => toast.dismiss(),
    },
  });
};

export const errorToast = (
  body: string = "Error",
  description: string = new Date().toLocaleString()
) => {
  return toast.error(body, {
    description,
    action: {
      label: "Cerrar",
      onClick: () => toast.dismiss(),
    },
  });
};

export const warningToast = (
  body: string,
  description: string = new Date().toLocaleString()
) => {
  return toast.warning(body, {
    description,
    action: {
      label: "Entendido",
      onClick: () => toast.dismiss(),
    },
  });
};

export const infoToast = (
  body: string,
  description: string = new Date().toLocaleString()
) => {
  return toast.info(body, {
    description,
    action: {
      label: "Ok",
      onClick: () => toast.dismiss(),
    },
  });
};

export const loadingToast = (body: string = "Cargando...") => {
  return toast.loading(body);
};

export const promiseToast = <T>(
  promise: Promise<T>,
  messages: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: unknown) => string);
  } = {}
) => {
  return toast.promise(promise, {
    loading: messages.loading ?? "Procesando...",
    success: messages.success ?? "Operación exitosa",
    error: messages.error ?? "Ocurrió un error",
  });
};

export const dismissToast = (toastId?: string | number) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

export const objectToFormData = (obj: any) => {
  const formData = new FormData();
  for (const key in obj) {
    formData.append(key, obj[key]);
  }
  return formData;
};

export const SUCCESS_MESSAGE: (
  { name, gender }: ModelInterface,
  action: Action
) => string = ({ name, gender = true }, action) =>
  `${name} ${ACTIONS_NAMES[action]}${gender ? "a" : "o"} correctamente.`;

export const ERROR_MESSAGE: (
  { name, gender }: ModelInterface,
  action: Action
) => string = ({ name, gender = true }, action) =>
  `Error al ${ACTIONS[action]} ${gender ? "la" : "el"} ${name}.`;

export const matchCurrency = (currencyCode: string): string => {
  const currency =
    currencyCode === "PEN"
      ? "S/"
      : currencyCode === "USD"
      ? "$"
      : currencyCode === "EUR"
      ? "€"
      : currencyCode;
  return currency;
};
