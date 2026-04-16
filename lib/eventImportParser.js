function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

export function parseCsvText(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = cells[index] ?? '';
      return row;
    }, {});
  });
}

export function parseJsonText(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed.events)) {
    return parsed.events;
  }

  return [parsed];
}

export function detectKeys(rows) {
  const set = new Set();
  rows.forEach((row) => {
    Object.keys(row ?? {}).forEach((key) => set.add(key));
  });
  return Array.from(set);
}
