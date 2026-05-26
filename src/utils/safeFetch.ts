export type SafeFetchResult<T> = {
  data: T | null
  error: string
  ok: boolean
  status: number
}

type SafeFetchOptions = RequestInit & {
  retries?: number
  timeoutMs?: number
}

export async function safeFetchJson<T>(
  url: string,
  options: SafeFetchOptions = {},
): Promise<SafeFetchResult<T>> {
  const { retries = 0, timeoutMs = 8000, ...fetchOptions } = options
  let lastError = ''

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })
      const text = await response.text()

      window.clearTimeout(timeout)

      if (!response.ok) {
        return {
          data: null,
          error: `HTTP ${response.status}`,
          ok: false,
          status: response.status,
        }
      }

      try {
        return {
          data: text ? (JSON.parse(text) as T) : ({} as T),
          error: '',
          ok: true,
          status: response.status,
        }
      } catch {
        return {
          data: null,
          error: 'Invalid JSON response',
          ok: false,
          status: response.status,
        }
      }
    } catch (error) {
      window.clearTimeout(timeout)
      lastError =
        error instanceof Error && error.name === 'AbortError'
          ? 'Request timed out'
          : error instanceof Error
            ? error.message
            : 'Network request failed'
    }
  }

  return {
    data: null,
    error: lastError,
    ok: false,
    status: 0,
  }
}
