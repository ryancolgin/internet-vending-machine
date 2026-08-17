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

/** Touch tablets in the mid-width band. Fine-pointer compact desktop stays on the rail. */
export const TABLET_MACHINE_QUERY =
  "(min-width: 840px) and (max-width: 1180px) and (pointer: coarse)"
