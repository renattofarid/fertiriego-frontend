import { toast } from "sonner";
import type { Action, ModelInterface } from "./core.interface";
import { ACTIONS, ACTIONS_NAMES } from "./core.constants";

export const successToast = (
  body: string,
  description: string = new Date().toLocaleString()
) => {
  return toast.success(body, {
    description: description,
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
    description: description,
    action: {
      label: "Cerrar",
      onClick: () => toast.dismiss(),
    },
  });
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
