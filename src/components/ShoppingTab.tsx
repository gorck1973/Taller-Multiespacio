import {
  Check,
  Link2,
  Package,
  Plus,
  Ruler,
  ShoppingBag,
  Trash2,
  Wrench,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ShoppingCategory, ShoppingItem, Tool } from '../types/workshop';

interface ShoppingTabProps {
  items: ShoppingItem[];
  tools: Tool[];
  preselectedToolId: string | null;
  onClearPreselectedTool: () => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'createdAt' | 'comprado'>) => void;
  onTogglePurchased: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onClearPurchased: () => void;
}

const CATEGORY_META: Record<
  ShoppingCategory,
  {
    label: string;
    dotClass: string;
    activeBtnClass: string;
    tagTextClass: string;
  }
> = {
  Repuesto: {
    label: 'Repuesto',
    dotClass: 'bg-amber-500',
    activeBtnClass:
      'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-semibold',
    tagTextClass: 'text-amber-700 dark:text-amber-400',
  },
  Accesorio: {
    label: 'Accesorio',
    dotClass: 'bg-sky-500',
    activeBtnClass:
      'border-sky-500 bg-sky-500/15 text-sky-900 dark:text-sky-300 font-semibold',
    tagTextClass: 'text-sky-700 dark:text-sky-400',
  },
  Material: {
    label: 'Material',
    dotClass: 'bg-emerald-500',
    activeBtnClass:
      'border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 font-semibold',
    tagTextClass: 'text-emerald-700 dark:text-emerald-400',
  },
};

