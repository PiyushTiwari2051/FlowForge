import React from "react";
import FormComponent from "./FormComponent";
import TableComponent from "./TableComponent";
import DashboardComponent from "./DashboardComponent";
import CardComponent from "./CardComponent";
import ChartComponent from "./ChartComponent";
import UnknownComponent from "./UnknownComponent";
import { NormalizedConfig } from "@/lib/config/types";

export interface ComponentProps {
  appId: string;
  config: NormalizedConfig;
  componentConfig: Record<string, any>;
  table?: string;
}

export type ComponentType = "form" | "table" | "dashboard" | "card" | "chart";

export const ComponentRegistry: Record<string, React.ComponentType<ComponentProps>> = {
  form: FormComponent as any,
  table: TableComponent as any,
  dashboard: DashboardComponent as any,
  card: CardComponent as any,
  chart: ChartComponent as any,
};

export function getComponent(type: string): React.ComponentType<any> {
  const comp = ComponentRegistry[type.toLowerCase()];
  if (!comp) {
    // Return a wrapper that displays UnknownComponent
    return function FallbackWrapper(props: ComponentProps) {
      return React.createElement(UnknownComponent, { type, ...props });
    };
  }
  return comp;
}
