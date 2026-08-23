export const KIT_RESTOCK_FORM_ACTION =
  "https://app.kit.com/forms/9832576/subscriptions"

export type KitSubscribeResult = { ok: true } | { ok: false; reason: "invalid" | "failed" }

type KitFormResponse = {
  status?: string
  errors?: {
    fields?: string[]
    messages?: string[]
  }
}

export function isPlausibleEmail(value: string): boolean {
  const email = value.trim()
  const at = email.indexOf("@")
  if (at < 1 || email.includes(" ")) return false
  const domain = email.slice(at + 1)
  return domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".")
}

export async function subscribeRestockEmail(email: string): Promise<KitSubscribeResult> {
  const body = new URLSearchParams()
  body.set("email_address", email.trim())

  let response: Response
  try {
    response = await fetch(KIT_RESTOCK_FORM_ACTION, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    })
  } catch {
    return { ok: false, reason: "failed" }
  }

  let payload: KitFormResponse = {}
  try {
    payload = (await response.json()) as KitFormResponse
  } catch {
    return { ok: false, reason: "failed" }
  }

  if (payload.status === "success") return { ok: true }
  if (payload.status === "failed") {
    if (payload.errors?.fields?.includes("email_address")) {
      return { ok: false, reason: "invalid" }
    }
    return { ok: false, reason: "failed" }
  }

  return response.ok ? { ok: true } : { ok: false, reason: "failed" }
}
