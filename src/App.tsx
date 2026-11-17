import { Download, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { InventoryTab } from './components/InventoryTab';
import { LoanModal } from './components/LoanModal';
import { NotesTab } from './components/NotesTab';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ShoppingTab } from './components/ShoppingTab';
import { ToolFormModal } from './components/ToolFormModal';
import {
  INITIAL_NOTES,
  INITIAL_SHOPPING_ITEMS,
  INITIAL_TOOLS,
} from './data/initialData';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  ShoppingItem,
  TabId,
  ThemeMode,
  Tool,
  WorkshopNote,
} from './types/workshop';

function generateId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('inventario');

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = window.localStorage.getItem('mi_taller_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('mi_taller_theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const [tools, setTools] = useLocalStorage<Tool[]>(
    'mi_taller_tools_v1',
    INITIAL_TOOLS
  );
  const [shoppingItems, setShoppingItems] = useLocalStorage<ShoppingItem[]>(
    'mi_taller_shopping_v1',
    INITIAL_SHOPPING_ITEMS
  );
  const [notes, setNotes] = useLocalStorage<WorkshopNote[]>(
    'mi_taller_notes_v1',
    INITIAL_NOTES
  );

  // Modals & cross-tab shortcuts
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [loanModalTool, setLoanModalTool] = useState<Tool | null>(null);
  const [preselectedToolForShopping, setPreselectedToolForShopping] = useState<
    string | null
  >(null);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showBackupNotice = (msg: string) => {
    setBackupNotice(msg);
    window.setTimeout(() => setBackupNotice(null), 3500);
  };

  const handleExportBackup = () => {
    const payload = {
      app: 'Taller Multiespacio',
      exportedAt: new Date().toISOString(),
      tools,
      shoppingItems,
      notes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taller-multiespacio-respaldo-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showBackupNotice('Respaldo descargado');
  };

  const handleImportBackup = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (
          Array.isArray(parsed.tools) &&
          Array.isArray(parsed.shoppingItems) &&
          Array.isArray(parsed.notes)
        ) {
          setTools(parsed.tools);
          setShoppingItems(parsed.shoppingItems);
          setNotes(parsed.notes);
          showBackupNotice('Respaldo restaurado correctamente');
        } else {
          showBackupNotice('El archivo no tiene el formato de respaldo');
        }
      } catch {
        showBackupNotice('No se pudo leer el archivo JSON');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Tool handlers
  const handleSaveTool = (
    data: Omit<Tool, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTools((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...data } : t))
      );
    } else {
      const newTool: Tool = {
        ...data,
        id: generateId('tool'),
        createdAt: new Date().toISOString(),
      };
      setTools((prev) => [newTool, ...prev]);
    }
  };

  const handleDeleteTool = (toolId: string) => {
    setTools((prev) => prev.filter((t) => t.id !== toolId));
    // Desvincular ítems de compra que apuntaban a la herramienta eliminada
    setShoppingItems((prev) =>
      prev.map((item) =>
        item.toolId === toolId ? { ...item, toolId: undefined } : item
      )
    );
  };

  const handleConfirmLoan = (
    toolId: string,
    prestadaA: string,
    fechaPrestamo: string
  ) => {
    setTools((prev) =>
      prev.map((t) =>
        t.id === toolId
          ? {
              ...t,
              estado: 'Prestada',
              prestadaA,
              fechaPrestamo,
            }
          : t
      )
    );
    setLoanModalTool(null);
  };

  const handleReturnTool = (toolId: string) => {
    setTools((prev) =>
      prev.map((t) =>
        t.id === toolId
          ? {
              ...t,
              estado: 'Disponible',
              prestadaA: undefined,
              fechaPrestamo: undefined,
            }
          : t
      )
    );
  };

  const handleQuickAddPartForTool = (toolId: string) => {
    setPreselectedToolForShopping(toolId);
    setActiveTab('compras');
  };

  // Shopping handlers
  const handleAddShoppingItem = (
    data: Omit<ShoppingItem, 'id' | 'createdAt' | 'comprado'>
  ) => {
    const newItem: ShoppingItem = {
      ...data,
      id: generateId('shop'),
      comprado: false,
      createdAt: new Date().toISOString(),
    };
    setShoppingItems((prev) => [newItem, ...prev]);
  };

  const handleTogglePurchased = (itemId: string) => {
    setShoppingItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              comprado: !item.comprado,
              compradoAt: !item.comprado ? new Date().toISOString() : undefined,
            }
          : item
      )
    );
  };

  const handleDeleteShoppingItem = (itemId: string) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleClearPurchased = () => {
    setShoppingItems((prev) => prev.filter((item) => !item.comprado));
  };

  // Notes handlers
  const handleSaveNote = (
    data: Omit<WorkshopNote, 'id' | 'updatedAt'>,
    existingId?: string
  ) => {
    const now = new Date().toISOString();
    if (existingId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === existingId ? { ...n, ...data, updatedAt: now } : n
        )
      );
    } else {
      const newNote: WorkshopNote = {
        ...data,
        id: generateId('note'),
        updatedAt: now,
      };
      setNotes((prev) => [newNote, ...prev]);
    }
  };

  const handleTogglePinNote = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, fijada: !n.fijada } : n))
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6] text-[#111827] transition-colors duration-200 dark:bg-[#121417] dark:text-[#F3F4F6]">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'inventario' && (
              <InventoryTab
                tools={tools}
                shoppingItems={shoppingItems}
                onAddToolClick={() => {
                  setEditingTool(null);
                  setToolModalOpen(true);
                }}
                onEditTool={(tool) => {
                  setEditingTool(tool);
                  setToolModalOpen(true);
                }}
                onDeleteTool={handleDeleteTool}
                onRequestLoan={(tool) => setLoanModalTool(tool)}
                onReturnTool={handleReturnTool}
                onQuickAddPartForTool={handleQuickAddPartForTool}
                onGoToShopping={() => setActiveTab('compras')}
              />
            )}

            {activeTab === 'compras' && (
              <ShoppingTab
                items={shoppingItems}
                tools={tools}
                preselectedToolId={preselectedToolForShopping}
                onClearPreselectedTool={() =>
                  setPreselectedToolForShopping(null)
                }
                onAddItem={handleAddShoppingItem}
                onTogglePurchased={handleTogglePurchased}
                onDeleteItem={handleDeleteShoppingItem}
                onClearPurchased={handleClearPurchased}
              />
            )}

            {activeTab === 'notas' && (
              <NotesTab
                notes={notes}
                onSaveNote={handleSaveNote}
                onTogglePin={handleTogglePinNote}
                onDeleteNote={handleDeleteNote}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-gray-200 bg-white/70 py-4 text-xs text-gray-500 transition-colors dark:border-[#2A303A] dark:bg-[#121417] dark:text-gray-400">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <span>© 2026. Desarrollo Web e IA por GORCK.</span>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {backupNotice && (
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                {backupNotice}
              </span>
            )}
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-[#F59E0B] hover:text-gray-950 dark:border-[#2E3440] dark:text-gray-300 dark:hover:border-[#F59E0B]/70 dark:hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar respaldo</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-[#F59E0B] hover:text-gray-950 dark:border-[#2E3440] dark:text-gray-300 dark:hover:border-[#F59E0B]/70 dark:hover:text-white"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Importar respaldo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportBackup}
              className="hidden"
              aria-label="Importar archivo de respaldo JSON"
            />
          </div>
        </div>
      </footer>

      <OfflineIndicator />

      <ToolFormModal
        isOpen={toolModalOpen}
        editingTool={editingTool}
        onClose={() => {
          setToolModalOpen(false);
          setEditingTool(null);
        }}
        onSave={handleSaveTool}
      />

      <LoanModal
        tool={loanModalTool}
        onClose={() => setLoanModalTool(null)}
        onConfirm={handleConfirmLoan}
      />
    </div>
  );
}
