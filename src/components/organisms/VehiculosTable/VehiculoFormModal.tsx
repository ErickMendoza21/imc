import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Vehiculo } from "@/lib/services/vehiculos";

interface VehiculoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehiculo: Omit<Vehiculo, "id" | "creadoPor">) => void;
  vehiculoToEdit: Vehiculo | null;
}

export function VehiculoFormModal({ isOpen, onClose, onSave, vehiculoToEdit }: VehiculoFormModalProps) {
  const [formData, setFormData] = useState({
    marca: "",
    color: "",
    placa: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (vehiculoToEdit) {
        setFormData({
          marca: vehiculoToEdit.marca,
          color: vehiculoToEdit.color,
          placa: vehiculoToEdit.placa,
        });
      } else {
        setFormData({ marca: "", color: "", placa: "" });
      }
    }
  }, [isOpen, vehiculoToEdit]);

  if (!isOpen) return null;

  const isFormValid = formData.marca.trim() !== "" && formData.color.trim() !== "" && formData.placa.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-full">
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-title)]">
            {vehiculoToEdit ? "Editar Vehículo" : "Registrar Vehículo"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-soft)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <form id="vehiculo-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="marca" className="text-sm font-semibold text-[var(--color-title)]">
                Marca del vehículo
              </label>
              <Input
                id="marca"
                placeholder="Ej. Toyota"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="color" className="text-sm font-semibold text-[var(--color-title)]">
                Color
              </label>
              <Input
                id="color"
                placeholder="Ej. Blanco"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="placa" className="text-sm font-semibold text-[var(--color-title)]">
                Código / Placa
              </label>
              <Input
                id="placa"
                placeholder="Ej. ABC-123"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
              />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-[var(--color-border)] bg-[var(--color-bg-soft)] flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form="vehiculo-form" disabled={!isFormValid}>
            Guardar Vehículo
          </Button>
        </div>
      </div>
    </div>
  );
}
