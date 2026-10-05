/**
 * Cyber Twin API Client
 * Configured via VITE_API_BASE_URL.
 * Gracefully falls back to mock services when backend is offline or VITE_USE_MOCK_DATA is true.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const FORCE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  mockFallback: () => T | Promise<T>
): Promise<T> {
  if (FORCE_MOCK) {
    // Artificial small delay to simulate network feel in UI
    await new Promise((resolve) => setTimeout(resolve, 80));
    return mockFallback();
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      console.warn(`[Cyber Twin API] HTTP ${response.status} on ${endpoint}, falling back to mock.`);
      return mockFallback();
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[Cyber Twin API] Backend unavailable at ${BASE_URL}${endpoint}. Serving mock forensic records.`);
    return mockFallback();
  }
}
