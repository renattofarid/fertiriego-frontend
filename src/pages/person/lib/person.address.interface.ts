import type { Links, Meta } from "@/lib/pagination.interface";

export interface AddressDistrict {
  id: number;
  name: string;
  ubigeo_code: string;
  cadena: string;
  province: {
    id: number;
    name: string;
    department: {
      id: number;
      name: string;
    };
  };
}

export interface AddressResource {
  id: number;
  person_id: number;
  direccion: string;
  is_default: boolean;
  district: AddressDistrict;
  created_at: string;
  updated_at: string;
}

export interface AddressResponse {
  data: AddressResource[];
  links: Links;
  meta: Meta;
}

export interface CreateAddressRequest {
  direccion: string;
  district_id: number;
  is_default: boolean;
}

export interface UpdateAddressRequest {
  direccion: string;
  district_id: number;
  is_default: boolean;
}

export interface PendingAddress {
  direccion: string;
  district_id: number;
  district_label?: string;
  is_default: boolean;
}
