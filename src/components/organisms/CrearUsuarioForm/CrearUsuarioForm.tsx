"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  Pencil,
  EyeOff,
  Eye,
  User,
  Building2,
  FileText,
  MapPin,
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  X,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { SEDES_MOCK } from "@/lib/constants/solicitud";
import {
  getUsuarios,
  saveUsuario,
  updateUsuario,
  toggleUsuarioActivo,
  type Usuario,
} from "@/lib/services/usuarios";

const ROLES_OPTIONS = [
  { value: "solicitante", label: "Solicitante" },
  { value: "inspector", label: "Inspector" },
];

/** Badge de rol */
function RolBadge({ rol }: { rol: string }) {
  const isInspector = rol === "inspector";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        isInspector
          ? "bg-amber-50 text-[var(--color-warning)] border-[var(--color-warning)]/20"
          : "bg-blue-50 text-[var(--color-secondary)] border-[var(--color-secondary)]/20"
      }`}
    >
      {rol.charAt(0).toUpperCase() + rol.slice(1)}
    </span>
  );
}

/** Badge de estado activo/inactivo */
function EstadoBadge({ activo }: { activo: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        activo
          ? "bg-green-50 text-[var(--color-success)] border-[var(--color-success)]/20"
          : "bg-red-50 text-[var(--color-danger)] border-[var(--color-danger)]/20"
      }`}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}

/** Obtiene el label legible de la sede */
function getSedeLabel(value: string): string {
  return SEDES_MOCK.find((s) => s.value === value)?.label ?? value;
}

// ─── Formulario modal de creación / edición ───────────────────────────────

interface UsuarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingUser: Usuario | null;
}

