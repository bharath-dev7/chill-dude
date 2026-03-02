/* eslint-disable no-console */
const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:5000';
const TEST_PASSWORD = process.env.SMOKE_TEST_PASSWORD || 'smoke-test-password-123';

interface RegisterResponse {
  token: string;
  user: { id: string; email: string };
}

async function request(path: string, options: RequestInit = {}, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload?.message ? payload.message : String(payload);
    throw new Error(`${response.status} ${response.statusText}: ${message}`);
  }

  return payload;
}

async function run(): Promise<void> {
  const email = `smoke_${Date.now()}@example.com`;

  console.log(`Running smoke check against ${BASE_URL}`);
  console.log(`Creating test user: ${email}`);

  const registerPayload = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  }) as RegisterResponse;

  const token = registerPayload.token;
  if (!token) {
    throw new Error('Auth token missing from register response.');
  }

  const initialState = await request('/api/app/state', { method: 'GET' }, token);
  console.log('Initial state fetched.');

  await request('/api/app/scan', {
    method: 'POST',
    body: JSON.stringify({ emotion: 'neutral', confidence: 0.7 }),
  }, token);

  await request('/api/app/journal', {
    method: 'POST',
    body: JSON.stringify({ text: 'Today felt intense but manageable. I stayed focused and completed key tasks.' }),
  }, token);

  await request('/api/app/tasks', {
    method: 'POST',
    body: JSON.stringify({ title: 'Smoke task', dueDate: initialState.todayKey }),
  }, token);

  const finalState = await request('/api/app/state', { method: 'GET' }, token);

  console.log('Smoke check complete. Summary:');
  console.log(`- Today key: ${finalState.todayKey}`);
  console.log(`- Face scan stored: ${Boolean(finalState.todayFaceScan)}`);
  console.log(`- Journal stored: ${Boolean(finalState.todayEntry)}`);
  console.log(`- Tasks count: ${Array.isArray(finalState.tasks) ? finalState.tasks.length : 0}`);
  console.log(`- Notifications count: ${Array.isArray(finalState.notifications) ? finalState.notifications.length : 0}`);
}

run().catch((error) => {
  console.error('Smoke check failed:', error.message);
  process.exitCode = 1;
});
