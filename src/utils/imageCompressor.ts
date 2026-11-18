export interface CompressedImageResult {
  dataUrl: string;
  sizeKB: number;
}

/**
 * Compresses and resizes an image File client-side using HTML5 Canvas so it
 * remains lightweight (~15–35 KB) for localStorage and JSON backups while
 * staying sharp both in card thumbnails and quick zoom modals.
 */
export function compressToolPhoto(
  file: File,
  maxDimension = 480,
  quality = 0.78
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () =>
        reject(new Error('El archivo seleccionado no es una imagen válida.'));

      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Prefer WebP when supported, fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const approximateBytes = Math.round((dataUrl.length * 3) / 4);
        const sizeKB = Math.max(1, Math.round(approximateBytes / 1024));
        resolve({ dataUrl, sizeKB });
      };

      img.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}