function UsuarioFormModal({
  isOpen,
  onClose,
  onSaved,
  editingUser,
}: UsuarioFormModalProps) {
  const isEditing = editingUser !== null;

  const [rol, setRol] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [sede, setSede] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [celular, setCelular] = useState("");
  const [correo, setCorreo] = useState("");

  // Rellenar campos cuando se edita
  useEffect(() => {
    if (editingUser) {
      setRol(editingUser.rol);
      setUsername(editingUser.username);
      setPassword(editingUser.password);
      setEmpresa(editingUser.empresa);
      setDescripcion(editingUser.descripcion);
      setSede(editingUser.sede);
      setNombreCompleto(editingUser.nombreCompleto);
      setCelular(editingUser.celular);
      setCorreo(editingUser.correo);
    } else {
      setRol("");
      setUsername("");
      setPassword("");
      setEmpresa("");
      setDescripcion("");
      setSede("");
      setNombreCompleto("");
      setCelular("");
      setCorreo("");
    }
  }, [editingUser, isOpen]);

  const isDirty = useMemo(() => {
    if (editingUser) {
      return (
        rol !== editingUser.rol ||
        username !== editingUser.username ||
        password !== (editingUser.password || "") ||
        empresa !== editingUser.empresa ||
        descripcion !== editingUser.descripcion ||
        sede !== editingUser.sede ||
        nombreCompleto !== editingUser.nombreCompleto ||
        celular !== editingUser.celular ||
        correo !== editingUser.correo
      );
    }
    return (
      rol !== "" ||
      username !== "" ||
      password !== "" ||
      empresa !== "" ||
      descripcion !== "" ||
      sede !== "" ||
      nombreCompleto !== "" ||
      celular !== "" ||
      correo !== ""
    );
  }, [
    rol, username, password, empresa, descripcion, sede, nombreCompleto, celular, correo,
    editingUser
  ]);

  const handleClose = () => {
    if (isDirty) {
      Swal.fire({
        icon: "warning",
        title: "¿Cerrar sin guardar?",
        text: "Tienes cambios sin guardar que se perderán.",
        showCancelButton: true,
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "var(--color-danger)",
        cancelButtonColor: "var(--color-primary)",
      }).then((result) => {
        if (result.isConfirmed) {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  const isFormValid =
    rol !== "" &&
    username.trim() !== "" &&
    password.trim() !== "" &&
    empresa.trim() !== "" &&
    descripcion.trim() !== "" &&
    sede !== "" &&
    nombreCompleto.trim() !== "" &&
    celular.trim() !== "" &&
    correo.trim() !== "";

  const handleSubmit = () => {
    try {
      if (isEditing) {
        updateUsuario(editingUser.id, {
          rol: rol as "solicitante" | "inspector",
          username: username.trim(),
          password: password.trim(),
          empresa: empresa.trim(),
          descripcion: descripcion.trim(),
          sede,
          nombreCompleto: nombreCompleto.trim(),
          celular: celular.trim(),
          correo: correo.trim(),
        });
        Swal.fire({
          icon: "success",
          title: "Usuario actualizado",
          text: `Los datos de "${username.trim()}" han sido actualizados.`,
          confirmButtonColor: "var(--color-primary)",
        });
      } else {
        saveUsuario({
          username: username.trim(),
          password: password.trim(),
          rol: rol as "solicitante" | "inspector",
          empresa: empresa.trim(),
          descripcion: descripcion.trim(),
          sede,
          nombreCompleto: nombreCompleto.trim(),
          celular: celular.trim(),
          correo: correo.trim(),
        });
        Swal.fire({
          icon: "success",
          title: "Usuario creado",
          text: `El usuario "${username.trim()}" ha sido registrado con el rol de ${rol}.`,
          confirmButtonColor: "var(--color-primary)",
        });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err instanceof Error ? err.message : "No se pudo guardar el usuario.",
        confirmButtonColor: "var(--color-danger)",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="
          relative z-10 bg-white rounded-2xl
          border border-[var(--color-border)]
          shadow-[0_25px_60px_-12px_rgba(13,71,181,0.25)]
          w-full max-w-[880px] max-h-[90vh] overflow-y-auto
          [animation:card-in_0.3s_cubic-bezier(0.16,1,0.3,1)_both]
        "
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary-light)] rounded-lg">
              {isEditing ? (
                <Pencil size={18} className="text-[var(--color-primary)]" />
              ) : (
                <Plus size={18} className="text-[var(--color-primary)]" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-title)]">
                {isEditing ? "Editar usuario" : "Crear usuario"}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {isEditing
                  ? "Modifica los datos del usuario seleccionado."
                  : "Completa los campos para registrar un nuevo usuario."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="
              p-2 rounded-lg bg-transparent border-none cursor-pointer
              text-[var(--color-text-secondary)]
              hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]
              transition-colors duration-150
            "
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sección: Credenciales y Rol */}
        <section
          className="px-8 py-5 border-b border-[var(--color-border)]"
          aria-labelledby="modal-credenciales-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck
              size={16}
              className="text-[var(--color-secondary)]"
            />
            <h3
              id="modal-credenciales-heading"
              className="text-sm font-bold text-[var(--color-title)]"
            >
              Credenciales y rol
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Rol" htmlFor="modal-rol" required>
              <Select
                id="modal-rol"
                options={ROLES_OPTIONS}
                placeholder="Selecciona un rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                prefix={<User size={15} />}
              />
            </FormField>
            <FormField label="Usuario" htmlFor="modal-username" required>
              <Input
                id="modal-username"
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                prefix={<User size={15} />}
              />
            </FormField>
            <FormField label="Contraseña" htmlFor="modal-password" required>
              <Input
                id="modal-password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                prefix={<Lock size={15} />}
              />
            </FormField>
          </div>
        </section>

        {/* Cuerpo: dos columnas */}
        <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]">
          {/* Columna izquierda: Datos generales */}
          <section className="px-8 py-5" aria-labelledby="modal-generales-heading">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-[var(--color-secondary)]" />
              <h3
                id="modal-generales-heading"
                className="text-sm font-bold text-[var(--color-title)]"
              >
                Datos generales
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              <FormField label="Nombre de la empresa" htmlFor="modal-empresa" required>
                <Input
                  id="modal-empresa"
                  type="text"
                  placeholder="Ingrese el nombre de la empresa"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  prefix={<Building2 size={15} />}
                />
              </FormField>
              <FormField
                label="Descripción del proyecto"
                htmlFor="modal-descripcion"
                required
              >
                <Textarea
                  id="modal-descripcion"
                  placeholder="Ingrese la descripción del proyecto"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  prefix={<FileText size={15} />}
                  maxLength={500}
                  showCount
                  rows={3}
                />
              </FormField>
              <FormField label="Sede" htmlFor="modal-sede" required>
                <Select
                  id="modal-sede"
                  options={SEDES_MOCK}
                  placeholder="Selecciona una sede"
                  value={sede}
                  onChange={(e) => setSede(e.target.value)}
                  prefix={<MapPin size={15} />}
                />
              </FormField>
            </div>
          </section>

          {/* Columna derecha: Datos del solicitante */}
          <section className="px-8 py-5" aria-labelledby="modal-solicitante-heading">
            <div className="flex items-center gap-2 mb-4">
              <User size={16} className="text-[var(--color-secondary)]" />
              <h3
                id="modal-solicitante-heading"
                className="text-sm font-bold text-[var(--color-title)]"
              >
                Datos del solicitante
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              <FormField label="Nombre completo" htmlFor="modal-nombre" required>
                <Input
                  id="modal-nombre"
                  type="text"
                  placeholder="Ingrese el nombre completo"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  prefix={<User size={15} />}
                />
              </FormField>
              <FormField label="Celular" htmlFor="modal-celular" required>
                <Input
                  id="modal-celular"
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="Ingrese el número de celular"
                  value={celular}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                    setCelular(val);
                  }}
                  prefix={<Phone size={15} />}
                />
              </FormField>
              <FormField label="Correo" htmlFor="modal-correo" required>
                <Input
                  id="modal-correo"
                  type="email"
                  placeholder="Ingrese el correo electrónico"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  prefix={<Mail size={15} />}
                />
              </FormField>
            </div>
          </section>
        </div>

        {/* Footer del modal */}
        <div className="flex justify-end gap-3 px-8 py-4 border-t border-[var(--color-border)]">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!isFormValid}
            onClick={handleSubmit}
            className="w-auto"
          >
            {isEditing ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal: Gestión de Usuarios ────────────────────────────

export function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  const loadUsuarios = () => {
    setUsuarios(getUsuarios());
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  // Filtrado por búsqueda
  const filteredUsuarios = useMemo(() => {
    if (!search.trim()) return usuarios;
    const term = search.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.username.toLowerCase().includes(term) ||
        u.nombreCompleto.toLowerCase().includes(term) ||
        u.empresa.toLowerCase().includes(term) ||
        u.correo.toLowerCase().includes(term) ||
        u.rol.toLowerCase().includes(term)
    );
  }, [usuarios, search]);

  const handleToggleActivo = (user: Usuario) => {
    const accion = user.activo ? "deshabilitar" : "habilitar";
    Swal.fire({
      icon: "warning",
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      text: `El usuario "${user.username}" será ${
        user.activo ? "deshabilitado y no podrá iniciar sesión" : "habilitado nuevamente"
      }.`,
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
      confirmButtonColor: user.activo
        ? "var(--color-danger)"
        : "var(--color-success)",
      cancelButtonColor: "var(--color-primary)",
    }).then((result) => {
      if (result.isConfirmed) {
        toggleUsuarioActivo(user.id);
        loadUsuarios();
        Swal.fire({
          icon: "success",
          title: user.activo ? "Usuario deshabilitado" : "Usuario habilitado",
          text: `"${user.username}" ha sido ${
            user.activo ? "deshabilitado" : "habilitado"
          }.`,
          confirmButtonColor: "var(--color-primary)",
        });
      }
    });
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Encabezado de página ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[var(--color-primary-light)] rounded-xl">
            <Users size={28} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-title)] leading-tight">
              Usuarios
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              Gestiona los usuarios del sistema, sus roles y datos generales.
            </p>
          </div>
        </div>

        <div className="max-w-fit">
          <Button
            type="button"
            variant="primary"
            onClick={handleCreate}
          >
            <Plus size={18} />
            Crear usuario
          </Button>
        </div>
      </div>

      {/* ── Card tabla ── */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
        {/* Barra de búsqueda */}
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <div className="max-w-sm">
            <Input
              type="text"
              placeholder="Buscar por nombre, usuario, empresa o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search size={15} />}
            />
          </div>
        </div>

        {/* Tabla o estado vacío */}
        {filteredUsuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-[var(--color-primary-light)] rounded-full mb-4">
              <Users
                size={40}
                className="text-[var(--color-primary)]"
                strokeWidth={1.5}
              />
            </div>
            <h2 className="text-lg font-bold text-[var(--color-title)] mb-1">
              {search.trim()
                ? "No se encontraron resultados"
                : "No hay usuarios registrados"}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
              {search.trim()
                ? "Intenta con otro término de búsqueda."
                : 'Crea un usuario usando el botón "Crear usuario".'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <User size={13} /> Usuario
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    Nombre completo
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} /> Empresa
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} /> Sede
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} /> Creado
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((user) => (
                  <tr
                    key={user.id}
                    className={`
                      border-b border-[var(--color-border)]/50
                      transition-colors duration-100
                      ${user.activo
                        ? "hover:bg-[var(--color-primary-light)]/30"
                        : "opacity-60 bg-[var(--color-bg-disabled)]/50"
                      }
                    `}
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-primary)]">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-title)]">
                      {user.nombreCompleto}
                    </td>
                    <td className="px-4 py-3">
                      <RolBadge rol={user.rol} />
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {user.empresa}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {getSedeLabel(user.sede)}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge activo={user.activo} />
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {new Date(user.fechaCreacion).toLocaleDateString(
                        "es-PE",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md
                            text-xs font-semibold
                            text-[var(--color-primary)] bg-[var(--color-primary-light)]
                            border border-[var(--color-primary)]/15
                            cursor-pointer transition-all duration-150
                            hover:bg-[var(--color-primary)] hover:text-white
                          "
                          aria-label={`Editar usuario ${user.username}`}
                        >
                          <Pencil size={13} />
                          Editar
                        </button>

                        {/* Toggle activo/inactivo */}
                        <button
                          type="button"
                          onClick={() => handleToggleActivo(user)}
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md
                            text-xs font-semibold
                            border cursor-pointer transition-all duration-150
                            ${
                              user.activo
                                ? "text-[var(--color-danger)] bg-red-50 border-[var(--color-danger)]/15 hover:bg-[var(--color-danger)] hover:text-white"
                                : "text-[var(--color-success)] bg-green-50 border-[var(--color-success)]/15 hover:bg-[var(--color-success)] hover:text-white"
                            }
                          `}
                          aria-label={`${
                            user.activo ? "Deshabilitar" : "Habilitar"
                          } usuario ${user.username}`}
                        >
                          {user.activo ? (
                            <>
                              <EyeOff size={13} /> Inhabilitar
                            </>
                          ) : (
                            <>
                              <Eye size={13} /> Habilitar
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer con conteo */}
        {filteredUsuarios.length > 0 && (
          <div className="px-4 py-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
            Mostrando {filteredUsuarios.length} de {usuarios.length} usuario
            {usuarios.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── Modal de creación / edición ── */}
      <UsuarioFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        onSaved={loadUsuarios}
        editingUser={editingUser}
      />
    </div>
  );
}
