import { Tool, ToolCategory, ToolIconId } from '../types/workshop';

export const TOOL_ICON_OPTIONS: { id: ToolIconId; label: string }[] = [
  { id: 'esmeril', label: 'Esmeril' },
  { id: 'sierra', label: 'Sierra' },
  { id: 'lijadora', label: 'Lijadora' },
  { id: 'taladro', label: 'Taladro' },
  { id: 'llaves', label: 'Llaves' },
  { id: 'medicion', label: 'Medición' },
  { id: 'pintura', label: 'Pintura' },
  { id: 'ferreteria', label: 'Ferretería' },
  { id: 'caja', label: 'Caja de herramientas' },
];

const LEGACY_ICON_MAP: Record<string, ToolIconId> = {
  amoladora: 'esmeril',
  llave: 'llaves',
  nivel: 'medicion',
  generica: 'caja',
  martillo: 'caja',
  destornillador: 'llaves',
  jardineria: 'caja',
  soldadora: 'esmeril',
};

const VALID_ICON_IDS = new Set<string>(TOOL_ICON_OPTIONS.map((o) => o.id));

export function normalizeToolIconId(
  icon?: string
): ToolIconId | undefined {
  if (!icon) return undefined;
  if (VALID_ICON_IDS.has(icon)) return icon as ToolIconId;
  return LEGACY_ICON_MAP[icon];
}

export function inferToolIcon(
  nombre: string,
  categoria: ToolCategory
): ToolIconId {
  const text = nombre.toLowerCase();

  if (/(esmeril|amoladora|pulidora|radial|disco|desbaste)/.test(text)) {
    return 'esmeril';
  }
  if (/(sierra|caladora|ingletadora|cortadora|serrucho)/.test(text)) {
    return 'sierra';
  }
  if (/(lijadora|lija|orbital|rotoorbital|cepilladora)/.test(text)) {
    return 'lijadora';
  }
  if (/(taladro|percutor|rotomartillo|atornillador|barreno)/.test(text)) {
    return 'taladro';
  }
  if (/(llave|alicate|pinza|prensa|sargento|dado|trinquete|matraca|destornillador)/.test(text)) {
    return 'llaves';
  }
  if (/(nivel|láser|laser|metro|huincha|cinta|calibre|pie de rey|escuadra|multímetro|multimetro|tester|regla|plomada)/.test(text)) {
    return 'medicion';
  }
  if (/(pintura|rodillo|brocha|pincel|pistola de pintar|compresor|aerógrafo|aerografo|esmalte)/.test(text)) {
    return 'pintura';
  }
  if (/(tornillo|tuerca|perno|clavo|tarugo|remache|bisagra|ferretería|ferreteria)/.test(text)) {
    return 'ferreteria';
  }
  if (/(caja|maletín|maletin|estuche|organizador|baúl|baul|bolso)/.test(text)) {
    return 'caja';
  }

  switch (categoria) {
    case 'Eléctricas':
      return 'taladro';
    case 'Manuales':
      return 'llaves';
    case 'Medición':
      return 'medicion';
    case 'Ferretería':
      return 'ferreteria';
    case 'Jardinería':
    default:
      return 'caja';
  }
}

export function resolveToolIcon(
  tool: Pick<Tool, 'icono' | 'nombre' | 'categoria'>
): ToolIconId {
  return (
    normalizeToolIconId(tool.icono) ||
    inferToolIcon(tool.nombre, tool.categoria)
  );
}

interface ToolIconProps {
  icon: ToolIconId;
  className?: string;
}

