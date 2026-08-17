export function supabaseConfig(): { url: string; anonKey: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "")
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return { url, anonKey }
}

export function isRemoteAnalyticsConfigured(): boolean {
  return supabaseConfig() !== null
}

/** Enabled in local dev, or in production when VITE_ENABLE_TEST_RESULTS=true. */
export function isTestResultsEnabled(): boolean {
  if (import.meta.env.VITE_ENABLE_TEST_RESULTS === "true") return true
  if (import.meta.env.VITE_ENABLE_TEST_RESULTS === "false") return false
  return import.meta.env.DEV
}
