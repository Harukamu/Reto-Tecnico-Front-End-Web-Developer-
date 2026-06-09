export async function apiLogin(email, password) {
  if (email === 'admin@mail.com' && password === 'supersecret') {
    return {
      ok: true,
      data: {
        email: 'admin@mail.com',
        name: 'Mr. Admin',
        role: 'admin',
        token: `mock-jwt-${Date.now()}`,
      },
    };
  }
 
  return {
    ok: false,
    error: 'Credenciales inválidas',
  };
}
 
// Validates a single parsed row and returns an error details object (or null if valid)
function validateRow(row) {
  const details = {};
 
  if (!row.name || row.name.trim() === '') {
    details.name = "El campo 'name' no puede estar vacío.";
  } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(row.name.trim())) {
    details.name = "El campo 'name' tiene un formato inválido.";
  }
 
  if (!row.email || row.email.trim() === '') {
    details.email = "El campo 'email' no puede estar vacío.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
    details.email = "El formato del campo 'email' es inválido.";
  }
 
  if (row.age === undefined || row.age === '') {
    details.age = "El campo 'age' no puede estar vacío.";
  } else if (isNaN(Number(row.age)) || Number(row.age) <= 0) {
    details.age = "El campo 'age' debe ser un número positivo.";
  }
 
  return Object.keys(details).length > 0 ? details : null;
}
 
// Splits a CSV line respecting quoted values and a given separator
function splitLine(line, sep) {
  const result = [];
  let current = '';
  let inQuotes = false;
 
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === sep && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}
 
// Strips invisible/control characters (including Windows \r) but keeps accented chars
function cleanStr(s) {
  return s.replace(/\r/g, '').replace(/^\uFEFF/, '').trim();
}
 
// Parses a CSV file and returns { success, errors }
async function parseCSV(file) {
  const text = await file.text();
 
  // Normalize line endings: handle \r\n (Windows) and \r (old Mac)
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.trim().split('\n');
 
  if (lines.length < 2) {
    return { success: [], errors: [] };
  }
 
  // Strip BOM from header
  const rawHeader = cleanStr(lines[0]);
 
  // Auto-detect separator: semicolon (Excel ES/PT) or comma
  const sep = rawHeader.includes(';') ? ';' : ',';
 
  const headers = splitLine(rawHeader, sep).map((h) => cleanStr(h).toLowerCase());
 
  console.log('[parseCSV] separator:', JSON.stringify(sep));
  console.log('[parseCSV] headers:', headers);
  console.log('[parseCSV] total data lines:', lines.length - 1);
 
  const success = [];
  const errors = [];
 
  for (let i = 1; i < lines.length; i++) {
    const line = cleanStr(lines[i]);
    if (!line) continue;
 
    const values = splitLine(line, sep).map(cleanStr);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? '';
    });
 
    console.log(`[parseCSV] row ${i + 1}:`, row);
 
    const rowNumber = i + 1; // 1-based including header row
    const validationErrors = validateRow(row);
 
    if (validationErrors) {
      errors.push({
        row: rowNumber,
        data: row,
        details: validationErrors,
      });
    } else {
      success.push({
        id: success.length + 1,
        name: row.name.trim(),
        email: row.email.trim(),
        age: Number(row.age),
      });
    }
  }
 
  console.log('[parseCSV] success:', success.length, '| errors:', errors.length);
 
  return { success, errors };
}
 
/**
 * POST /api/upload — reads and validates the actual CSV file
 */
export async function apiUpload(file) {
  const { success, errors } = await parseCSV(file);
 
  return {
    ok: true,
    data: { success, errors },
  };
}
 
/**
 * POST /api/retry — retries a single row
 */
export async function apiRetryRow(rowData) {
  return {
    ok: true,
    data: {
      id: Math.floor(Math.random() * 9000) + 1000,
      ...rowData,
    },
  };
}