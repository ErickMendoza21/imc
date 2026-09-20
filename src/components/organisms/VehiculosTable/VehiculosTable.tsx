import { useState, useEffect, useRef } from "react";
import { Plus, Download, Upload, FileSpreadsheet, Trash2, Pencil, Car } from "lucide-react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

import { Button } from "@/components/atoms/Button";
import {
  Vehiculo,
  getVehiculosByUser,
  saveVehiculo,
  updateVehiculo,
  deleteVehiculo,
  saveVehiculosMasivo,
} from "@/lib/services/vehiculos";
import { VehiculoFormModal } from "./VehiculoFormModal";

export function VehiculosTable() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [username, setUsername] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehiculoToEdit, setVehiculoToEdit] = useState<Vehiculo | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) {
      setUsername(user);
      setVehiculos(getVehiculosByUser(user));
    }
  }, []);

  const refreshData = () => {
    if (username) {
      setVehiculos(getVehiculosByUser(username));
    }
  };

  const handleOpenModal = (vehiculo: Vehiculo | null = null) => {
    setVehiculoToEdit(vehiculo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVehiculoToEdit(null);
  };

  const handleSaveVehiculo = (data: Omit<Vehiculo, "id" | "creadoPor">) => {
    if (vehiculoToEdit) {
      updateVehiculo(vehiculoToEdit.id, data);
    } else {
      saveVehiculo({ ...data, creadoPor: username });
    }
    refreshData();
    handleCloseModal();
  };

  const handleDeleteVehiculo = (id: string) => {
    Swal.fire({
      icon: "warning",
      title: "¿Eliminar vehículo?",
      text: "No podrás revertir esta acción.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--color-danger)",
      cancelButtonColor: "var(--color-primary)",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteVehiculo(id);
        refreshData();
      }
    });
  };

  const handleExportExcel = () => {
    if (vehiculos.length === 0) {
      Swal.fire("Info", "No hay vehículos para exportar.", "info");
      return;
    }
    const dataToExport = vehiculos.map(({ marca, color, placa }) => ({
      Marca: marca,
      Color: color,
      Placa: placa,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vehículos");
    XLSX.writeFile(workbook, "vehiculos.xlsx");
  };

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{ Marca: "", Color: "", Placa: "" }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
    XLSX.writeFile(workbook, "plantilla_vehiculos.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const nuevosVehiculos: Omit<Vehiculo, "id">[] = [];
        data.forEach((row) => {
          if (row.Marca && row.Color && row.Placa) {
            nuevosVehiculos.push({
              marca: String(row.Marca),
              color: String(row.Color),
              placa: String(row.Placa),
              creadoPor: username,
            });
          }
        });

        if (nuevosVehiculos.length > 0) {
          saveVehiculosMasivo(nuevosVehiculos);
          refreshData();
          Swal.fire("Éxito", `Se importaron ${nuevosVehiculos.length} vehículos.`, "success");
        } else {
          Swal.fire("Error", "No se encontraron vehículos válidos en el archivo.", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Hubo un problema al leer el archivo Excel.", "error");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
      {/* ── Toolbar ── */}
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Registrar Vehículo
          </Button>

          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} />
            Importar Excel
          </Button>
          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImportExcel}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet size={16} className="text-green-600" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download size={16} />
            Plantilla
          </Button>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-soft)] text-[0.8125rem] text-[var(--color-text-secondary)] uppercase tracking-wider border-b border-[var(--color-border)]">
              <th className="px-6 py-4 font-semibold w-1/4">Placa / Código</th>
              <th className="px-6 py-4 font-semibold w-1/4">Marca</th>
              <th className="px-6 py-4 font-semibold w-1/4">Color</th>
              <th className="px-6 py-4 font-semibold text-right w-1/4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {vehiculos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-text-secondary)]">
                  <Car size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No tienes vehículos registrados.</p>
                </td>
              </tr>
            ) : (
              vehiculos.map((vehiculo) => (
                <tr
                  key={vehiculo.id}
                  className="hover:bg-[var(--color-bg-soft)] transition-colors text-[0.875rem] text-[var(--color-text)]"
                >
                  <td className="px-6 py-4 font-medium">{vehiculo.placa}</td>
                  <td className="px-6 py-4">{vehiculo.marca}</td>
                  <td className="px-6 py-4 capitalize">{vehiculo.color}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(vehiculo)}
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteVehiculo(vehiculo.id)}
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <VehiculoFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vehiculoToEdit={vehiculoToEdit}
        onSave={handleSaveVehiculo}
      />
    </div>
  );
}
