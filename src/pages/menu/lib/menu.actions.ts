import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import type { getOptionMenuProps, OptionMenuResource } from "./menu.interface";

const ENDPOINT = "/permission";

export async function getOptionsMenu({
  params,
}: getOptionMenuProps): Promise<OptionMenuResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<OptionMenuResource[]>(ENDPOINT, config);
  return data;
}

export async function setAccessTypeUser(
  id: number,
  data: any
): Promise<OptionMenuResource> {
  const response = await api.put<OptionMenuResource>(
    `rols/${id}/setaccess`,
    data
  );
  return response.data;
}
