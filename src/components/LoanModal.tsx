import { Calendar, UserCheck, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Tool } from '../types/workshop';

interface LoanModalProps {
  tool: Tool | null;
  onClose: () => void;
  onConfirm: (toolId: string, prestadaA: string, fechaPrestamo: string) => void;
}

export function LoanModal({ tool, onClose, onConfirm }: LoanModalProps) {
  const [prestadaA, setPrestadaA] = useState('');
  const [fechaPrestamo, setFechaPrestamo] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (tool) {
      setPrestadaA(tool.prestadaA || '');
      setFechaPrestamo(
        tool.fechaPrestamo || new Date().toISOString().split('T')[0]
      );
    }
  }, [tool]);

  if (!tool) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prestadaA.trim()) return;
    onConfirm(tool.id, prestadaA.trim(), fechaPrestamo);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loan-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-[#2E3440] dark:bg-[#1E2229]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="loan-modal-title"
              className="font-display text-xl font-bold text-gray-950 dark:text-white"
            >
              Registrar préstamo
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {tool.nombre} ·{' '}
              <span className="font-mono text-xs">{tool.modelo}</span>
            </p>
          </div>
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
              htmlFor="loan-person"
              className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
            >
              ¿A quién se prestó?
            </label>
            <div className="relative">
              <UserCheck className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="loan-person"
                type="text"
                required
                autoFocus
                value={prestadaA}
                onChange={(e) => setPrestadaA(e.target.value)}
                placeholder="Ej. Carlos Méndez, Hermano, Obra patio..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pr-3 pl-9 text-sm text-gray-950 placeholder:text-gray-400 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="loan-date"
              className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
            >
              Fecha del préstamo
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="loan-date"
                type="date"
                required
                value={fechaPrestamo}
                onChange={(e) => setFechaPrestamo(e.target.value)}
                className="font-mono w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pr-3 pl-9 text-sm text-gray-950 focus:border-[#F59E0B] focus:outline-none dark:border-[#323946] dark:bg-[#121417] dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-[#323946] dark:text-gray-300 dark:hover:bg-[#252A33]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#F59E0B] px-4 py-2 text-sm font-semibold text-[#121417] transition-colors hover:bg-[#D97706] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]"
            >
              Confirmar préstamo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
