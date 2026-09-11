import { Home, Plus, FileText, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/nueva-solicitud", label: "Nueva solicitud", icon: Plus },
  { href: "/mis-solicitudes", label: "Mis solicitudes", icon: FileText },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];
