import { User } from '../types/auth';
import { CsvRecord, CsvError, UploadResult, RetryResponse, FieldErrors } from '../types/upload';

// --- Auth ---

interface LoginSuccess {
  ok: true;
  data: User & { token: string };
}

interface LoginFailure {
  ok: false;
  error: string;
}

type LoginResponse = LoginSuccess | LoginFailure;

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
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
  return { ok: false, error: 'Credenciales inválidas' };
}

// --- CSV parsing helpers ---

function validateRow(row: Record<string, string>): FieldErrors | null {
  const details: FieldErrors = {};

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

function splitLine(line: string, sep: string): string[] {
  const result: string[] = [];
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

function cleanStr(s: string): string {
  return s.replace(/\r/g, '').replace(/^\uFEFF/, '').trim();
}

async function parseCSV(file: File): Promise<UploadResult> {
  const text = await file.text();
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.trim().split('\n');

  if (lines.length < 2) return { success: [], errors: [] };

  const rawHeader = cleanStr(lines[0]);
  const sep = rawHeader.includes(';') ? ';' : ',';
  const headers = splitLine(rawHeader, sep).map((h) => cleanStr(h).toLowerCase());

  const success: CsvRecord[] = [];
  const errors: CsvError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = cleanStr(lines[i]);
    if (!line) continue;

    const values = splitLine(line, sep).map(cleanStr);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? '';
    });

    const rowNumber = i + 1;
    const validationErrors = validateRow(row);

    if (validationErrors) {
      errors.push({ row: rowNumber, data: { name: row.name, email: row.email, age: row.age }, details: validationErrors });
    } else {
      success.push({ name: row.name.trim(), email: row.email.trim(), age: Number(row.age) });
    }
  }

  return { success, errors };
}

// --- Upload ---

interface UploadSuccess {
  ok: true;
  data: UploadResult;
}

interface UploadFailure {
  ok: false;
  error: string;
}

type UploadResponse = UploadSuccess | UploadFailure;

export async function apiUpload(file: File): Promise<UploadResponse> {
  const { success, errors } = await parseCSV(file);
  return { ok: true, data: { success, errors } };
}

// --- Retry ---

export async function apiRetryRow(rowData: CsvRecord): Promise<RetryResponse> {
  return {
    ok: true,
    data: { ...rowData },
  };
}