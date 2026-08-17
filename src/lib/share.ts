export function machineUrl(): string {
  return `${window.location.origin}/`
}

export async function sharePayload(payload: {
  title: string
  text: string
  url: string
}): Promise<"shared" | "copied" | "failed"> {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      await navigator.share(payload)
      return "shared"
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "failed"
    }
  }

  try {
    await navigator.clipboard.writeText(`${payload.title}\n${payload.text}\n${payload.url}`)
    return "copied"
  } catch {
    return "failed"
  }
}

export function productShareUrl(productId: string): string {
  const url = new URL(machineUrl())
  url.hash = `p=${encodeURIComponent(productId)}`
  return url.toString()
}

export function haulShareUrl(productIds: string[]): string {
  const url = new URL(machineUrl())
  if (productIds.length > 0) {
    url.hash = `haul=${productIds.map(encodeURIComponent).join(",")}`
  }
  return url.toString()
}

export function parseShareHash(hash: string): {
  productId?: string
  haulIds?: string[]
} {
  const value = hash.replace(/^#/, "")
  if (value.startsWith("p=")) {
    return { productId: decodeURIComponent(value.slice(2)) }
  }
  if (value.startsWith("haul=")) {
    const haulIds = value
      .slice(5)
      .split(",")
      .map((id) => decodeURIComponent(id))
      .filter(Boolean)
    return { haulIds }
  }
  return {}
}
