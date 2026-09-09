/**
 * Layout del grupo de rutas públicas (login, registro, etc.).
 * No define <html>/<body>: eso lo maneja app/layout.tsx.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
