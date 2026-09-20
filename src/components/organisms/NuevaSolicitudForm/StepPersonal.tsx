import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Users, Upload, Trash2, UserPlus, Pencil, Search, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Vehiculo, getVehiculosByUser } from "@/lib/services/vehiculos";

export interface Persona {
  id: string;
  dni: string;
  nombre: string;
  vehiculoId?: string;
  documentos: Record<string, string>; // Key is doc ID, value is file name
}

export interface StepPersonalData {
  clasificacion: "TAR" | "NO_TAR" | "";
  personal: Persona[];
}

interface StepPersonalProps {
  data: StepPersonalData;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

const DOCS_NO_TAR = [
  { id: "induccion_sig", label: "Inducción SIG" },
  { id: "camo", label: "CAMO (Certificado de Aptitud Médica Ocupacional)" },
  { id: "risst", label: "Cargo de entrega de RISST" },
];

const DOCS_TAR_EXTRAS = [
  { id: "cert_capacitacion", label: "Certificado de capacitación (Alto riesgo)" },
  { id: "prevencionista", label: "Prevencionista / SSOMA" },
  { id: "registro_epp", label: "Registro de entrega de EPP" },
];

function SearchableVehicleSelect({ vehicles, value, onChange }: { vehicles: Vehiculo[], value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) {
      const selected = vehicles.find(v => v.id === value);
      setSearch(selected ? `${selected.placa} - ${selected.marca} (${selected.color})` : "");
    }
  }, [value, isOpen, vehicles]);

  const filteredVehicles = vehicles.filter(v => 
    v.placa.toLowerCase().includes(search.toLowerCase()) || 
    v.marca.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-[var(--color-border)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all bg-white"
          placeholder="Buscar o seleccionar vehículo..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (value) onChange(""); // Desvincula el vehículo si altera el texto manualmente
          }}
          onFocus={() => setIsOpen(true)}
        />
        {search && (
          <button 
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => { setSearch(""); onChange(""); setIsOpen(true); }}
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto py-1">
            <div 
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-[var(--color-bg-soft)] ${value === "" ? "bg-[var(--color-primary-light)]/50 text-[var(--color-primary)] font-medium" : ""}`}
              onClick={() => { onChange(""); setIsOpen(false); }}
            >
              -- Sin vehículo asignado --
            </div>
            {filteredVehicles.map(v => (
              <div
                key={v.id}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-[var(--color-bg-soft)] ${value === v.id ? "bg-[var(--color-primary-light)]/50 text-[var(--color-primary)] font-medium" : ""}`}
                onClick={() => { 
                  onChange(v.id); 
                  setIsOpen(false); 
                }}
              >
                {v.placa} - {v.marca} ({v.color})
              </div>
            ))}
            {filteredVehicles.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">No se encontraron vehículos</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function StepPersonal({ data, setData }: StepPersonalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<Vehiculo[]>([]);
  const [newPersona, setNewPersona] = useState<Persona>({
    id: "",
    dni: "",
    nombre: "",
    vehiculoId: "",
    documentos: {},
  });
  const [searchPersonal, setSearchPersonal] = useState("");

  // Cargar vehículos del usuario
  useState(() => {
    const user = localStorage.getItem("username");
    if (user) {
      setAvailableVehicles(getVehiculosByUser(user));
    }
  });

  const isTar = data.clasificacion === "TAR";
  const docsRequeridos = isTar ? [...DOCS_NO_TAR, ...DOCS_TAR_EXTRAS] : DOCS_NO_TAR;

  const isFormValid =
    newPersona.dni.length === 8 &&
    /^\d+$/.test(newPersona.dni) &&
    newPersona.nombre.trim() !== "" &&
    docsRequeridos.every((doc) => newPersona.documentos[doc.id]);

  const handleFileChange = (docId: string, file: File | null) => {
    if (file) {
      setNewPersona((prev) => ({
        ...prev,
        documentos: {
          ...prev.documentos,
          [docId]: file.name, // Solo se guarda el nombre del archivo
        },
      }));
    }
  };

  const handleAddPersona = () => {
    if (isFormValid) {
      setData((prev: any) => {
        const personal = prev.personal || [];
        const existingIndex = personal.findIndex((p: Persona) => p.id === newPersona.id);

        if (existingIndex !== -1) {
          const updated = [...personal];
          updated[existingIndex] = newPersona;
          return { ...prev, personal: updated };
        } else {
          return {
            ...prev,
            personal: [...personal, { ...newPersona, id: crypto.randomUUID() }],
          };
        }
      });
      setNewPersona({ id: "", dni: "", nombre: "", vehiculoId: "", documentos: {} });
      setIsAdding(false);
    }
  };

  const handleEditPersona = (persona: Persona) => {
    setNewPersona(persona);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setNewPersona({ id: "", dni: "", nombre: "", vehiculoId: "", documentos: {} });
    setIsAdding(false);
  };

  const handleRemovePersona = (id: string) => {
    Swal.fire({
      icon: "warning",
      title: "¿Eliminar a este personal?",
      text: "No podrás revertir esta acción.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--color-danger)",
      cancelButtonColor: "var(--color-primary)",
    }).then((result) => {
      if (result.isConfirmed) {
        setData((prev: any) => {
          const newPersonal = (prev.personal || []).filter((p: Persona) => p.id !== id);
          
          // Eliminar también de las asignaciones de Carga Masiva
          const newCargaMasiva = { ...prev.cargaMasiva };
          if (newCargaMasiva) {
            Object.keys(newCargaMasiva).forEach(docId => {
              newCargaMasiva[docId] = {
                ...newCargaMasiva[docId],
                personalIds: (newCargaMasiva[docId].personalIds || []).filter((pId: string) => pId !== id)
              };
            });
          }

          return {
            ...prev,
            personal: newPersonal,
            cargaMasiva: newCargaMasiva
          };
        });
      }
    });
  };

  return (
    <section className="px-8 py-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-lg font-bold text-[var(--color-title)]">
          Personal Asignado {isTar ? "(TAR)" : "(No TAR)"}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Añade al personal que realizará el trabajo y adjunta sus documentos obligatorios.
        </p>
      </div>

      {/* Buscador y Lista de Personal Actual */}
      {(data.personal || []).length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="relative w-full md:w-1/2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar personal por nombre o DNI..."
              value={searchPersonal}
              onChange={(e) => setSearchPersonal(e.target.value)}
            />
          </div>
          
          {(data.personal || [])
            .filter(p => 
              p.nombre.toLowerCase().includes(searchPersonal.toLowerCase()) || 
              p.dni.includes(searchPersonal)
            )
            .map((persona) => (
            <div
              key={persona.id}
              className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full text-[var(--color-primary)]">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-title)]">
                    {persona.nombre}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    DNI: {persona.dni} {persona.vehiculoId ? `| Vehículo asignado` : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className="text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                  onClick={() => handleEditPersona(persona)}
                >
                  <Pencil size={16} />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="text-[var(--color-danger)] border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition-colors"
                  onClick={() => handleRemovePersona(persona.id)}
                >
                  <Trash2 size={16} />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
          
          {(data.personal || []).filter(p => 
              p.nombre.toLowerCase().includes(searchPersonal.toLowerCase()) || 
              p.dni.includes(searchPersonal)
          ).length === 0 && (
            <p className="text-sm text-[var(--color-text-secondary)] text-center py-4">
              No se encontró personal con "{searchPersonal}"
            </p>
          )}
        </div>
      ) : (
        !isAdding && (
          <div className="p-8 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg-soft)]">
            <p className="text-[var(--color-text-secondary)] mb-4">
              No hay personal añadido todavía.
            </p>
          </div>
        )
      )}

      {/* Formulario para Añadir Personal */}
      {isAdding ? (
        <div className="p-6 rounded-xl border border-[var(--color-border)] bg-white shadow-sm flex flex-col gap-5">
          <h3 className="text-md font-bold text-[var(--color-primary)]">
            {newPersona.id ? "Editar Miembro del Personal" : "Nuevo Miembro del Personal"}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">DNI</label>
              <Input
                placeholder="Ej. 12345678"
                value={newPersona.dni}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || (/^\d+$/.test(val) && val.length <= 8)) {
                    setNewPersona({ ...newPersona, dni: val });
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Nombre Completo</label>
              <Input
                placeholder="Ej. Juan Pérez"
                value={newPersona.nombre}
                onChange={(e) => setNewPersona({ ...newPersona, nombre: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Vehículo (Opcional)</label>
            <SearchableVehicleSelect 
              vehicles={availableVehicles}
              value={newPersona.vehiculoId || ""}
              onChange={(val) => setNewPersona({ ...newPersona, vehiculoId: val })}
            />
            {availableVehicles.length === 0 && (
              <p className="text-[10px] text-[var(--color-text-secondary)]">
                No tienes vehículos registrados. Puedes registrarlos en la sección de Vehículos.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
              Documentos Obligatorios
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {docsRequeridos.map((doc) => (
                <div key={doc.id} className="flex flex-col gap-2 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--color-title)] pr-2 leading-tight flex-1" title={doc.label}>
                      {doc.label}
                    </span>
                    <label className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary-light)] text-xs font-medium text-[var(--color-primary)] transition-colors">
                      <Upload size={12} />
                      {newPersona.documentos[doc.id] ? "Cambiar" : "Cargar"}
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  {newPersona.documentos[doc.id] && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] font-medium text-[var(--color-primary)] truncate max-w-full" title={newPersona.documentos[doc.id]}>
                        ✓ {newPersona.documentos[doc.id]}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" type="button" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="primary" type="button" disabled={!isFormValid} onClick={handleAddPersona}>
              Guardar Personal
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-2 py-6 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          onClick={() => setIsAdding(true)}
        >
          <UserPlus size={18} className="mr-2" />
          Añadir Personal
        </Button>
      )}
    </section>
  );
}
