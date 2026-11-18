import { getCurrentEdition } from "../data/editions"
import { getProduct } from "../data/products"
import { SLOT_CODES } from "../types/product"

export const SITE_URL = "https://theinternetvendingmachine.com/"

export const SITE_DESCRIPTION =
  "Sixteen curated products and tools, stocked like a vending machine. Inspect a slot, vend it into your haul, and open the product when you want it. Nothing is purchased."

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function publicationIso(edition: { id: string; launchAt?: string; stockedAt: string }): string {
  const raw = edition.launchAt ?? edition.stockedAt
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw)
  if (!match) throw new Error(`Edition ${edition.id} is missing a publication date`)
  return `${match[1]}-${match[2]}-${match[3]}`
}

function publicationLabel(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  const month = MONTHS[Number(match[2]) - 1]
  if (!month) return iso
  return `${month} ${Number(match[3])}, ${match[1]}`
}

function currentEdition() {
  const edition = getCurrentEdition()
  if (!edition) throw new Error("No published edition is available for the public catalog")
  return edition
}

/** Text catalog for the current edition, present before JavaScript runs. */
export function catalogHtml(): string {
  const edition = currentEdition()
  const published = publicationLabel(publicationIso(edition))
  const items = SLOT_CODES.map((slot) => {
    const entry = edition.slots.find((candidate) => candidate.slot === slot)
    const product = entry ? getProduct(entry.productId) : undefined
    if (!product) {
      throw new Error(`Edition ${edition.id} slot ${slot} has no product record`)
    }
    const kind = product.category ?? product.type
    return { slot, product, kind }
  })

  const list = items
    .map(({ slot, product, kind }) => {
      return [
        "        <li>",
        `          <h3>${escapeHtml(product.name)}</h3>`,
        `          <p>${escapeHtml(slot)}. ${escapeHtml(kind)}. ${escapeHtml(product.priceLabel)}. ${escapeHtml(product.machineCopy)}</p>`,
        "        </li>",
      ].join("\n")
    })
    .join("\n")

  return [
    "<article>",
    "      <h1>The Internet Vending Machine</h1>",
    `      <p>${escapeHtml(SITE_DESCRIPTION)}</p>`,
    `      <h2>Edition ${escapeHtml(edition.id)}</h2>`,
    `      <p>Published ${escapeHtml(published)}. Pick a slot and inspect it. Vend adds it to your haul.</p>`,
    "      <ol>",
    list,
    "      </ol>",
    "    </article>",
  ].join("\n")
}

export function sitemapXml(): string {
  const edition = currentEdition()
  const lastmod = publicationIso(edition)
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <url>",
    `    <loc>${SITE_URL}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    "  </url>",
    "</urlset>",
    "",
  ].join("\n")
}
