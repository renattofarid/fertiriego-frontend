import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  JUSTIFICATION_ENDPOINT,
  type CreateJustificationRequest,
  type CreateJustificationResponse,
  type GetJustificationsProps,
  type JustificationResponse,
  type ReviewJustificationRequest,
} from "./justification.interface";
import type { JustificationSchema } from "./justification.schema";

export async function getJustifications({
  params,
}: GetJustificationsProps): Promise<JustificationResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<JustificationResponse>(
    JUSTIFICATION_ENDPOINT,
    config,
  );
  return data;
}

export async function storeJustification(
  data: JustificationSchema,
): Promise<CreateJustificationResponse> {
  const payload: CreateJustificationRequest = {
    person_id: Number(data.person_id),
    date_from: `${data.date_from}T00:00:00`,
    date_until: `${data.date_until}T23:59:59`,
    type: data.type as CreateJustificationRequest["type"],
    reason: data.reason,
  };
  const response = await api.post<CreateJustificationResponse>(
    JUSTIFICATION_ENDPOINT,
    payload,
  );
  return response.data;
}

export async function reviewJustification(
  id: number,
  data: ReviewJustificationRequest,
): Promise<CreateJustificationResponse> {
  const response = await api.patch<CreateJustificationResponse>(
    `${JUSTIFICATION_ENDPOINT}/${id}/review`,
    data,
  );
  return response.data;
}
