import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { InventoryTab } from './components/InventoryTab';
import { LoanModal } from './components/LoanModal';
import { NotesTab } from './components/NotesTab';
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

      <footer className="border-t border-gray-200 bg-white/70 py-4 text-center text-xs text-gray-500 transition-colors dark:border-[#2A303A] dark:bg-[#121417] dark:text-gray-400">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          © 2026. Desarrollo Web e IA por GORCK.
        </div>
      </footer>

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
