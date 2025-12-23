// ============================================
// UBIGEO - Interfaces & Types
// ============================================

export interface UbigeoResource {
  id: number;
  name: string; // "Purus"
  cadena: string; // "250401-Ucayali-Purus-Purus"
  ubigeo_code: string; // "250401"
}

export interface UbigeoResponse {
  data: UbigeoResource[];
}

export const UBIGEO_ENDPOINT = "/ubigeos";
