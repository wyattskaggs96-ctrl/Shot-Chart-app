export function downloadDataUri(dataUri, filename) {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = filename;
  link.click();
}

export async function exportSvgElementToPng(svgElement, width, height, filename) {
  const serializer = new XMLSerializer();
  const svgMarkup = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.src = url;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas rendering context is unavailable.');
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    downloadDataUri(canvas.toDataURL('image/png'), filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function exportShotsToCsv(shots) {
  const headers = [
    'id',
    'makeMiss',
    'zone',
    'x',
    'y',
    'timestampSeconds',
    'shotType',
    'notes',
    'createdAt',
  ];

  const rows = shots.map((shot) =>
    headers
      .map((key) => {
        const value = shot[key] ?? '';
        return `"${String(value).replaceAll('"', '""')}"`;
      })
      .join(','),
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `shot-list-${Date.now()}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
