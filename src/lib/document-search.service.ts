import { api } from "@/lib/config";

export interface DNISearchRequest {
  search: string;
}

export interface DNISearchResponse {
  message: string;
  data: {
    number_document: string;
    names: string;
    father_surname: string;
    mother_surname: string;
    birthday: string;
    ubigeo: string;
  };
}

export interface RUCSearchRequest {
  search: string;
}

export interface RUCSearchResponse {
  message?: string;
  success?: boolean;
  data: {
    number_document?: string;
    ruc?: string;
    business_name?: string;
    razon_social?: string;
    nombre_o_razon_social?: string;
    nombre?: string;
    names?: string;
    father_surname?: string;
    mother_surname?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    address?: string | null;
    direccion?: string | null;
  };
}

export async function searchDNI(request: DNISearchRequest): Promise<DNISearchResponse> {
  const { data } = await api.post<DNISearchResponse>("/search-dni", request);
  return data;
}

export async function searchRUC(request: RUCSearchRequest): Promise<RUCSearchResponse> {
  const { data } = await api.post<RUCSearchResponse>("/search-ruc", request);
  return data;
}

export function isValidData(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim() !== "";
}

export function isValidSearchResponse(
  response:
    | { message?: string; success?: boolean; data?: unknown }
    | null
    | undefined,
): boolean {
  if (!response?.data) return false;
  return response?.success === true || isValidData(response?.message);
}