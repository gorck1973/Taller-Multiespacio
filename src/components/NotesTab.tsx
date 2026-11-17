import {
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { NoteTone, WorkshopNote } from '../types/workshop';

interface NotesTabProps {
  notes: WorkshopNote[];
  onSaveNote: (
    data: Omit<WorkshopNote, 'id' | 'updatedAt'>,
    existingId?: string
  ) => void;
  onTogglePin: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}

const TONE_STYLES: Record<
  NoteTone,
  { label: string; cardClass: string; swatchClass: string }
> = {
  neutral: {
    label: 'Estándar',
    cardClass:
      'border-gray-200 bg-white dark:border-[#2A303A] dark:bg-[#1E2229]',
    swatchClass: 'bg-gray-400',
  },
  amber: {
    label: 'Ámbar taller',
    cardClass:
      'border-amber-400/50 bg-amber-50/70 dark:border-amber-500/35 dark:bg-[#232018]',
    swatchClass: 'bg-amber-500',
  },
  blue: {
    label: 'Azul plano',
    cardClass:
      'border-sky-400/45 bg-sky-50/70 dark:border-sky-500/35 dark:bg-[#19212B]',
    swatchClass: 'bg-sky-500',
  },
  emerald: {
    label: 'Verde obra',
    cardClass:
      'border-emerald-400/45 bg-emerald-50/70 dark:border-emerald-500/35 dark:bg-[#182420]',
    swatchClass: 'bg-emerald-500',
  },
};

function formatUpdatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function NotesTab({
  notes,
  onSaveNote,
  onTogglePin,
  onDeleteNote,
}: NotesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<WorkshopNote | null>(null);

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [tono, setTono] = useState<NoteTone>('neutral');
  const [fijada, setFijada] = useState(false);

  const openCreateModal = () => {
    setEditingNote(null);
    setTitulo('');
    setContenido('');
    setTono('neutral');
    setFijada(false);
    setModalOpen(true);
  };

  const openEditModal = (note: WorkshopNote) => {
    setEditingNote(note);
    setTitulo(note.titulo);
    setContenido(note.contenido);
    setTono(note.tono);
    setFijada(note.fijada);
    setModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() && !contenido.trim()) return;

    onSaveNote(
      {
        titulo: titulo.trim() || 'Nota rápida',
        contenido: contenido.trim(),
        tono,
        fijada,
      },
      editingNote?.id
    );
    setModalOpen(false);
  };

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notes
      .filter((n) => {
        if (!q) return true;
        return (
          n.titulo.toLowerCase().includes(q) ||
          n.contenido.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.fijada !== b.fijada) return a.fijada ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [notes, searchQuery]);

  const pinnedNotes = filteredNotes.filter((n) => n.fijada);
  const regularNotes = filteredNotes.filter((n) => !n.fijada);

  const renderNoteCard = (note: WorkshopNote) => {
    const style = TONE_STYLES[note.tono] || TONE_STYLES.neutral;
    return (
      <article
        key={note.id}
        className={`group flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F59E0B]/60 hover:shadow-lg dark:hover:shadow-black/40 ${style.cardClass}`}
      >
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-bold leading-snug text-gray-950 dark:text-white">
              {note.titulo}
            </h2>

            <button
              type="button"
              onClick={() => onTogglePin(note.id)}
              aria-label={note.fijada ? 'Desfijar nota' : 'Fijar arriba'}
              title={note.fijada ? 'Desfijar nota' : 'Fijar arriba'}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                note.fijada
                  ? 'bg-[#F59E0B]/20 text-[#B45309] dark:text-[#F59E0B]'
                  : 'text-gray-400 hover:bg-gray-200/70 hover:text-gray-900 dark:hover:bg-[#2A303A] dark:hover:text-white'
              }`}
            >
              {note.fijada ? (
                <Pin className="h-4 w-4 fill-current" />
              ) : (
                <PinOff className="h-4 w-4" />
              )}
            </button>
          </div>

          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {note.contenido}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-black/8 pt-3 dark:border-white/8">
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
            {formatUpdatedAt(note.updatedAt)}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => openEditModal(note)}
              aria-label={`Editar ${note.titulo}`}
              title="Editar nota"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteNote(note.id)}
              aria-label={`Eliminar ${note.titulo}`}
              title="Eliminar nota"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl dark:text-white">
            Notas e Ideas
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Tablero de apuntes rápidos: medidas de la casa, códigos de pintura y
            próximas herramientas.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#F59E0B] px-5 text-sm font-semibold text-[#121417] whitespace-nowrap shrink-0 shadow-xs transition-all duration-150 hover:bg-[#D97706] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Nueva nota</span>
        </button>
      </div>

      {/* Buscador de notas */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en notas, medidas o códigos..."
          aria-label="Buscar notas"
          className="h-10 w-full rounded-lg border border-gray-300 bg-white pr-3.5 pl-10 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#2A303A] dark:bg-[#1E2229] dark:text-white dark:placeholder:text-gray-500"
        />
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-[#323946] dark:bg-[#1E2229]">
          <StickyNote className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          <h2 className="font-display mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            {notes.length === 0
              ? 'Tu tablero de notas está vacío'
              : 'No se encontraron notas con ese texto'}
          </h2>
          <p className="mt-1 max-w-md text-sm text-gray-600 dark:text-gray-400">
            Guarda medidas de puertas, colores de pintura o ideas de proyectos
            para tenerlos a mano en el taller o la ferretería.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 rounded-lg bg-[#F59E0B] px-4 py-2 text-sm font-semibold text-[#121417] transition-colors hover:bg-[#D97706]"
          >
            Crear primera nota
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {pinnedNotes.length > 0 && (
            <section aria-label="Notas fijadas">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-amber-700 uppercase dark:text-[#F59E0B]">
                <Pin className="h-3.5 w-3.5 fill-current" />
                <span>Fijadas arriba</span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pinnedNotes.map(renderNoteCard)}
              </div>
            </section>
          )}

          {regularNotes.length > 0 && (
            <section aria-label="Todas las notas">
              {pinnedNotes.length > 0 && (
                <div className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Otras notas
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {regularNotes.map(renderNoteCard)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modal para crear / editar nota */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="note-modal-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-[#2E3440] dark:bg-[#1E2229]">
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-[#2A303A]">
              <h2
                id="note-modal-title"
                className="font-display text-xl font-bold text-gray-950 dark:text-white"
              >
                {editingNote ? 'Editar nota' : 'Nueva nota rápida'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#2A303A] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="note-title"
                  className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
                >
                  Título *
                </label>
                <input
                  id="note-title"
                  type="text"
                  required
                  autoFocus
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Medidas ventana cocina o Código pintura"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white dark:placeholder:text-gray-500"
                />
              </div>

              <div>
                <label
                  htmlFor="note-content"
                  className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
                >
                  Apuntes, medidas o detalles *
                </label>
                <textarea
                  id="note-content"
                  required
                  rows={5}
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  placeholder="Escribe medidas exactas, referencias de tornillos, códigos RAL o ideas..."
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm leading-relaxed text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white dark:placeholder:text-gray-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Color de tarjeta
                  </span>
                  <div className="flex items-center gap-2">
                    {(Object.keys(TONE_STYLES) as NoteTone[]).map((toneKey) => {
                      const info = TONE_STYLES[toneKey];
                      const active = tono === toneKey;
                      return (
                        <button
                          key={toneKey}
                          type="button"
                          onClick={() => setTono(toneKey)}
                          title={info.label}
                          aria-label={info.label}
                          className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                            active
                              ? 'border-[#F59E0B] bg-amber-500/12 text-gray-950 dark:text-white'
                              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 dark:border-[#323946] dark:bg-[#121417] dark:text-gray-400'
                          }`}
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${info.swatchClass}`}
                          />
                          <span className="hidden sm:inline">{info.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 pt-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={fijada}
                    onChange={(e) => setFijada(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#F59E0B]"
                  />
                  <span>Fijar arriba</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-[#2A303A]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-[#323946] dark:text-gray-300 dark:hover:bg-[#252A33]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#F59E0B] px-5 py-2 text-sm font-semibold text-[#121417] transition-colors hover:bg-[#D97706]"
                >
                  {editingNote ? 'Guardar cambios' : 'Guardar nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
