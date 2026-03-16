import { api } from "@/lib/config";
import type {
  AddressResponse,
  AddressResource,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "./person.address.interface";

const endpoint = (personId: number) => `/persons/${personId}/addresses`;

export const getAddresses = async (
  personId: number,
  params?: Record<string, unknown>,
): Promise<AddressResponse> => {
  const response = await api.get<AddressResponse>(endpoint(personId), {
    params,
  });
  return response.data;
};

export const createAddress = async (
  personId: number,
  data: CreateAddressRequest,
): Promise<{ message: string; data: AddressResource }> => {
  const response = await api.post(endpoint(personId), data);
  return response.data;
};

export const updateAddress = async (
  personId: number,
  addressId: number,
  data: UpdateAddressRequest,
): Promise<{ message: string }> => {
  const response = await api.put(`${endpoint(personId)}/${addressId}`, data);
  return response.data;
};

export const deleteAddress = async (
  personId: number,
  addressId: number,
): Promise<{ message: string }> => {
  const response = await api.delete(`${endpoint(personId)}/${addressId}`);
  return response.data;
};

export const setDefaultAddress = async (
  personId: number,
  addressId: number,
): Promise<{ message: string }> => {
  const response = await api.patch(
    `${endpoint(personId)}/${addressId}/default`,
  );
  return response.data;
};
