import { Camera, ImagePlus, Trash2, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import {
  Tool,
  ToolCategory,
  ToolIconId,
  ToolLocationZone,
  ToolStatus,
} from '../types/workshop';
import { compressToolPhoto } from '../utils/imageCompressor';
import {
  inferToolIcon,
  normalizeToolIconId,
  TOOL_ICON_OPTIONS,
  ToolIcon,
} from './ToolIcon';

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
  const [icono, setIcono] = useState<ToolIconId | undefined>(undefined);
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [photoInfo, setPhotoInfo] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
      setIcono(normalizeToolIconId(editingTool.icono));
      setFoto(editingTool.foto);
      setPhotoInfo(editingTool.foto ? 'Imagen guardada' : null);
      setPhotoError(null);
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
      setIcono(undefined);
      setFoto(undefined);
      setPhotoInfo(null);
      setPhotoError(null);
    }
  }, [editingTool, isOpen]);

  if (!isOpen) return null;

  const effectiveIcon: ToolIconId = icono || inferToolIcon(nombre, categoria);
  const activeIconLabel =
    TOOL_ICON_OPTIONS.find((opt) => opt.id === effectiveIcon)?.label ??
    'General';

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    setCompressing(true);
    try {
      const result = await compressToolPhoto(file);
      setFoto(result.dataUrl);
      setPhotoInfo(`Optimizada · ${result.sizeKB} KB`);
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : 'Error al procesar la foto.'
      );
    } finally {
      setCompressing(false);
      e.target.value = '';
    }
  };

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
        icono,
        foto,
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

          {/* Identificador visual: Imagen/Foto miniatura opcional o Ícono industrial */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-3.5 dark:border-[#2E3440] dark:bg-[#14171C]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Ícono o foto miniatura
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {foto
                  ? 'Mostrando imagen'
                  : `${activeIconLabel}${icono ? '' : ' (auto)'}`}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-700 dark:border-[#323946] dark:bg-[#1E2229] dark:text-[#F59E0B]">
                {foto ? (
                  <img
                    src={foto}
                    alt={nombre || 'Vista previa'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ToolIcon icon={effectiveIcon} className="h-7 w-7" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={compressing}
                    onClick={() => galleryInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 transition-colors hover:border-[#F59E0B] hover:text-gray-950 disabled:opacity-60 dark:border-[#323946] dark:bg-[#1E2229] dark:text-gray-200 dark:hover:border-[#F59E0B]"
                  >
                    <ImagePlus className="h-3.5 w-3.5 text-[#F59E0B]" />
                    <span>
                      {compressing
                        ? 'Optimizando...'
                        : foto
                          ? 'Cambiar imagen'
                          : 'Subir imagen'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={compressing}
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-[#F59E0B] hover:text-gray-950 disabled:opacity-60 dark:border-[#323946] dark:bg-[#1E2229] dark:text-gray-300 dark:hover:border-[#F59E0B] dark:hover:text-white"
                  >
                    <Camera className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    <span>Tomar foto</span>
                  </button>

                  {foto && (
                    <button
                      type="button"
                      onClick={() => {
                        setFoto(undefined);
                        setPhotoInfo(null);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Quitar</span>
                    </button>
                  )}

                  {/* Selector de galería / archivos (JPG, PNG, WebP, etc.) */}
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    aria-label="Cargar imagen desde archivos o galería"
                  />

                  {/* Acceso directo a cámara en dispositivos móviles */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                    aria-label="Tomar fotografía con la cámara"
                  />
                </div>

                {photoError ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {photoError}
                  </p>
                ) : photoInfo ? (
                  <p className="font-mono text-xs text-emerald-700 dark:text-emerald-400">
                    {photoInfo}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Opcional. Carga cualquier imagen (JPG, PNG, WebP) o toma una
                    foto; se optimiza automáticamente.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-gray-200/80 pt-3 dark:border-[#2A303A]">
              {TOOL_ICON_OPTIONS.map((opt) => {
                const isSelected = effectiveIcon === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    title={opt.label}
                    aria-label={`Elegir ícono ${opt.label}`}
                    onClick={() => setIcono(opt.id)}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#B45309] dark:text-[#F59E0B]'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-950 dark:border-[#2A303A] dark:bg-[#1E2229] dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200'
                    }`}
                  >
                    <ToolIcon
                      icon={opt.id}
                      className="h-[18px] w-[18px] shrink-0"
                    />
                    <span className="truncate text-[11px] font-medium leading-tight">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
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
