export type TabId = 'inventario' | 'compras' | 'notas';

export type ThemeMode = 'dark' | 'light';

export type ToolCategory =
  | 'Eléctricas'
  | 'Manuales'
  | 'Medición'
  | 'Jardinería'
  | 'Ferretería';

export type ToolLocationZone =
  | 'Garaje'
  | 'Caja de herramientas'
  | 'Bodega';

export type ToolStatus = 'Disponible' | 'Prestada';

export interface Tool {
  id: string;
  nombre: string;
  marca: string;
  modelo: string;
  categoria: ToolCategory;
  ubicacionZona: ToolLocationZone;
  ubicacionExacta: string;
  estado: ToolStatus;
  prestadaA?: string;
  fechaPrestamo?: string;
  createdAt: string;
}

export type ShoppingCategory = 'Repuesto' | 'Accesorio' | 'Material';

export interface ShoppingItem {
  id: string;
  nombre: string;
  categoria: ShoppingCategory;
  cantidad: string;
  toolId?: string;
  marca: string;
  modelo: string;
  medidas: string;
  comprado: boolean;
  compradoAt?: string;
  createdAt: string;
}

export type NoteTone = 'neutral' | 'amber' | 'blue' | 'emerald';

export interface WorkshopNote {
  id: string;
  titulo: string;
  contenido: string;
  fijada: boolean;
  tono: NoteTone;
  updatedAt: string;
}
