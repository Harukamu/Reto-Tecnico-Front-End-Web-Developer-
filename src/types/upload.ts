export interface CsvRecord {
  name: string;
  email: string;
  age: number;
}

export interface CsvError {
  row: number;
  data?:{
  name: string;
  email: string;
  age: string;
  error?: string;
  };
  details?: FieldErrors;
}

export interface FieldErrors {
  name?: string;
  email?: string;
  age?: string;
}

export interface ResolvedError {
  row: number;
  record: CsvRecord;
}

export interface UploadResult {
  success: CsvRecord[];
  errors: CsvError[];
}

export interface RetryResponse {
  ok: boolean;
  data: CsvRecord;
  error?: string;
}