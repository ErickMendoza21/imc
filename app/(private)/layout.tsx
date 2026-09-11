import { AppSidebar } from "@/components/organisms/AppSidebar";
import { AppHeader }  from "@/components/organisms/AppHeader";

/**
 * Layout del grupo de rutas privadas.
 * Proporciona sidebar + header + área de contenido principal.
 * La protección de rutas (verificación de sesión) se conectará
 * aquí mediante middleware.ts cuando exista backend.
 */
export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-soft)]">
      {/* Sidebar */}
      <AppSidebar />

      {/* Contenido derecho: header + main */}
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
