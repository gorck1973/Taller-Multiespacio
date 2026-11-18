import { Tool, ToolCategory, ToolIconId } from '../types/workshop';

export const TOOL_ICON_OPTIONS: { id: ToolIconId; label: string }[] = [
  { id: 'taladro', label: 'Taladro' },
  { id: 'amoladora', label: 'Amoladora' },
  { id: 'sierra', label: 'Sierra' },
  { id: 'llave', label: 'Llave' },
  { id: 'martillo', label: 'Martillo' },
  { id: 'destornillador', label: 'Destornillador' },
  { id: 'nivel', label: 'Nivel' },
  { id: 'medicion', label: 'Medición' },
  { id: 'jardineria', label: 'Jardinería' },
  { id: 'ferreteria', label: 'Ferretería' },
  { id: 'soldadora', label: 'Soldadora' },
  { id: 'generica', label: 'Caja / General' },
];

export function inferToolIcon(
  nombre: string,
  categoria: ToolCategory
): ToolIconId {
  const text = nombre.toLowerCase();

  if (/(amoladora|esmeril|pulidora|radial|disco)/.test(text)) {
    return 'amoladora';
  }
  if (/(taladro|percutor|rotomartillo|atornillador|barreno)/.test(text)) {
    return 'taladro';
  }
  if (/(sierra|caladora|ingletadora|cortadora|serrucho)/.test(text)) {
    return 'sierra';
  }
  if (/(martillo|mazo|combo|cincel)/.test(text)) {
    return 'martillo';
  }
  if (/(destornillador|desarmador|puntas)/.test(text)) {
    return 'destornillador';
  }
  if (/(llave|alicate|pinza|prensa|sargento|dado|trinquete|matraca)/.test(text)) {
    return 'llave';
  }
  if (/(nivel|láser|laser|plomada)/.test(text)) {
    return 'nivel';
  }
  if (/(metro|huincha|cinta|calibre|pie de rey|escuadra|multímetro|multimetro|tester|regla)/.test(text)) {
    return 'medicion';
  }
  if (/(soldad|inverter|cautín|cautin|pistola de calor|compresor|eléctr)/.test(text)) {
    return 'soldadora';
  }
  if (/(poda|tijera|bordeadora|cortacésped|desmalezadora|sopladora|motosierra|jardín|jardin|pala|rastrillo)/.test(text)) {
    return 'jardineria';
  }
  if (/(tornillo|tuerca|perno|clavo|tarugo|remache|bisagra)/.test(text)) {
    return 'ferreteria';
  }

  switch (categoria) {
    case 'Eléctricas':
      return 'taladro';
    case 'Manuales':
      return 'llave';
    case 'Medición':
      return 'medicion';
    case 'Jardinería':
      return 'jardineria';
    case 'Ferretería':
      return 'ferreteria';
    default:
      return 'generica';
  }
}

export function resolveToolIcon(tool: Pick<Tool, 'icono' | 'nombre' | 'categoria'>): ToolIconId {
  return tool.icono || inferToolIcon(tool.nombre, tool.categoria);
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

    case 'amoladora':
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
          {/* Hoja circular con dientes */}
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

    case 'llave':
      return (
        <svg {...shared}>
          <path d="M14.7 6.3a4 4 0 0 0 5.1 5.1l-8.4 8.4a2.1 2.1 0 1 1-3-3l8.4-8.4a4 4 0 0 0-5.1-5.1L14.2 5.8 11.4 8.6 8.9 6.1" />
          <circle cx="6.8" cy="17.2" r="0.6" fill="currentColor" />
        </svg>
      );

    case 'martillo':
      return (
        <svg {...shared}>
          {/* Cabeza del martillo */}
          <path d="M14.5 5.5L18.5 9.5L15.5 12.5L11.5 8.5L14.5 5.5Z" />
          <path d="M14.5 5.5C13 4 10.5 3.8 8.5 5.2L11.5 8.5" />
          {/* Mango */}
          <path d="M12.8 9.8L4.5 18.1C3.9 18.7 3.9 19.7 4.5 20.3C5.1 20.9 6.1 20.9 6.7 20.3L15 12" />
        </svg>
      );

    case 'destornillador':
      return (
        <svg {...shared}>
          {/* Mango */}
          <path d="M5 19L9.8 14.2" />
          <path d="M4.2 16.2L7.8 19.8C8.6 20.6 9.8 20.6 10.6 19.8L12.6 17.8C13.4 17 13.4 15.8 12.6 15L9 11.4C8.2 10.6 7 10.6 6.2 11.4L4.2 13.4C3.4 14.2 3.4 15.4 4.2 16.2Z" />
          {/* Vástago y punta */}
          <path d="M11.6 12.4L18.2 5.8" />
          <path d="M17.2 4.8L20 3.8L19.2 6.8L17.2 4.8Z" />
        </svg>
      );

    case 'nivel':
      return (
        <svg {...shared}>
          {/* Regla / cuerpo del nivel */}
          <rect x="2.5" y="8" width="19" height="8" rx="1.8" />
          {/* Burbuja central */}
          <rect x="9.2" y="9.8" width="5.6" height="4.4" rx="1" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          {/* Marcas laterales */}
          <path d="M6 10V14" />
          <path d="M18 10V14" />
        </svg>
      );

    case 'medicion':
      return (
        <svg {...shared}>
          {/* Escuadra / regla */}
          <path d="M4 20V4H9V15H20V20H4Z" />
          <path d="M4 8H6.5" />
          <path d="M4 12H6.5" />
          <path d="M4 16H6.5" />
          <path d="M12 20V17.5" />
          <path d="M16 20V17.5" />
        </svg>
      );

    case 'jardineria':
      return (
        <svg {...shared}>
          {/* Tijera de poda */}
          <circle cx="7" cy="17.5" r="2.5" />
          <circle cx="17" cy="17.5" r="2.5" />
          <path d="M8.8 15.6L16.5 5.5" />
          <path d="M15.2 15.6L7.5 5.5" />
          <circle cx="12" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'ferreteria':
      return (
        <svg {...shared}>
          {/* Tuerca hexagonal */}
          <path d="M12 3.2L19.5 7.6V16.4L12 20.8L4.5 16.4V7.6L12 3.2Z" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      );

    case 'soldadora':
      return (
        <svg {...shared}>
          {/* Rayo / equipo eléctrico / soldadora */}
          <rect x="3.5" y="6" width="17" height="12" rx="2" />
          <path d="M12.5 8.5L9.5 12.5H12.5L11.5 15.5L14.5 11.5H11.5L12.5 8.5Z" />
          <path d="M7 18V20" />
          <path d="M17 18V20" />
        </svg>
      );

    case 'generica':
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