export function ToolIcon({ icon, className = 'h-6 w-6' }: ToolIconProps) {
  const shared = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.85,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  };

  switch (icon) {
    case 'esmeril':
      return (
        <svg {...shared}>
          {/* Disco de corte */}
          <circle cx="8" cy="14.5" r="5" />
          <circle cx="8" cy="14.5" r="1.4" />
          {/* Guarda protectora */}
          <path d="M4.2 10.7A5.5 5.5 0 0 1 13.3 12.2" />
          {/* Cabezal y cuerpo */}
          <path d="M11 10.5L18.5 6.5C19.5 6 20.7 6.4 21.1 7.4C21.5 8.4 21.1 9.5 20.1 10L13 13.5" />
          {/* Mango auxiliar */}
          <path d="M13 8L11.2 4.8" />
        </svg>
      );

    case 'sierra':
      return (
        <svg {...shared}>
          {/* Hoja de sierra circular con dientes */}
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2.2" />
          <path d="M12 2.5V5" />
          <path d="M12 19V21.5" />
          <path d="M2.5 12H5" />
          <path d="M19 12H21.5" />
          <path d="M5.3 5.3L7 7" />
          <path d="M17 17L18.7 18.7" />
          <path d="M18.7 5.3L17 7" />
          <path d="M7 17L5.3 18.7" />
        </svg>
      );

    case 'lijadora':
      return (
        <svg {...shared}>
          {/* Base abrasiva plana */}
          <path d="M3.5 17.5H20.5" />
          <rect x="4" y="14.5" width="16" height="3" rx="0.8" />
          {/* Cuerpo motor de lijadora */}
          <path d="M6 14.5V10.5C6 9.4 6.9 8.5 8 8.5H15C16.7 8.5 18 9.8 18 11.5V14.5" />
          {/* Empuñadura superior */}
          <path d="M9 8.5V6.5C9 5.7 9.7 5 10.5 5H14C15.1 5 16 5.9 16 7V8.5" />
          {/* Toma de polvo lateral */}
          <path d="M6 11H3.5" />
        </svg>
      );

    case 'taladro':
      return (
        <svg {...shared}>
          {/* Cuerpo del taladro */}
          <path d="M4 7.5C4 6.7 4.7 6 5.5 6H14.5V12H5.5C4.7 12 4 11.3 4 10.5V7.5Z" />
          {/* Mandril y broca */}
          <path d="M14.5 7.5H17.5V10.5H14.5" />
          <path d="M17.5 9H21.5" />
          {/* Empuñadura y batería */}
          <path d="M8 12L6.5 18.5H10.5L11.5 12" />
          <path d="M5.5 18.5H11.5V20.5H5.5V18.5Z" />
          {/* Gatillo */}
          <path d="M11.3 13.5H12.8" />
        </svg>
      );

    case 'llaves':
      return (
        <svg {...shared}>
          <path d="M14.7 6.3a4 4 0 0 0 5.1 5.1l-8.4 8.4a2.1 2.1 0 1 1-3-3l8.4-8.4a4 4 0 0 0-5.1-5.1L14.2 5.8 11.4 8.6 8.9 6.1" />
          <circle cx="6.8" cy="17.2" r="0.6" fill="currentColor" />
        </svg>
      );

    case 'medicion':
      return (
        <svg {...shared}>
          {/* Escuadra técnica graduada */}
          <path d="M4 20V4H9V15H20V20H4Z" />
          <path d="M4 8H6.5" />
          <path d="M4 12H6.5" />
          <path d="M4 16H6.5" />
          <path d="M12 20V17.5" />
          <path d="M16 20V17.5" />
        </svg>
      );

    case 'pintura':
      return (
        <svg {...shared}>
          {/* Rodillo de pintura industrial */}
          <rect x="4" y="4" width="13.5" height="5.5" rx="1.4" />
          <path d="M17.5 6.8H19.5C20.1 6.8 20.5 7.2 20.5 7.8V10.5C20.5 11.3 19.9 12 19 12H12C11.2 12 10.5 12.7 10.5 13.5V15" />
          {/* Mango del rodillo */}
          <rect x="9" y="15" width="3" height="5.5" rx="1" />
        </svg>
      );

    case 'ferreteria':
      return (
        <svg {...shared}>
          {/* Tuerca hexagonal industrial */}
          <path d="M12 3.2L19.5 7.6V16.4L12 20.8L4.5 16.4V7.6L12 3.2Z" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      );

    case 'caja':
    default:
      return (
        <svg {...shared}>
          {/* Caja de herramientas */}
          <rect x="3" y="8.5" width="18" height="11" rx="2" />
          <path d="M8.5 8.5V6.5C8.5 5.4 9.4 4.5 10.5 4.5H13.5C14.6 4.5 15.5 5.4 15.5 6.5V8.5" />
          <path d="M3 13H21" />
          <path d="M10.5 13V15H13.5V13" />
        </svg>
      );
  }
}
