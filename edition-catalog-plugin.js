import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { catalogHtml, SITE_DESCRIPTION, sitemapXml } from "./src/lib/seoDocument.ts"

export function editionCatalog() {
  let outDir = "dist"
  let root = process.cwd()
  return {
    name: "edition-catalog",
    configResolved(config) {
      outDir = config.build.outDir
      root = config.root
    },
    transformIndexHtml(html) {
      if (!html.includes(SITE_DESCRIPTION)) {
        throw new Error("index.html is missing the approved site description")
      }
      const next = html.replace(
        '<div id="root"></div>',
        `<div id="root">\n      ${catalogHtml()}\n    </div>`,
      )
      if (next === html) {
        throw new Error("Could not inject the current edition catalog into #root")
      }
      return next
    },
    closeBundle() {
      writeFileSync(resolve(root, outDir, "sitemap.xml"), sitemapXml())
    },
  }
}
