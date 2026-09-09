"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";

// MOCK — pendiente de integración real
const MOCK_CREDENTIALS = { usuario: "admin", contrasena: "1234" };

export function LoginForm() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);

    if (!usuario.trim()) { setError("El campo usuario es requerido."); return; }
    if (!contrasena.trim()) { setError("El campo contraseña es requerido."); return; }

    setCargando(true);
    // MOCK — pendiente de integración real
    await new Promise((r) => setTimeout(r, 800));

    if (
      usuario === MOCK_CREDENTIALS.usuario &&
      contrasena === MOCK_CREDENTIALS.contrasena
    ) {
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Sesión iniciada correctamente',
        confirmButtonColor: 'var(--color-primary)'
      });
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
    setCargando(false);
  };

  return (
    <main
      className="
        relative min-h-screen flex items-center justify-center
        bg-[var(--color-bg-soft)] overflow-hidden px-4 py-8
      "
    >
      {/* ── Blob superior izquierdo ── */}
      <div
        aria-hidden="true"
        className="
          absolute -top-28 -left-28 w-[420px] h-[420px] rounded-full
          bg-radial-[at_50%_50%] from-[var(--color-primary-light)] to-transparent
          blur-[60px] opacity-80
          [animation:float-a_8s_ease-in-out_infinite]
          pointer-events-none
        "
      />

      {/* ── Blob inferior derecho ── */}
      <div
        aria-hidden="true"
        className="
          absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full
          bg-radial-[at_50%_50%] from-[var(--color-primary-light)] to-transparent
          blur-[60px] opacity-70
          [animation:float-b_10s_ease-in-out_infinite]
          pointer-events-none
        "
      />

      {/* ── Card ── */}
      <section
        aria-label="Formulario de inicio de sesión"
        className="
          relative z-10
          bg-white rounded-2xl
          border border-[var(--color-border)]
          shadow-[var(--shadow-card)]
          w-full max-w-[420px]
          px-8 py-12 flex flex-col gap-6
          [animation:card-in_0.4s_cubic-bezier(0.16,1,0.3,1)_both]
        "
      >
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/images/logo.png"
            alt="Logo IMC"
            width={72}
            height={72}
            priority
            className="object-contain rounded-full"
          />
        </div>

        {/* Encabezado */}
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-[1.6rem] font-bold text-[var(--color-primary)] tracking-tight">
            Bienvenido
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Iniciar sesión para continuar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="Usuario" htmlFor="login-usuario">
            <Input
              id="login-usuario"
              type="text"
              placeholder="Ingrese su usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
              aria-required="true"
            />
          </FormField>

          <FormField
            label="Contraseña"
            htmlFor="login-contrasena"
            error={error}
          >
            <Input
              id="login-contrasena"
              type={mostrarContrasena ? "text" : "password"}
              placeholder="Ingrese su contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              autoComplete="current-password"
              aria-required="true"
              suffix={
                <button
                  type="button"
                  aria-label={
                    mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  onClick={() => setMostrarContrasena((v) => !v)}
                  className="
                    flex items-center p-1 rounded-md
                    text-[var(--color-text-secondary)]
                    transition-colors duration-150
                    hover:text-[var(--color-secondary)]
                    bg-transparent border-none cursor-pointer
                    leading-none
                  "
                >
                  {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            disabled={cargando}
            aria-busy={cargando}
            className="mt-1"
          >
            {cargando ? "Iniciando sesión…" : "Iniciar sesión"}
          </Button>

          <div className="flex justify-center">
            <Button type="button" variant="ghost">
              ¿Olvidó su contraseña?
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
