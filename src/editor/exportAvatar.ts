import type Konva from 'konva';

/** Nodes with this name are editing aids and are hidden when exporting. */
export const HELPER = 'helper';

/** Renders the canvas to a square PNG without the editing aids. */
export async function exportAvatar(stage: Konva.Stage, outputSize = 1024): Promise<Blob> {
  const helpers = stage.find(`.${HELPER}`);
  helpers.forEach((n) => n.hide());
  try {
    const blob = await stage.toBlob({
      pixelRatio: outputSize / stage.width(),
      mimeType: 'image/png',
    });
    if (!(blob instanceof Blob)) throw new Error('Export failed');
    return blob;
  } finally {
    helpers.forEach((n) => n.show());
  }
}
