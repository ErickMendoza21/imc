import { Home, Plus, FileText, Settings, Users, Car, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Roles que pueden ver este item. Si no se define, es visible para todos. */
  roles?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/inicio", label: "Inicio", icon: Home, roles: ["solicitante"] },
  { href: "/usuarios", label: "Usuarios", icon: Users, roles: ["admin"] },
  { href: "/sedes", label: "Sedes", icon: MapPin, roles: ["admin"] },
  { href: "/nueva-solicitud", label: "Nueva solicitud", icon: Plus, roles: ["solicitante"] },
  { href: "/mis-solicitudes", label: "Mis solicitudes", icon: FileText, roles: ["solicitante"] },
];
