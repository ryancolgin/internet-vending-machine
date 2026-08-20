import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [query])

  return matches
}

export const MOBILE_MACHINE_QUERY = "(max-width: 839px)"
export const COARSE_POINTER_QUERY = "(pointer: coarse)"

/**
 * Overlay band: from the end of mobile up to just below the viewport
 * width where the desktop rail can keep KEEP STOCKED / ALREADY OWN / SHARE
 * on one row (~300px inspector content, ~1100px viewport).
 */
export const TABLET_MACHINE_QUERY = "(min-width: 840px) and (max-width: 1099px)"
