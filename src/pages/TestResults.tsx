import { useEffect, useState } from "react"
import { fetchRemoteEvents } from "../lib/analytics/remote"
import { formatRate, summarizeEvents } from "../lib/analytics/summarize"
import { getStoredEvents } from "../lib/analytics"
import { isRemoteAnalyticsConfigured } from "../lib/env"
import type { AnalyticsEvent } from "../types/analytics"

export function TestResults() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [source, setSource] = useState<"remote" | "local" | "empty">("empty")
  const [status, setStatus] = useState("Loading…")

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (isRemoteAnalyticsConfigured()) {
        const remote = await fetchRemoteEvents()
        if (cancelled) return
        if (remote) {
          setEvents(remote)
          setSource("remote")
          setStatus(`${remote.length} remote events`)
          return
        }
        setStatus("Remote fetch failed. Showing local events.")
      } else {
        setStatus("Supabase is not configured. Showing local events.")
      }
      const local = getStoredEvents()
      if (cancelled) return
      setEvents(local)
      setSource(local.length > 0 ? "local" : "empty")
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const { overall, products } = summarizeEvents(events)

  return (
    <main className="results">
      <header className="results__header">
        <p className="results__kicker">RESEARCH · NOT THE MACHINE</p>
        <h1>Test results</h1>
        <p className="results__meta">
          {status} · source {source}
        </p>
        <p>
          <a href="/">← Back to the machine</a>
        </p>
      </header>

      <section className="results__overall">
        <h2>Overall</h2>
        <dl>
          <div>
            <dt>Sessions</dt>
            <dd>{overall.sessions}</dd>
          </div>
          <div>
            <dt>Products shown</dt>
            <dd>{overall.shown}</dd>
          </div>
          <div>
            <dt>Selections</dt>
            <dd>{overall.selections}</dd>
          </div>
          <div>
            <dt>Vends</dt>
            <dd>{overall.vends}</dd>
          </div>
          <div>
            <dt>Restocks</dt>
            <dd>{overall.restocks}</dd>
          </div>
          <div>
            <dt>Shares</dt>
            <dd>{overall.shares}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2>Product performance</h2>
        <div className="results__table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Shown</th>
                <th>Selections</th>
                <th>Vends</th>
                <th>Keep</th>
                <th>Own</th>
                <th>Shares</th>
                <th>Vend rate</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8}>No events yet.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.productId}>
                    <td>
                      {product.name}
                      <div className="results__id">{product.productId}</div>
                    </td>
                    <td>{product.shown}</td>
                    <td>{product.selections}</td>
                    <td>{product.vends}</td>
                    <td>{product.keepVotes}</td>
                    <td>{product.alreadyOwn}</td>
                    <td>{product.shares}</td>
                    <td>{formatRate(product.vendRate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
