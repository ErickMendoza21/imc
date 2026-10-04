"use client";

import { useState, useEffect, useMemo } from "react";
import { X, MapPin, Hash, AlignLeft } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { Sede } from "@/lib/services/sedes";

interface SedeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { nombre: string; codigo: string; direccion?: string; descripcion?: string }) => void;
  sedeToEdit: Sede | null;
}

export function SedeFormModal({ isOpen, onClose, onSave, sedeToEdit }: SedeFormModalProps) {
  const isEditing = sedeToEdit !== null;

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (sedeToEdit) {
        setNombre(sedeToEdit.nombre);
        setCodigo(sedeToEdit.codigo);
        setDireccion(sedeToEdit.direccion || "");
        setDescripcion(sedeToEdit.descripcion || "");
      } else {
        setNombre("");
        setCodigo("");
        setDireccion("");
        setDescripcion("");
      }
    }
  }, [isOpen, sedeToEdit]);

  const isDirty = useMemo(() => {
    if (sedeToEdit) {
      return (
        nombre !== sedeToEdit.nombre ||
        codigo !== sedeToEdit.codigo ||
        direccion !== (sedeToEdit.direccion || "") ||
        descripcion !== (sedeToEdit.descripcion || "")
      );
    }
    return nombre !== "" || codigo !== "" || direccion !== "" || descripcion !== "";
  }, [nombre, codigo, direccion, descripcion, sedeToEdit]);

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

  const isFormValid = nombre.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onSave({
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      direccion: direccion.trim(),
      descripcion: descripcion.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 bg-white rounded-2xl border border-[var(--color-border)] shadow-[0_25px_60px_-12px_rgba(13,71,181,0.25)] w-full max-w-lg overflow-hidden flex flex-col [animation:card-in_0.3s_cubic-bezier(0.16,1,0.3,1)_both]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary-light)] rounded-lg text-[var(--color-primary)]">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-title)]">
                {isEditing ? "Editar sede" : "Registrar nueva sede"}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {isEditing
                  ? "Modifica la información de la sede."
                  : "Ingresa los datos para registrar una sede disponible en el sistema."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors cursor-pointer border-none bg-transparent"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <FormField label="Nombre de la sede" htmlFor="sede-nombre" required>
            <Input
              id="sede-nombre"
              type="text"
              placeholder="Ej. Sede Central, Sede Callao..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              prefix={<MapPin size={15} />}
              required
            />
          </FormField>

          <FormField label="Código de identificación" htmlFor="sede-codigo">
            <Input
              id="sede-codigo"
              type="text"
              placeholder={isEditing ? "Ej. SED-001" : "Opcional (se autogenera si se deja vacío)"}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              prefix={<Hash size={15} />}
            />
          </FormField>

          <FormField label="Dirección o ubicación" htmlFor="sede-direccion">
            <Input
              id="sede-direccion"
              type="text"
              placeholder="Ej. Av. Nicolás de Piérola 450, Lima"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              prefix={<MapPin size={15} />}
            />
          </FormField>

          <FormField label="Descripción o notas" htmlFor="sede-descripcion">
            <Textarea
              id="sede-descripcion"
              placeholder="Detalles sobre las instalaciones, accesos u operaciones..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              prefix={<AlignLeft size={15} />}
              rows={3}
            />
          </FormField>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isFormValid}
              className="w-auto"
            >
              {isEditing ? "Guardar cambios" : "Registrar sede"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
