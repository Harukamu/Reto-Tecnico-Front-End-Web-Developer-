// Simulated API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simulates POST /api/login
 */
export async function apiLogin(email, password) {
  await delay(800);

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

/**
 * Simulates POST /api/upload
 */
export async function apiUpload(file) {
  await delay(1200);

  // Parse CSV rows count for realistic simulation
  const text = await file.text();
  const rows = text.trim().split('\n').slice(1); // skip header

  // Simulate: most rows succeed, some have errors
  const success = [
    { id: 1, name: 'Juan Pérez', email: 'juan.perez@example.com', age: 28 },
    { id: 2, name: 'María García', email: 'maria.garcia@example.com', age: 34 },
    { id: 3, name: 'Carlos López', email: 'carlos.lopez@example.com', age: 22 },
    { id: 5, name: 'Ana Martínez', email: 'ana.martinez@example.com', age: 45 },
    { id: 6, name: 'Luis Rodríguez', email: 'luis.rodriguez@example.com', age: 31 },
  ];

  const errors = [
    {
      row: 4,
      data: { name: 'Testino Dipenbea', email: 'testim', age: 25 },
      details: {
        email: "El formato del campo 'email' es inválido.",
      },
    },
    {
      row: 12,
      data: { name: '', email: 'mario@mail.com', age: 'abc' },
      details: {
        name: "El campo 'name' no puede estar vacío.",
        age: "El campo 'age' debe ser un número positivo.",
      },
    },
    {
      row: 11,
      data: { name: '123', email: 'mario@mail.com', age: 'abc' },
      details: {
        name: "El campo 'name' tiene un formato inválido.",
        age: "El campo 'age' debe ser un número positivo.",
      },
    },
  ];

  return {
    ok: true,
    data: { success, errors },
  };
}

/**
 * Simulates POST /api/retry — retries a single row
 */
export async function apiRetryRow(rowData) {
  await delay(600);
  return {
    ok: true,
    data: {
      id: Math.floor(Math.random() * 9000) + 1000,
      ...rowData,
    },
  };
}
