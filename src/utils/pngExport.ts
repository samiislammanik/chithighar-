import { toPng, toBlob } from 'html-to-image';

export interface ExportOptions {
  fileName?: string;
  authorUsername?: string;
  isAnonymous?: boolean;
  scale?: number;
}

/**
 * Converts a data URL to a Blob
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Exports a DOM element representing a letter to a high-resolution PNG image.
 * Uses native browser foreignObject SVG rendering via html-to-image, which natively
 * supports Tailwind v4 modern color functions (oklab, oklch), Bengali typography,
 * shadows, borders, wax seals, and watermarks without JavaScript parser errors.
 */
export async function exportLetterToPng(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  const {
    fileName = 'chithighor-letter.png',
    scale = 2, // 2x for high-DPI Retina sharpness
  } = options;

  try {
    // Ensure document fonts have completed rendering
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (fontErr) {
        console.warn('Font loading check completed with notice:', fontErr);
      }
    }

    let dataUrl: string;

    // Primary attempt with full font embedding
    try {
      dataUrl = await toPng(element, {
        pixelRatio: scale,
        cacheBust: true,
        // Filter out non-exportable interactive elements if tagged
        filter: (node) => {
          if (node instanceof HTMLElement && node.dataset.noExport === 'true') {
            return false;
          }
          return true;
        },
      });
    } catch (primaryErr) {
      console.warn('Primary toPng capture had notice, retrying with skipFonts fallback:', primaryErr);
      // Fallback: Skip font-inlining to avoid any CORS stylesheet restrictions
      dataUrl = await toPng(element, {
        pixelRatio: scale,
        skipFonts: true,
        filter: (node) => {
          if (node instanceof HTMLElement && node.dataset.noExport === 'true') {
            return false;
          }
          return true;
        },
      });
    }

    if (!dataUrl || !dataUrl.startsWith('data:image/png')) {
      throw new Error('Render output is invalid or empty');
    }

    // Attempt Web Share with File on mobile devices (Android / iOS)
    let sharedViaMobile = false;
    if (typeof navigator !== 'undefined' && 'canShare' in navigator && 'share' in navigator) {
      try {
        let blob: Blob | null = null;
        try {
          blob = await toBlob(element, { pixelRatio: scale });
        } catch {
          blob = dataUrlToBlob(dataUrl);
        }

        if (blob) {
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'চিঠিঘর — ডিজিটাল চিঠি',
              text: 'চিঠিঘর (Chithighor) থেকে সংরক্ষিত চিঠি',
            });
            sharedViaMobile = true;
          }
        }
      } catch (shareErr) {
        // User cancelled sheet or share declined, proceed gracefully to direct download
        console.info('Mobile share sheet dismissed or unavailable, continuing with direct file download.');
      }
    }

    // Direct browser file download if not already shared via native mobile share sheet
    if (!sharedViaMobile) {
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    return { success: true, dataUrl };
  } catch (err) {
    console.error('Error generating letter PNG:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to export letter image',
    };
  }
}
