import { FileText, Upload, Plus, Trash2, ShieldCheck, FlaskConical, Gauge, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";

export interface RequisitoData {
  archivo: File | null;
  fechaEmision: string;
}

export interface DocumentoMultiItem {
  id: string;
  nombre: string;
  archivo: File | null;
  fecha?: string;
}

export interface StepRequisitosGeneralesData {
  clasificacion: "TAR" | "NO_TAR" | "";
  serviciosSeleccionados?: string[];
  casosEspecialesSeleccionados?: string[];
  requisitos: Record<string, RequisitoData>;
  fichasEpp?: DocumentoMultiItem[];
  especificacionesQuimicos?: DocumentoMultiItem[];
  certificadosCalibracion?: DocumentoMultiItem[];
}

interface StepRequisitosGeneralesProps {
  data: StepRequisitosGeneralesData;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

const REQUISITOS_NO_TAR = [
  { id: "iperc", label: "Matriz IPERC" },
  { id: "difusion_iperc", label: "Registro de difusión Matriz IPERC" },
  { id: "directorio", label: "Directorio telefónico en caso de emergencia y red de clínicas cercanas" },
  { id: "matriz_aspectos", label: "Matriz de aspectos e impactos ambientales de la actividad a realizar" },
];

const REQUISITOS_TAR_EXTRAS = [
  { id: "pets", label: "PETS (Procedimiento escrito de trabajo seguro)" },
  { id: "difusion_pets", label: "Registro de difusión de PETS" },
  { id: "plan_emergencia", label: "Plan de Emergencia de acuerdo al servicio" },
  { id: "lista_epp", label: "Lista de EPP" },
];

export function StepRequisitosGenerales({ data, setData }: StepRequisitosGeneralesProps) {
  const isTar = data.clasificacion === "TAR";
  const isMatpel = (data.serviciosSeleccionados || []).includes("matpel");
  const isMedicion = (data.casosEspecialesSeleccionados || []).some((c) =>
    ["espacio_medidor_gas", "electricos_medicion"].includes(c)
  );

  const requisitosBaseParaMostrar = isTar
    ? [...REQUISITOS_NO_TAR, ...REQUISITOS_TAR_EXTRAS]
    : [...REQUISITOS_NO_TAR];

  if (isTar) {
    const isAndamio = (data.casosEspecialesSeleccionados || []).includes("altura_andamio");
    const isPlataforma = (data.casosEspecialesSeleccionados || []).includes("altura_plataforma");

    if (isAndamio) {
      requisitosBaseParaMostrar.push({ id: "ensayo_andamio", label: "Ensayo mecánico de andamio" });
    }
    if (isPlataforma) {
      requisitosBaseParaMostrar.push({ id: "cert_operatividad_plataforma", label: "Certificado de operatividad de la plataforma" });
      requisitosBaseParaMostrar.push({ id: "seguro_resp_civil", label: "Seguro de responsabilidad civil o DDJJ" });
    }
  }

  // Manejo de requisitos fijos
  const handleChangeFecha = (id: string, fecha: string) => {
    setData((prev: any) => ({
      ...prev,
      requisitos: {
        ...prev.requisitos,
        [id]: {
          ...prev.requisitos?.[id],
          fechaEmision: fecha,
        },
      },
    }));
  };

  const handleFileChange = (id: string, file: File | null) => {
    setData((prev: any) => ({
      ...prev,
      requisitos: {
        ...prev.requisitos,
        [id]: {
          ...prev.requisitos?.[id],
          archivo: file,
        },
      },
    }));
  };

  // ── Handlers para Fichas de EPP (uno o más) ──
  const fichasEppList = data.fichasEpp || [{ id: "epp-1", nombre: "", archivo: null }];

  const handleAddFichaEpp = () => {
    const newItem: DocumentoMultiItem = {
      id: `epp-${Date.now()}`,
      nombre: "",
      archivo: null,
    };
    setData((prev: any) => ({
      ...prev,
      fichasEpp: [...(prev.fichasEpp || []), newItem],
    }));
  };

  const handleRemoveFichaEpp = (id: string) => {
    setData((prev: any) => {
      const current = prev.fichasEpp || [];
      if (current.length <= 1) {
        return {
          ...prev,
          fichasEpp: [{ id: `epp-${Date.now()}`, nombre: "", archivo: null }],
        };
      }
      return {
        ...prev,
        fichasEpp: current.filter((item: DocumentoMultiItem) => item.id !== id),
      };
    });
  };

  const handleUpdateFichaEpp = (id: string, updates: Partial<DocumentoMultiItem>) => {
    setData((prev: any) => ({
      ...prev,
      fichasEpp: (prev.fichasEpp || []).map((item: DocumentoMultiItem) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  // ── Handlers para Especificaciones por Químico (uno o más) ──
  const especificacionesQuimicosList = data.especificacionesQuimicos || [
    { id: "quim-1", nombre: "", archivo: null },
  ];

  const handleAddQuimico = () => {
    const newItem: DocumentoMultiItem = {
      id: `quim-${Date.now()}`,
      nombre: "",
      archivo: null,
    };
    setData((prev: any) => ({
      ...prev,
      especificacionesQuimicos: [...(prev.especificacionesQuimicos || []), newItem],
    }));
  };

  const handleRemoveQuimico = (id: string) => {
    setData((prev: any) => {
      const current = prev.especificacionesQuimicos || [];
      if (current.length <= 1) {
        return {
          ...prev,
          especificacionesQuimicos: [{ id: `quim-${Date.now()}`, nombre: "", archivo: null }],
        };
      }
      return {
        ...prev,
        especificacionesQuimicos: current.filter((item: DocumentoMultiItem) => item.id !== id),
      };
    });
  };

  const handleUpdateQuimico = (id: string, updates: Partial<DocumentoMultiItem>) => {
    setData((prev: any) => ({
      ...prev,
      especificacionesQuimicos: (prev.especificacionesQuimicos || []).map((item: DocumentoMultiItem) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  // ── Handlers para Certificados de Calibración por Equipo de Medición (uno o más) ──
  const certificadosCalibracionList = data.certificadosCalibracion || [
    { id: "cal-1", nombre: "", archivo: null, fecha: "" },
  ];

  const handleAddCertificado = () => {
    const newItem: DocumentoMultiItem = {
      id: `cal-${Date.now()}`,
      nombre: "",
      archivo: null,
      fecha: "",
    };
    setData((prev: any) => ({
      ...prev,
      certificadosCalibracion: [...(prev.certificadosCalibracion || []), newItem],
    }));
  };

  const handleRemoveCertificado = (id: string) => {
    setData((prev: any) => {
      const current = prev.certificadosCalibracion || [];
      if (current.length <= 1) {
        return {
          ...prev,
          certificadosCalibracion: [{ id: `cal-${Date.now()}`, nombre: "", archivo: null, fecha: "" }],
        };
      }
      return {
        ...prev,
        certificadosCalibracion: current.filter((item: DocumentoMultiItem) => item.id !== id),
      };
    });
  };

  const handleUpdateCertificado = (id: string, updates: Partial<DocumentoMultiItem>) => {
    setData((prev: any) => ({
      ...prev,
      certificadosCalibracion: (prev.certificadosCalibracion || []).map((item: DocumentoMultiItem) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  return (
    <section className="px-8 py-6 flex flex-col gap-6">
      {/* ── Encabezado ── */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-[var(--color-title)] flex items-center gap-2">
          Requisitos Generales {isTar ? "(TAR)" : "(No TAR)"}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Adjunta los documentos requeridos y registra las fechas de emisión correspondientes.
        </p>
      </div>

      {/* ── Documentos Base Obligatorios ── */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Documentación base ({requisitosBaseParaMostrar.length} requeridos)
        </span>

        <div className="flex flex-col gap-3">
          {requisitosBaseParaMostrar.map((req) => {
            const docData = data.requisitos?.[req.id] || { fechaEmision: "", archivo: null };

            return (
              <div
                key={req.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-white shadow-sm hover:border-[var(--color-secondary)]/50 transition-colors"
              >
                {/* Icono de documento */}
                <div className="shrink-0 text-[var(--color-primary)]">
                  <FileText size={30} strokeWidth={1.5} />
                </div>

                {/* Título y botón cargar */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--color-primary)] mb-2 pr-2 leading-tight" title={req.label}>
                    {req.label}
                  </p>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-primary-light)]/50 hover:bg-[var(--color-primary-light)] text-sm font-medium text-[var(--color-primary)] transition-colors">
                      <Upload size={14} />
                      <span className="max-w-[200px] truncate">
                        {docData.archivo ? docData.archivo.name : "Cargar archivo"}
                      </span>
                      <input
                        type="file"
                        accept={["iperc", "difusion_iperc", "matriz_aspectos", "pets", "difusion_pets"].includes(req.id) ? ".pdf,.xls,.xlsx" : ".pdf"}
                        className="hidden"
                        onChange={(e) => handleFileChange(req.id, e.target.files?.[0] || null)}
                      />
                    </label>
                    {docData.archivo && (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-success)] font-medium">
                        <CheckCircle2 size={13} /> Cargado
                      </span>
                    )}
                  </div>
                </div>

                {/* Input de Fecha de Emisión */}
                {req.id !== "lista_epp" && (
                  <div className="w-48 shrink-0 flex flex-col gap-1.5">
                    <label
                      htmlFor={`fecha-${req.id}`}
                      className="text-xs font-semibold text-[var(--color-text-secondary)]"
                    >
                      Fecha de emisión <span className="text-[var(--color-danger)]">*</span>
                    </label>
                    <Input
                      id={`fecha-${req.id}`}
                      type="date"
                      value={docData.fechaEmision ?? ""}
                      onChange={(e) => handleChangeFecha(req.id, e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECCIÓN DINÁMICA 1: Fichas Técnicas de EPP (Uno o más) ── */}
      {isTar && (
        <div className="flex flex-col gap-3 pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-[var(--color-primary)]" />
              <div>
                <h3 className="text-sm font-bold text-[var(--color-title)]">
                  Fichas técnicas de EPP <span className="text-xs font-normal text-[var(--color-text-secondary)]">(una por cada EPP)</span>
                  <span className="text-[var(--color-danger)] ml-0.5">*</span>
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Agrega las fichas técnicas individuales para cada equipo de protección personal requerido.
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              {fichasEppList.length} {fichasEppList.length === 1 ? "EPP" : "EPPs"}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {fichasEppList.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--color-border)] bg-white shadow-sm"
              >
                <span className="w-7 h-7 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>

                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Nombre o tipo de EPP (ej. Arnés de cuerpo entero, Casco dieléctrico...)"
                    value={item.nombre}
                    onChange={(e) => handleUpdateFichaEpp(item.id, { nombre: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-primary-light)]/40 hover:bg-[var(--color-primary-light)] text-xs font-medium text-[var(--color-primary)] transition-colors">
                    <Upload size={14} />
                    <span className="max-w-[160px] truncate">
                      {item.archivo ? item.archivo.name : "Cargar ficha PDF"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleUpdateFichaEpp(item.id, { archivo: e.target.files?.[0] || null })}
                    />
                  </label>
                  {item.archivo && (
                    <span className="text-[var(--color-success)]" title="Archivo cargado">
                      <CheckCircle2 size={16} />
                    </span>
                  )}
                </div>

                {fichasEppList.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    className="p-2 h-9 w-9 shrink-0 text-white"
                    onClick={() => handleRemoveFichaEpp(item.id)}
                    aria-label={`Eliminar ficha de EPP ${index + 1}`}
                  >
                    <Trash2 size={15} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddFichaEpp}
              className="text-xs font-semibold inline-flex items-center gap-1.5 border-dashed border-[var(--color-primary)]/40 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            >
              <Plus size={15} /> Añadir otro EPP
            </Button>
          </div>
        </div>
      )}

      {/* ── SECCIÓN DINÁMICA 2: Especificaciones por cada Químico (Uno o más) ── */}
      {isMatpel && (
        <div className="flex flex-col gap-3 pt-4 border-t border-[var(--color-border)] [animation:card-in_0.3s_ease-out_both]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical size={20} className="text-[var(--color-warning)]" />
              <div>
                <h3 className="text-sm font-bold text-[var(--color-title)]">
                  Especificaciones por cada químico <span className="text-xs font-normal text-[var(--color-text-secondary)]">(HDS / Ficha técnica por sustancia)</span>
                  <span className="text-[var(--color-danger)] ml-0.5">*</span>
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Requerido por seleccionar <strong>MATERIALES PELIGROSOS MATPEL</strong>. Adjunta las especificaciones técnicas u Hojas de Datos de Seguridad de cada químico.
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-[var(--color-warning)] border border-amber-200">
              {especificacionesQuimicosList.length} {especificacionesQuimicosList.length === 1 ? "Químico" : "Químicos"}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {especificacionesQuimicosList.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-sm"
              >
                <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>

                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Nombre del producto químico o sustancia peligrosa (ej. Solvente X, Ácido Y...)"
                    value={item.nombre}
                    onChange={(e) => handleUpdateQuimico(item.id, { nombre: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-soft)] text-xs font-medium text-[var(--color-title)] transition-colors">
                    <Upload size={14} />
                    <span className="max-w-[160px] truncate">
                      {item.archivo ? item.archivo.name : "Cargar especificación PDF"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleUpdateQuimico(item.id, { archivo: e.target.files?.[0] || null })}
                    />
                  </label>
                  {item.archivo && (
                    <span className="text-[var(--color-success)]" title="Archivo cargado">
                      <CheckCircle2 size={16} />
                    </span>
                  )}
                </div>

                {especificacionesQuimicosList.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    className="p-2 h-9 w-9 shrink-0 text-white"
                    onClick={() => handleRemoveQuimico(item.id)}
                    aria-label={`Eliminar químico ${index + 1}`}
                  >
                    <Trash2 size={15} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddQuimico}
              className="text-xs font-semibold inline-flex items-center gap-1.5 border-dashed border-amber-400 text-amber-800 hover:bg-amber-50"
            >
              <Plus size={15} /> Añadir otro químico
            </Button>
          </div>
        </div>
      )}

      {/* ── SECCIÓN DINÁMICA 3: Certificados de Calibración por Equipo de Medición (Uno o más) ── */}
      {isMedicion && (
        <div className="flex flex-col gap-3 pt-4 border-t border-[var(--color-border)] [animation:card-in_0.3s_ease-out_both]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge size={20} className="text-[var(--color-secondary)]" />
              <div>
                <h3 className="text-sm font-bold text-[var(--color-title)]">
                  Certificados de calibración por cada equipo de medición
                  <span className="text-[var(--color-danger)] ml-0.5">*</span>
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Requerido por uso de equipos de medición o medidores de gas. Adjunta el certificado de calibración vigente por cada instrumento.
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-[var(--color-secondary)] border border-blue-200">
              {certificadosCalibracionList.length} {certificadosCalibracionList.length === 1 ? "Equipo" : "Equipos"}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {certificadosCalibracionList.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3.5 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-sm"
              >
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 md:w-64">
                    <Input
                      placeholder="Nombre/modelo del equipo (ej. Medidor multigas 4XR)"
                      value={item.nombre}
                      onChange={(e) => handleUpdateCertificado(item.id, { nombre: e.target.value })}
                    />
                  </div>
                </div>

                <div className="w-full md:w-44 shrink-0">
                  <Input
                    type="date"
                    value={item.fecha || ""}
                    onChange={(e) => handleUpdateCertificado(item.id, { fecha: e.target.value })}
                    placeholder="Fecha de calibración"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white hover:bg-[var(--color-bg-soft)] text-xs font-medium text-[var(--color-title)] transition-colors">
                    <Upload size={14} />
                    <span className="max-w-[150px] truncate">
                      {item.archivo ? item.archivo.name : "Certificado PDF"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleUpdateCertificado(item.id, { archivo: e.target.files?.[0] || null })}
                    />
                  </label>
                  {item.archivo && (
                    <span className="text-[var(--color-success)]" title="Archivo cargado">
                      <CheckCircle2 size={16} />
                    </span>
                  )}

                  {certificadosCalibracionList.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      className="p-2 h-9 w-9 shrink-0 text-white"
                      onClick={() => handleRemoveCertificado(item.id)}
                      aria-label={`Eliminar equipo ${index + 1}`}
                    >
                      <Trash2 size={15} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCertificado}
              className="text-xs font-semibold inline-flex items-center gap-1.5 border-dashed border-blue-400 text-blue-800 hover:bg-blue-50"
            >
              <Plus size={15} /> Añadir otro equipo de medición
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

