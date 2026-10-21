/**
 * QUANTERS v2.1 — Automatic Image Validator, Square Cropper & WebP Compressor (§3.3)
 * Every uploaded image (avatars, workshop icons, badge icons, news images) is:
 * 1. Checked to be a valid image
 * 2. Cropped (1:1 square for avatars, or aspect-preserved for covers)
 * 3. Resized to a small standard size (e.g. 256x256 for avatars)
 * 4. Compressed to light WebP format (~15-35 KB)
 * 5. Original heavy file is discarded
 */

export interface CompressedImageResult {
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
  format: string;
}

export async function compressAndResizeImage(
  file: File,
  options: {
    maxDimension?: number;
    squareCrop?: boolean;
    quality?: number;
    maxUploadMB?: number;
  } = {}
): Promise<CompressedImageResult> {
  const {
    maxDimension = 256,
    squareCrop = true,
    quality = 0.78,
    maxUploadMB = 15,
  } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error("Uploaded file must be a valid image (PNG, JPG, WebP).");
  }

  if (file.size > maxUploadMB * 1024 * 1024) {
    throw new Error(`Image exceeds maximum upload limit of ${maxUploadMB} MB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid or corrupted image file."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable."));
          return;
        }

        let sx = 0;
        let sy = 0;
        let sWidth = img.width;
        let sHeight = img.height;
        let targetWidth = maxDimension;
        let targetHeight = maxDimension;

        if (squareCrop) {
          const minSide = Math.min(img.width, img.height);
          sx = (img.width - minSide) / 2;
          sy = (img.height - minSide) / 2;
          sWidth = minSide;
          sHeight = minSide;
          targetWidth = maxDimension;
          targetHeight = maxDimension;
        } else {
          const ratio = img.width / img.height;
          if (img.width > img.height) {
            targetWidth = maxDimension;
            targetHeight = Math.round(maxDimension / ratio);
          } else {
            targetHeight = maxDimension;
            targetWidth = Math.round(maxDimension * ratio);
          }
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

        const webpDataUrl = canvas.toDataURL("image/webp", quality);
        const base64Length = webpDataUrl.split(",")[1]?.length || 0;
        const compressedBytes = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl: webpDataUrl,
          originalBytes: file.size,
          compressedBytes,
          width: targetWidth,
          height: targetHeight,
          format: "image/webp",
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}
