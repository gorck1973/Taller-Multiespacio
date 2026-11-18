import {
  ArrowRightLeft,
  Calendar,
  MapPin,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  UserCheck,
  Wrench,
  X,
  ZoomIn,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  ShoppingItem,
  Tool,
  ToolCategory,
  ToolLocationZone,
} from '../types/workshop';
import { resolveToolIcon, ToolIcon } from './ToolIcon';

interface InventoryTabProps {
  tools: Tool[];
  shoppingItems: ShoppingItem[];
  onAddToolClick: () => void;
  onEditTool: (tool: Tool) => void;
  onDeleteTool: (toolId: string) => void;
  onRequestLoan: (tool: Tool) => void;
  onReturnTool: (toolId: string) => void;
  onQuickAddPartForTool: (toolId: string) => void;
  onGoToShopping: () => void;
}

const CATEGORIES: ('Todas' | ToolCategory)[] = [
  'Todas',
  'Eléctricas',
  'Manuales',
  'Medición',
  'Jardinería',
  'Ferretería',
];

const ZONES: ('Todas' | ToolLocationZone)[] = [
  'Todas',
  'Garaje',
  'Caja de herramientas',
  'Bodega',
];

function formatDateEs(isoDate?: string) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function InventoryTab({
  tools,
  shoppingItems,
  onAddToolClick,
  onEditTool,
  onDeleteTool,
  onRequestLoan,
  onReturnTool,
  onQuickAddPartForTool,
  onGoToShopping,
}: InventoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'Todas' | ToolCategory
  >('Todas');
  const [selectedZone, setSelectedZone] = useState<'Todas' | ToolLocationZone>(
    'Todas'
  );
  const [onlyPendingParts, setOnlyPendingParts] = useState(false);
  const [zoomedTool, setZoomedTool] = useState<Tool | null>(null);

  useEffect(() => {
    if (!zoomedTool) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomedTool(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomedTool]);

  const pendingPartsByTool = useMemo(() => {
    const map = new Map<string, ShoppingItem[]>();
    for (const item of shoppingItems) {
      if (!item.comprado && item.toolId) {
        const list = map.get(item.toolId) ?? [];
        list.push(item);
        map.set(item.toolId, list);
      }
    }
    return map;
  }, [shoppingItems]);

  const stats = useMemo(() => {
    const total = tools.length;
    const disponibles = tools.filter((t) => t.estado === 'Disponible').length;
    const prestadas = tools.filter((t) => t.estado === 'Prestada').length;
    const conPendientes = tools.filter(
      (t) => (pendingPartsByTool.get(t.id)?.length ?? 0) > 0
    ).length;
    return { total, disponibles, prestadas, conPendientes };
  }, [tools, pendingPartsByTool]);

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tools.filter((tool) => {
      if (selectedCategory !== 'Todas' && tool.categoria !== selectedCategory) {
        return false;
      }
      if (selectedZone !== 'Todas' && tool.ubicacionZona !== selectedZone) {
        return false;
      }
      if (
        onlyPendingParts &&
        (pendingPartsByTool.get(tool.id)?.length ?? 0) === 0
      ) {
        return false;
      }
      if (!q) return true;

      const haystack = [
        tool.nombre,
        tool.marca,
        tool.modelo,
        tool.categoria,
        tool.ubicacionZona,
        tool.ubicacionExacta,
        tool.prestadaA || '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [
    tools,
    searchQuery,
    selectedCategory,
    selectedZone,
    onlyPendingParts,
    pendingPartsByTool,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'Todas' ||
    selectedZone !== 'Todas' ||
    onlyPendingParts;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Todas');
    setSelectedZone('Todas');
    setOnlyPendingParts(false);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de sección */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl dark:text-white">
            Inventario del Taller
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Control de herramientas, ubicación exacta, préstamos y repuestos
            vinculados.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddToolClick}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#F59E0B] px-5 text-sm font-semibold text-[#121417] whitespace-nowrap shrink-0 shadow-xs transition-all duration-150 hover:bg-[#D97706] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Nueva herramienta</span>
        </button>
      </div>

      {/* Panel superior de resumen (KPIs) */}
      <section
        aria-label="Resumen de inventario"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-4 transition-colors dark:border-[#2A303A] dark:bg-[#1E2229]">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Total de herramientas
          </p>
          <p className="font-mono mt-2 text-2xl font-semibold text-gray-950 sm:text-3xl dark:text-white">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 transition-colors dark:border-[#2A303A] dark:bg-[#1E2229]">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Disponibles
          </p>
          <p className="font-mono mt-2 text-2xl font-semibold text-emerald-700 sm:text-3xl dark:text-emerald-400">
            {stats.disponibles}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 transition-colors dark:border-[#2A303A] dark:bg-[#1E2229]">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Prestadas
          </p>
          <p className="font-mono mt-2 text-2xl font-semibold text-amber-700 sm:text-3xl dark:text-amber-400">
            {stats.prestadas}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOnlyPendingParts((prev) => !prev)}
          className={`rounded-xl border p-4 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B] ${
            onlyPendingParts
              ? 'border-[#F59E0B] bg-amber-500/12 ring-1 ring-[#F59E0B]/40'
              : 'border-gray-200 bg-white hover:border-[#F59E0B]/50 dark:border-[#2A303A] dark:bg-[#1E2229] dark:hover:border-[#F59E0B]/50'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Con repuestos pendientes
            </p>
            {stats.conPendientes > 0 && (
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F59E0B] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
              </span>
            )}
          </div>
          <p className="font-mono mt-2 text-2xl font-semibold text-[#B45309] sm:text-3xl dark:text-[#F59E0B]">
            {stats.conPendientes}
          </p>
        </button>
      </section>

      {/* Buscador y Filtros Rápidos */}
      <section
        aria-label="Buscador y filtros"
        className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2A303A] dark:bg-[#1E2229]"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, marca, modelo, ubicación o persona..."
              aria-label="Buscar herramientas"
              className="h-10 w-full rounded-lg border border-gray-300 bg-gray-50 pr-3.5 pl-10 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyPendingParts((prev) => !prev)}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B] ${
              onlyPendingParts
                ? 'border-[#F59E0B] bg-[#F59E0B] text-[#121417] font-semibold'
                : 'border-gray-300 bg-gray-50 text-gray-800 hover:border-[#F59E0B]/60 dark:border-[#323946] dark:bg-[#121417] dark:text-gray-200 dark:hover:border-[#F59E0B]/60'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                onlyPendingParts
                  ? 'bg-[#121417]'
                  : 'bg-[#F59E0B]'
              }`}
            />
            <span>Con pendientes</span>
            <span className="font-mono text-xs opacity-80">
              ({stats.conPendientes})
            </span>
          </button>
        </div>

        {/* Filtros por Categoría y Ubicación */}
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-3 lg:flex-row lg:items-center lg:justify-between dark:border-[#2A303A]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              Categoría:
            </span>
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-gray-900 text-white dark:bg-[#F59E0B] dark:text-[#121417] dark:font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#121417] dark:text-gray-300 dark:hover:bg-[#252A33]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              Ubicación:
            </span>
            {ZONES.map((zone) => {
              const active = selectedZone === zone;
              return (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setSelectedZone(zone)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-gray-900 text-white dark:bg-[#F59E0B] dark:text-[#121417] dark:font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#121417] dark:text-gray-300 dark:hover:bg-[#252A33]'
                  }`}
                >
                  {zone}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid de Herramientas */}
      {filteredTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-[#323946] dark:bg-[#1E2229]">
          <Wrench className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          <h2 className="font-display mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            {tools.length === 0
              ? 'Tu taller aún no tiene herramientas registradas'
              : 'No hay herramientas que coincidan con los filtros'}
          </h2>
          <p className="mt-1 max-w-md text-sm text-gray-600 dark:text-gray-400">
            {tools.length === 0
              ? 'Agrega tu primera máquina o herramienta manual para controlar su ubicación y repuestos.'
              : 'Prueba limpiando la búsqueda o cambiando la categoría y ubicación seleccionadas.'}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 dark:border-[#323946] dark:text-gray-200 dark:hover:bg-[#252A33]"
            >
              Limpiar filtros
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddToolClick}
              className="mt-5 rounded-lg bg-[#F59E0B] px-4 py-2 text-sm font-semibold text-[#121417] transition-colors hover:bg-[#D97706]"
            >
              Agregar primera herramienta
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTools.map((tool) => {
            const pendingParts = pendingPartsByTool.get(tool.id) ?? [];
            const hasPending = pendingParts.length > 0;
            const isLoaned = tool.estado === 'Prestada';

            return (
              <article
                key={tool.id}
                className={`group flex flex-col justify-between rounded-xl border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-[#1E2229] dark:hover:shadow-black/40 ${
                  hasPending
                    ? 'border-amber-500/45 hover:border-[#F59E0B]'
                    : 'border-gray-200 hover:border-amber-500/50 dark:border-[#2A303A] dark:hover:border-[#F59E0B]/60'
                }`}
              >
                <div>
                  {/* Cabecera de la tarjeta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      {tool.foto ? (
                        <button
                          type="button"
                          onClick={() => setZoomedTool(tool)}
                          aria-label={`Ampliar foto de ${tool.nombre}`}
                          title="Toca para ampliar la foto"
                          className="group/thumb relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition-colors hover:border-[#F59E0B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B] dark:border-[#323946] dark:bg-[#121417]"
                        >
                          <img
                            src={tool.foto}
                            alt={tool.nombre}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover/thumb:scale-105"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-150 group-hover/thumb:opacity-100">
                            <ZoomIn className="h-4 w-4 text-white" />
                          </span>
                        </button>
                      ) : (
                        <div
                          aria-hidden="true"
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 transition-colors group-hover:border-[#F59E0B]/45 group-hover:text-[#B45309] dark:border-[#2E3440] dark:bg-[#14171C] dark:text-[#F59E0B]/90 dark:group-hover:border-[#F59E0B]/55 dark:group-hover:text-[#F59E0B]"
                        >
                          <ToolIcon
                            icon={resolveToolIcon(tool)}
                            className="h-6 w-6"
                          />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                          <span>{tool.marca}</span>
                          <span aria-hidden="true">·</span>
                          <span>{tool.categoria}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-gray-700 dark:text-gray-300">
                            {tool.modelo}
                          </span>
                        </div>
                        <h2 className="font-display mt-0.5 text-lg font-bold leading-snug text-gray-950 dark:text-white">
                          {tool.nombre}
                        </h2>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditTool(tool)}
                        aria-label={`Editar ${tool.nombre}`}
                        title="Editar herramienta"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2A303A] dark:hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTool(tool.id)}
                        aria-label={`Eliminar ${tool.nombre}`}
                        title="Eliminar herramienta"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Ubicación y Estado */}
                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-3.5 text-sm dark:border-[#2A303A]">
                    <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {tool.ubicacionZona}
                        </span>
                        {tool.ubicacionExacta &&
                          tool.ubicacionExacta !== tool.ubicacionZona && (
                            <span className="text-gray-600 dark:text-gray-400">
                              {' '}
                              — {tool.ubicacionExacta}
                            </span>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            isLoaned ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span
                          className={`text-sm font-semibold ${
                            isLoaned
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {tool.estado}
                        </span>
                      </div>
                    </div>

                    {isLoaned && (
                      <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:bg-amber-500/12 dark:text-amber-200">
                        <div className="flex items-center gap-1.5 font-medium">
                          <UserCheck className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>
                            Prestada a:{' '}
                            <strong className="font-semibold">
                              {tool.prestadaA || 'Sin especificar'}
                            </strong>
                          </span>
                        </div>
                        {tool.fechaPrestamo && (
                          <div className="mt-1 flex items-center gap-1.5 text-amber-800/80 dark:text-amber-300/80">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span className="font-mono">
                              {formatDateEs(tool.fechaPrestamo)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Conexión Inteligente: Bloque de Alerta Ámbar con Repuestos Pendientes */}
                  {hasPending && (
                    <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 dark:border-amber-500/35 dark:bg-amber-500/10">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-2.5 w-2.5 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F59E0B] opacity-80" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                          </span>
                          <span className="font-display text-xs font-bold tracking-wide text-amber-900 uppercase dark:text-[#FBBF24]">
                            {pendingParts.length === 1
                              ? '1 falta por comprar'
                              : `${pendingParts.length} faltantes por comprar`}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={onGoToShopping}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 underline-offset-2 hover:underline dark:text-amber-300"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          <span>Ver lista</span>
                        </button>
                      </div>

                      <ol className="mt-3 space-y-2.5">
                        {pendingParts.map((part, idx) => (
                          <li
                            key={part.id}
                            className={`${
                              idx > 0
                                ? 'border-t border-amber-500/25 pt-2.5'
                                : ''
                            }`}
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-semibold text-gray-950 dark:text-white">
                                {pendingParts.length > 1 && (
                                  <span className="font-mono mr-1.5 text-xs text-amber-700 dark:text-amber-400">
                                    {idx + 1}.
                                  </span>
                                )}
                                {part.nombre}
                              </span>
                              <span className="font-mono shrink-0 text-xs font-semibold text-amber-900 dark:text-amber-300">
                                {part.cantidad}
                              </span>
                            </div>

                            <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                              <div>
                                <dt className="inline text-gray-600 dark:text-gray-400">
                                  Marca:{' '}
                                </dt>
                                <dd className="inline font-medium text-gray-900 dark:text-gray-100">
                                  {part.marca || '—'}
                                </dd>
                              </div>
                              <div>
                                <dt className="inline text-gray-600 dark:text-gray-400">
                                  Modelo:{' '}
                                </dt>
                                <dd className="font-mono inline font-medium text-gray-900 dark:text-gray-100">
                                  {part.modelo || '—'}
                                </dd>
                              </div>
                              <div className="col-span-2">
                                <dt className="inline text-gray-600 dark:text-gray-400">
                                  Medidas:{' '}
                                </dt>
                                <dd className="font-mono inline font-medium text-gray-900 dark:text-gray-100">
                                  {part.medidas || 'Sin especificar'}
                                </dd>
                              </div>
                            </dl>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                {/* Pie de acciones */}
                <div className="mt-5 flex items-center justify-between gap-2 border-t border-gray-100 pt-3.5 dark:border-[#2A303A]">
                  <button
                    type="button"
                    onClick={() =>
                      isLoaned ? onReturnTool(tool.id) : onRequestLoan(tool)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isLoaned
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-[#252A33] dark:text-gray-200 dark:hover:bg-[#2F3642]'
                    }`}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    <span>{isLoaned ? 'Marcar devuelta' : 'Prestar'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onQuickAddPartForTool(tool.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-amber-500/10 hover:text-amber-800 dark:text-gray-400 dark:hover:text-[#F59E0B]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Pedir repuesto</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Visor rápido para foto ampliada */}
      {zoomedTool && zoomedTool.foto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="zoom-photo-title"
          onClick={() => setZoomedTool(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-[#2E3440] dark:bg-[#1E2229]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-3.5 dark:border-[#2A303A]">
              <div className="min-w-0">
                <h3
                  id="zoom-photo-title"
                  className="font-display truncate text-base font-bold text-gray-950 dark:text-white"
                >
                  {zoomedTool.nombre}
                </h3>
                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                  {zoomedTool.marca} ·{' '}
                  <span className="font-mono">{zoomedTool.modelo}</span> ·{' '}
                  {zoomedTool.ubicacionZona}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setZoomedTool(null)}
                aria-label="Cerrar foto"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#2A303A] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-gray-100 p-3 dark:bg-[#121417]">
              <img
                src={zoomedTool.foto}
                alt={zoomedTool.nombre}
                className="max-h-[70vh] w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
