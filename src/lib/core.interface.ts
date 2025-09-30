import * as LucideReact from "lucide-react";

export interface ModelInterface {
  name: string;
  description?: string;
  plural?: string;
  gender: boolean; // true for F and false for M
}

export interface TitleInterface {
  title: string;
  subtitle: string;
}

export interface TitlesInterface {
  create: TitleInterface;
  update: TitleInterface;
  delete: TitleInterface;
}

export interface ModelComplete<T> {
  MODEL: ModelInterface;
  TITLES: TitlesInterface;
  ICON: keyof typeof LucideReact;
  ICON_REACT: LucideReact.LucideIcon;
  ENDPOINT: string;
  QUERY_KEY: string;
  ROUTE: string;
  ROUTE_ADD: string;
  ROUTE_UPDATE: string;
  EMPTY: T;
}

export interface Option {
  label: string | (() => React.ReactNode);
  value: string;
  description?: string;
}

export type Action = "create" | "update" | "delete";
