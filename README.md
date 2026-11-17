# Taller Multiespacio

Aplicación web con estética de taller industrial para gestionar el inventario de herramientas del hogar, lista inteligente de compras de repuestos y tablero de notas rápidas.

## Funcionalidades

- **Inventario**: Resumen en tiempo real (total, disponibles, prestadas y herramientas con repuestos pendientes), buscador, filtros por categoría y ubicación, registro de préstamos (persona y fecha) y alertas automáticas vinculadas a repuestos sin comprar.
- **Lista de Compras**: Categorías diferenciadas (`Repuesto`, `Accesorio`, `Material`), vinculación automática con herramientas del inventario (autocompleta marca y modelo) y confirmación de compra que actualiza el inventario al instante.
- **Notas e Ideas**: Tablero visual de apuntes rápidos con opción para fijar arriba, clasificar por tono y buscar medidas o referencias.
- **Modo Oscuro y Modo Claro**: Alternancia inmediata desde la barra superior y persistencia automática en `localStorage`.

## Desarrollo local

Requiere [Node.js](https://nodejs.org) 18 o superior:

```bash
npm install
npm run dev
```

Para generar la compilación de producción:

```bash
npm run build
```

## Publicación en GitHub Pages

Este repositorio incluye el flujo automático `.github/workflows/deploy.yml`:

1. Sube el proyecto a la rama `main` de tu repositorio en GitHub.
2. En GitHub, entra a **Settings → Pages**.
3. En **Source**, selecciona **GitHub Actions**.

---

© 2026. Desarrollo Web e IA por GORCK.
