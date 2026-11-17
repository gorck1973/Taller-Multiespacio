import { X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
  Tool,
  ToolCategory,
  ToolLocationZone,
  ToolStatus,
} from '../types/workshop';

interface ToolFormModalProps {
  isOpen: boolean;
  editingTool: Tool | null;
  onClose: () => void;
  onSave: (data: Omit<Tool, 'id' | 'createdAt'>, existingId?: string) => void;
}

const CATEGORIES: ToolCategory[] = [
  'Eléctricas',
  'Manuales',
  'Medición',
  'Jardinería',
  'Ferretería',
];

const ZONES: ToolLocationZone[] = [
  'Garaje',
  'Caja de herramientas',
  'Bodega',
];

export function ToolFormModal({
  isOpen,
  editingTool,
  onClose,
  onSave,
}: ToolFormModalProps) {
  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [categoria, setCategoria] = useState<ToolCategory>('Eléctricas');
  const [ubicacionZona, setUbicacionZona] = useState<ToolLocationZone>('Garaje');
  const [ubicacionExacta, setUbicacionExacta] = useState('');
  const [estado, setEstado] = useState<ToolStatus>('Disponible');
  const [prestadaA, setPrestadaA] = useState('');
  const [fechaPrestamo, setFechaPrestamo] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (editingTool) {
      setNombre(editingTool.nombre);
      setMarca(editingTool.marca);
      setModelo(editingTool.modelo);
      setCategoria(editingTool.categoria);
      setUbicacionZona(editingTool.ubicacionZona);
      setUbicacionExacta(editingTool.ubicacionExacta);
      setEstado(editingTool.estado);
      setPrestadaA(editingTool.prestadaA || '');
      setFechaPrestamo(
        editingTool.fechaPrestamo || new Date().toISOString().split('T')[0]
      );
    } else {
      setNombre('');
      setMarca('');
      setModelo('');
      setCategoria('Eléctricas');
      setUbicacionZona('Garaje');
      setUbicacionExacta('');
      setEstado('Disponible');
      setPrestadaA('');
      setFechaPrestamo(new Date().toISOString().split('T')[0]);
    }
  }, [editingTool, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !marca.trim()) return;

    onSave(
      {
        nombre: nombre.trim(),
        marca: marca.trim(),
        modelo: modelo.trim() || 'S/M',
        categoria,
        ubicacionZona,
        ubicacionExacta: ubicacionExacta.trim() || ubicacionZona,
        estado,
        prestadaA: estado === 'Prestada' ? prestadaA.trim() : undefined,
        fechaPrestamo: estado === 'Prestada' ? fechaPrestamo : undefined,
      },
      editingTool?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tool-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-[#2E3440] dark:bg-[#1E2229]">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-[#2A303A]">
          <h2
            id="tool-modal-title"
            className="font-display text-xl font-bold text-gray-950 dark:text-white"
          >
            {editingTool ? 'Editar herramienta' : 'Nueva herramienta'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#2A303A] dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="tool-name"
              className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
            >
              Nombre de la herramienta *
            </label>
            <input
              id="tool-name"
              type="text"
              required
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Sierra Circular 7-1/4"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="tool-brand"
                className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                Marca *
              </label>
              <input
                id="tool-brand"
                type="text"
                required
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej. Bosch, DeWalt, Makita"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="tool-model"
                className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                Modelo / Código
              </label>
              <input
                id="tool-model"
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ej. GKS 190"
                className="font-mono w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="tool-category"
                className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                Categoría
              </label>
              <select
                id="tool-category"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as ToolCategory)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-950 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tool-zone"
                className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                Zona principal
              </label>
              <select
                id="tool-zone"
                value={ubicacionZona}
                onChange={(e) =>
                  setUbicacionZona(e.target.value as ToolLocationZone)
                }
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-950 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white"
              >
                {ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="tool-exact-location"
              className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
            >
              Ubicación exacta
            </label>
            <input
              id="tool-exact-location"
              type="text"
              value={ubicacionExacta}
              onChange={(e) => setUbicacionExacta(e.target.value)}
              placeholder="Ej. Estante metálico B · Bandeja inferior"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Estado actual
            </span>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-[#323946] dark:bg-[#121417]">
              {(['Disponible', 'Prestada'] as ToolStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setEstado(status)}
                  className={`rounded-md py-2 text-sm font-medium transition-colors ${
                    estado === status
                      ? 'bg-white text-gray-950 shadow-xs dark:bg-[#252A33] dark:text-white'
                      : 'text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {estado === 'Prestada' && (
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="tool-borrower"
                  className="mb-1 block text-xs font-semibold text-amber-900 dark:text-amber-300"
                >
                  Prestada a *
                </label>
                <input
                  id="tool-borrower"
                  type="text"
                  required
                  value={prestadaA}
                  onChange={(e) => setPrestadaA(e.target.value)}
                  placeholder="Nombre de quien la tiene"
                  className="w-full rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-gray-950 focus:border-[#F59E0B] focus:outline-none dark:bg-[#121417] dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="tool-loan-date"
                  className="mb-1 block text-xs font-semibold text-amber-900 dark:text-amber-300"
                >
                  Fecha
                </label>
                <input
                  id="tool-loan-date"
                  type="date"
                  value={fechaPrestamo}
                  onChange={(e) => setFechaPrestamo(e.target.value)}
                  className="font-mono w-full rounded-lg border border-amber-500/40 bg-white px-3 py-2 text-sm text-gray-950 focus:border-[#F59E0B] focus:outline-none dark:bg-[#121417] dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-[#2A303A]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-[#323946] dark:text-gray-300 dark:hover:bg-[#252A33]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#F59E0B] px-5 py-2 text-sm font-semibold text-[#121417] transition-colors hover:bg-[#D97706] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]"
            >
              {editingTool ? 'Guardar cambios' : 'Agregar herramienta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