export function ShoppingTab({
  items,
  tools,
  preselectedToolId,
  onClearPreselectedTool,
  onAddItem,
  onTogglePurchased,
  onDeleteItem,
  onClearPurchased,
}: ShoppingTabProps) {
  const [filterCategory, setFilterCategory] = useState<
    'Todos' | ShoppingCategory
  >('Todos');
  const [flashingIds, setFlashingIds] = useState<Record<string, boolean>>({});

  // Form state
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<ShoppingCategory>('Repuesto');
  const [cantidad, setCantidad] = useState('1 ud');
  const [toolId, setToolId] = useState<string>('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [medidas, setMedidas] = useState('');

  // When navigated from a tool card ("Pedir repuesto"), pre-link and autofill Marca & Modelo
  useEffect(() => {
    if (preselectedToolId) {
      const targetTool = tools.find((t) => t.id === preselectedToolId);
      if (targetTool) {
        setToolId(targetTool.id);
        setCategoria('Repuesto');
        setMarca(targetTool.marca);
        setModelo(targetTool.modelo);
      }
      onClearPreselectedTool();
    }
  }, [preselectedToolId, tools, onClearPreselectedTool]);

  const toolsById = useMemo(() => {
    const map = new Map<string, Tool>();
    for (const t of tools) map.set(t.id, t);
    return map;
  }, [tools]);

  const handleSelectTool = (selectedId: string) => {
    setToolId(selectedId);
    if (selectedId) {
      const linked = toolsById.get(selectedId);
      if (linked) {
        // Rellenar automáticamente Marca y Modelo de la herramienta, permitiendo editarlos
        setMarca(linked.marca);
        setModelo(linked.modelo);
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    onAddItem({
      nombre: nombre.trim(),
      categoria,
      cantidad: cantidad.trim() || '1 ud',
      toolId: toolId || undefined,
      marca: marca.trim(),
      modelo: modelo.trim(),
      medidas: medidas.trim(),
    });

    setNombre('');
    setCantidad('1 ud');
    setToolId('');
    setMarca('');
    setModelo('');
    setMedidas('');
  };

  const handleCheckItem = (item: ShoppingItem) => {
    if (!item.comprado) {
      setFlashingIds((prev) => ({ ...prev, [item.id]: true }));
      window.setTimeout(() => {
        setFlashingIds((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      }, 950);
    }
    onTogglePurchased(item.id);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterCategory !== 'Todos' && item.categoria !== filterCategory) {
        return false;
      }
      return true;
    });
  }, [items, filterCategory]);

  const pendingItems = useMemo(
    () => filteredItems.filter((i) => !i.comprado),
    [filteredItems]
  );

  const purchasedItems = useMemo(
    () => filteredItems.filter((i) => i.comprado),
    [filteredItems]
  );

  const totalPending = items.filter((i) => !i.comprado).length;
  const totalPurchased = items.filter((i) => i.comprado).length;

  const isRepuesto = categoria === 'Repuesto';

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl dark:text-white">
            Lista de Compras
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Repuestos, accesorios y materiales. Al marcar un repuesto como
            comprado se limpia su alerta en el Inventario.
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Por comprar: </span>
            <span className="font-mono font-semibold text-[#B45309] dark:text-[#F59E0B]">
              {totalPending}
            </span>
          </div>
          <span className="text-gray-300 dark:text-[#323946]">|</span>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Comprados: </span>
            <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
              {totalPurchased}
            </span>
          </div>
        </div>
      </div>

      {/* Layout principal: Formulario a la izquierda + Lista unificada a la derecha */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[390px_1fr] lg:items-start">
        {/* Formulario de Nuevo Ítem */}
        <section
          aria-label="Agregar ítem a lista de compras"
          className="rounded-xl border border-gray-200 bg-white p-5 lg:sticky lg:top-24 dark:border-[#2A303A] dark:bg-[#1E2229]"
        >
          <h2 className="font-display text-lg font-bold text-gray-950 dark:text-white">
            Agregar a la lista
          </h2>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
            Vincula una herramienta para autocompletar marca y modelo.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Categoría con color */}
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Categoría
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['Repuesto', 'Accesorio', 'Material'] as ShoppingCategory[]).map(
                  (cat) => {
                    const meta = CATEGORY_META[cat];
                    const active = categoria === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoria(cat)}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs transition-all ${
                          active
                            ? meta.activeBtnClass
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 dark:border-[#323946] dark:bg-[#121417] dark:text-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${meta.dotClass}`}
                        />
                        <span>{meta.label}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Nombre y Cantidad */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_115px]">
              <div>
                <label
                  htmlFor="shop-name"
                  className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Nombre del producto *
                </label>
                <input
                  id="shop-name"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={
                    isRepuesto
                      ? 'Ej. Escobillas de carbón'
                      : 'Ej. Cinta métrica / Lija 120'
                  }
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white dark:placeholder:text-gray-500"
                />
              </div>

              <div>
                <label
                  htmlFor="shop-qty"
                  className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Cantidad *
                </label>
                <input
                  id="shop-qty"
                  type="text"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="2 uds"
                  className="font-mono w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Vincular herramienta existente */}
            <div>
              <label
                htmlFor="shop-tool-link"
                className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                <Link2 className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span>Vincular a herramienta del Inventario</span>
              </label>
              <select
                id="shop-tool-link"
                value={toolId}
                onChange={(e) => handleSelectTool(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-950 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white"
              >
                <option value="">Sin vincular (compra general)</option>
                {tools.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} ({t.marca} · {t.modelo})
                  </option>
                ))}
              </select>
            </div>

            {/* Bloque técnico destacado (obligatorio/infaltable para Repuesto) */}
            <div
              className={`space-y-3 rounded-lg border p-3.5 ${
                isRepuesto
                  ? 'border-amber-500/40 bg-amber-500/8'
                  : 'border-gray-200 bg-gray-50/70 dark:border-[#2E3440] dark:bg-[#121417]/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-gray-100">
                  <Ruler className="h-3.5 w-3.5 text-[#F59E0B]" />
                  <span>
                    {isRepuesto
                      ? 'Especificaciones infaltables del repuesto'
                      : 'Detalle técnico (opcional)'}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="shop-brand"
                    className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    Marca {isRepuesto && '*'}
                  </label>
                  <input
                    id="shop-brand"
                    type="text"
                    required={isRepuesto}
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Ej. Bosch"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shop-model"
                    className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    Modelo {isRepuesto && '*'}
                  </label>
                  <input
                    id="shop-model"
                    type="text"
                    required={isRepuesto}
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Ej. GWS 700"
                    className="font-mono w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="shop-measures"
                  className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Medidas / Dimensiones {isRepuesto && '*'}
                </label>
                <input
                  id="shop-measures"
                  type="text"
                  required={isRepuesto}
                  value={medidas}
                  onChange={(e) => setMedidas(e.target.value)}
                  placeholder="Ej. 5 × 8 × 16 mm · Eje 22.23 mm"
                  className="font-mono w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#F59E0B] px-4 text-sm font-semibold text-[#121417] transition-colors hover:bg-[#D97706] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Agregar a la lista</span>
            </button>
          </form>
        </section>

        {/* Lista Unificada */}
        <div className="space-y-4">
          {/* Filtros por etiqueta de color */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-[#2A303A] dark:bg-[#1E2229]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterCategory('Todos')}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filterCategory === 'Todos'
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-[#121417] dark:font-semibold'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-[#323946] dark:bg-[#121417] dark:text-gray-300 dark:hover:bg-[#252A33]'
                }`}
              >
                Todos ({items.length})
              </button>

              {(['Repuesto', 'Accesorio', 'Material'] as ShoppingCategory[]).map(
                (cat) => {
                  const meta = CATEGORY_META[cat];
                  const active = filterCategory === cat;
                  const count = items.filter((i) => i.categoria === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilterCategory(cat)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? meta.activeBtnClass
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-[#323946] dark:bg-[#121417] dark:text-gray-300 dark:hover:bg-[#252A33]'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${meta.dotClass}`}
                      />
                      <span>{meta.label}</span>
                      <span className="font-mono opacity-75">({count})</span>
                    </button>
                  );
                }
              )}
            </div>

            {purchasedItems.length > 0 && (
              <button
                type="button"
                onClick={onClearPurchased}
                className="text-xs font-medium text-gray-500 transition-colors hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              >
                Limpiar comprados
              </button>
            )}
          </div>

          {/* Lista de Pendientes */}
          {pendingItems.length === 0 && purchasedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-[#323946] dark:bg-[#1E2229]">
              <ShoppingBag className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              <h2 className="font-display mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No hay ítems en esta categoría
              </h2>
              <p className="mt-1 max-w-sm text-sm text-gray-600 dark:text-gray-400">
                Usa el formulario para anotar repuestos, accesorios o materiales
                que necesites comprar en la ferretería.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingItems.length > 0 && (
                <div className="space-y-3">
                  {pendingItems.map((item) => {
                    const meta = CATEGORY_META[item.categoria];
                    const linkedTool = item.toolId
                      ? toolsById.get(item.toolId)
                      : undefined;
                    const hasSpecs =
                      item.marca || item.modelo || item.medidas;

                    return (
                      <article
                        key={item.id}
                        className="group rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F59E0B]/50 hover:shadow-md dark:border-[#2A303A] dark:bg-[#1E2229] dark:hover:border-[#F59E0B]/50"
                      >
                        <div className="flex items-start gap-3.5">
                          <button
                            type="button"
                            onClick={() => handleCheckItem(item)}
                            aria-label={`Marcar ${item.nombre} como comprado`}
                            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-gray-300 bg-white text-transparent transition-all hover:border-emerald-500 hover:bg-emerald-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B] dark:border-[#3F4756] dark:bg-[#121417] dark:hover:border-emerald-400"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span
                                    className={`inline-flex items-center gap-1.5 font-semibold ${meta.tagTextClass}`}
                                  >
                                    <span
                                      className={`h-2 w-2 rounded-full ${meta.dotClass}`}
                                    />
                                    {meta.label}
                                  </span>

                                  {linkedTool && (
                                    <>
                                      <span className="text-gray-300 dark:text-gray-600">
                                        ·
                                      </span>
                                      <span className="inline-flex items-center gap-1 font-medium text-amber-800 dark:text-amber-300">
                                        <Wrench className="h-3 w-3" />
                                        Para: {linkedTool.nombre}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <h3 className="font-display mt-1 text-base font-bold text-gray-950 dark:text-white">
                                  {item.nombre}
                                </h3>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-mono rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-900 dark:border-[#323946] dark:bg-[#121417] dark:text-gray-100">
                                  {item.cantidad}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => onDeleteItem(item.id)}
                                  aria-label={`Eliminar ${item.nombre}`}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Detalles técnicos estructurados */}
                            {hasSpecs && (
                              <dl className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-gray-100 bg-gray-50/90 px-3 py-2.5 text-xs sm:grid-cols-3 dark:border-[#2A303A] dark:bg-[#121417]/75">
                                <div>
                                  <dt className="text-gray-500 dark:text-gray-400">
                                    Marca
                                  </dt>
                                  <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">
                                    {item.marca || '—'}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-gray-500 dark:text-gray-400">
                                    Modelo
                                  </dt>
                                  <dd className="font-mono mt-0.5 font-medium text-gray-900 dark:text-gray-100">
                                    {item.modelo || '—'}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-gray-500 dark:text-gray-400">
                                    Medidas
                                  </dt>
                                  <dd className="font-mono mt-0.5 font-medium text-gray-900 dark:text-gray-100">
                                    {item.medidas || '—'}
                                  </dd>
                                </div>
                              </dl>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Sección de Comprados (con destello verde al marcar) */}
              {purchasedItems.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <Package className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Comprados ({purchasedItems.length})</span>
                  </div>

                  {purchasedItems.map((item) => {
                    const isFlashing = Boolean(flashingIds[item.id]);
                    const linkedTool = item.toolId
                      ? toolsById.get(item.toolId)
                      : undefined;

                    return (
                      <article
                        key={item.id}
                        className={`rounded-xl border border-gray-200 bg-white/70 p-3.5 transition-colors dark:border-[#2A303A] dark:bg-[#1E2229]/65 ${
                          isFlashing ? 'animate-purchase-flash' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleCheckItem(item)}
                            aria-label={`Desmarcar ${item.nombre} como comprado`}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-emerald-500 bg-emerald-500 text-white transition-transform active:scale-95"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-medium text-gray-500 line-through dark:text-gray-400">
                                {item.nombre}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                  {item.cantidad}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onDeleteItem(item.id)}
                                  aria-label={`Eliminar ${item.nombre}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                              <span>{item.categoria}</span>
                              {item.medidas && (
                                <>
                                  <span>·</span>
                                  <span className="font-mono">
                                    {item.medidas}
                                  </span>
                                </>
                              )}
                              {linkedTool && (
                                <>
                                  <span>·</span>
                                  <span>{linkedTool.nombre}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
