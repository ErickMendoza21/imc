import { redirect } from "next/navigation";

/**
 * Ruta raíz: redirige al login.
 * La autenticación real determinará si va al dashboard en su lugar.
 */
export default function RootPage() {
  redirect("/login");
}
