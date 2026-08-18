import type { JSX, ReactNode } from "react"
import { resolveIllustrationKey, type IllustrationKey } from "./keys"

type GlyphProps = {
  title: string
}

function Frame({ children, title }: { children: ReactNode; title: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      overflow="hidden"
      role="img"
      aria-label={title}
      className="product-figure__svg"
    >
      <title>{title}</title>
      {children}
    </svg>
  )
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

function Driver({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="72" y="18" width="16" height="52" rx="3" {...stroke} />
      <rect x="68" y="18" width="24" height="10" rx="2" {...stroke} />
      <path d="M80 70 v54" {...stroke} />
      <path d="M74 124 h12" {...stroke} />
      <circle cx="80" cy="46" r="3" fill="currentColor" />
    </Frame>
  )
}

function Book({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="46" y="36" width="68" height="88" rx="2" {...stroke} />
      <path d="M46 36 h10 v88 h-10" {...stroke} />
      <path d="M64 56 h36 M64 68 h28" {...stroke} />
    </Frame>
  )
}

function Ruler({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="28" y="70" width="104" height="20" rx="2" {...stroke} />
      <path d="M44 70 v8 M60 70 v12 M76 70 v8 M92 70 v12 M108 70 v8 M124 70 v12" {...stroke} />
    </Frame>
  )
}

function Notebook({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="48" y="32" width="64" height="96" rx="3" {...stroke} />
      <path d="M60 32 v96" {...stroke} />
      <circle cx="60" cy="52" r="2.2" fill="currentColor" />
      <circle cx="60" cy="80" r="2.2" fill="currentColor" />
      <circle cx="60" cy="108" r="2.2" fill="currentColor" />
      <path d="M72 52 h28 M72 64 h22" {...stroke} />
    </Frame>
  )
}

function SewingKit({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="44" y="48" width="72" height="64" rx="4" {...stroke} />
      <path d="M44 68 h72" {...stroke} />
      <circle cx="68" cy="88" r="8" {...stroke} />
      <path d="M90 80 h18 M90 90 h14 M90 100 h18" {...stroke} />
    </Frame>
  )
}

function Flashlight({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="68" y="28" width="24" height="44" rx="8" {...stroke} />
      <path d="M68 60 h24 v20 a12 12 0 0 1 -24 0 z" {...stroke} />
      <path d="M74 108 h12 M78 116 h4" {...stroke} />
    </Frame>
  )
}

function Kit({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="40" y="50" width="80" height="56" rx="4" {...stroke} />
      <path d="M40 72 h80" {...stroke} />
      <rect x="70" y="44" width="20" height="12" rx="2" {...stroke} />
    </Frame>
  )
}

function Clip({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="58" y="36" width="44" height="88" rx="6" {...stroke} />
      <path d="M58 56 h44" {...stroke} />
      <circle cx="80" cy="46" r="3" {...stroke} />
    </Frame>
  )
}

function Scissors({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <circle cx="54" cy="108" r="12" {...stroke} />
      <circle cx="106" cy="108" r="12" {...stroke} />
      <path d="M62 100 L104 40 M98 100 L56 40" {...stroke} />
      <circle cx="80" cy="78" r="3" fill="currentColor" />
    </Frame>
  )
}

function Eraser({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="72" y="28" width="16" height="104" rx="3" {...stroke} />
      <path d="M72 48 h16" {...stroke} />
      <circle cx="80" cy="120" r="3" fill="currentColor" />
    </Frame>
  )
}

function Pencil({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <path d="M80 24 l12 20 v80 l-12 12 -12 -12 V44 z" {...stroke} />
      <path d="M68 44 h24 M80 124 v-10" {...stroke} />
    </Frame>
  )
}

function Pouch({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="36" y="48" width="88" height="64" rx="6" {...stroke} />
      <path d="M36 64 h88 M52 80 h56 M52 92 h40" {...stroke} />
    </Frame>
  )
}

function Carabiner({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="64" y="32" width="32" height="96" rx="16" {...stroke} />
      <path d="M96 56 v24" {...stroke} />
    </Frame>
  )
}

function Shard({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <path d="M52 40 h56 l-8 80 h-40 z" {...stroke} />
      <path d="M64 56 h24 M64 72 h18 M64 88 h22" {...stroke} />
    </Frame>
  )
}

function Pen({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="74" y="26" width="12" height="90" rx="3" {...stroke} />
      <path d="M74 116 l6 18 6 -18" {...stroke} />
      <path d="M74 48 h12" {...stroke} />
    </Frame>
  )
}

function Charger({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="52" y="48" width="56" height="56" rx="8" {...stroke} />
      <rect x="70" y="36" width="20" height="12" rx="2" {...stroke} />
      <circle cx="80" cy="76" r="10" {...stroke} />
    </Frame>
  )
}

function Hook({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="70" y="36" width="20" height="28" rx="2" {...stroke} />
      <path d="M80 64 v20 a16 16 0 0 0 16 16" {...stroke} />
    </Frame>
  )
}

function Cloth({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <path d="M44 52 q20 -16 36 0 t40 0 v56 q-20 16 -40 0 t-36 0 z" {...stroke} />
    </Frame>
  )
}

function Tape({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="46" y="58" width="68" height="40" rx="6" {...stroke} />
      <circle cx="80" cy="78" r="10" {...stroke} />
      <path d="M114 70 h12 v16 h-8" {...stroke} />
    </Frame>
  )
}

function Tray({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <path d="M40 56 h80 v40 l-12 16 h-56 l-12 -16 z" {...stroke} />
      <path d="M48 96 h64" {...stroke} />
    </Frame>
  )
}

function Cutter({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="44" y="68" width="52" height="24" rx="4" {...stroke} />
      <path d="M96 74 h28 l-8 12 h-20 z" {...stroke} />
    </Frame>
  )
}

function WindowMark({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="40" y="40" width="80" height="80" rx="6" {...stroke} />
      <path d="M40 80 h80 M80 40 v80" {...stroke} />
    </Frame>
  )
}

function Spark({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <circle cx="80" cy="80" r="28" {...stroke} />
      <path d="M80 44 v16 M80 100 v16 M44 80 h16 M100 80 h16" {...stroke} />
    </Frame>
  )
}

function Timer({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="50" y="44" width="60" height="60" rx="10" {...stroke} />
      <circle cx="80" cy="74" r="16" {...stroke} />
      <path d="M80 74 v-10 M80 58 v-4" {...stroke} />
      <rect x="68" y="104" width="24" height="10" rx="2" {...stroke} />
    </Frame>
  )
}

function Bottle({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="70" y="32" width="20" height="12" rx="2" {...stroke} />
      <rect x="74" y="44" width="12" height="12" rx="1" {...stroke} />
      <rect x="64" y="56" width="32" height="72" rx="6" {...stroke} />
      <path d="M64 76 h32" {...stroke} />
    </Frame>
  )
}

function Drain({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <circle cx="80" cy="80" r="32" {...stroke} />
      <circle cx="80" cy="80" r="8" {...stroke} />
      <path d="M80 52 v16 M80 92 v16 M52 80 h16 M92 80 h16" {...stroke} />
    </Frame>
  )
}

function Patch({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="42" y="50" width="58" height="42" rx="12" {...stroke} />
      <rect x="64" y="70" width="52" height="38" rx="12" {...stroke} />
    </Frame>
  )
}

function Cable({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="30" y="66" width="24" height="28" rx="3" {...stroke} />
      <rect x="106" y="66" width="24" height="28" rx="3" {...stroke} />
      <path d="M54 74 v12 M106 74 v12" {...stroke} />
      <path d="M54 80 C 70 46, 90 46, 106 80" {...stroke} />
    </Frame>
  )
}

function Brush({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="74" y="28" width="12" height="66" rx="3" {...stroke} />
      <rect x="62" y="94" width="36" height="16" rx="3" {...stroke} />
      <path d="M68 110 v18 M80 110 v22 M92 110 v18" {...stroke} />
    </Frame>
  )
}

function Towel({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <path d="M44 42 h72" {...stroke} />
      <path d="M52 42 v70 q0 10 10 10 h36 q10 0 10 -10 v-70" {...stroke} />
      <path d="M80 42 v80" {...stroke} />
    </Frame>
  )
}

function Globe({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <circle cx="80" cy="80" r="32" {...stroke} />
      <ellipse cx="80" cy="80" rx="14" ry="32" {...stroke} />
      <ellipse cx="80" cy="80" rx="32" ry="12" {...stroke} />
    </Frame>
  )
}

function Transfer({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="30" y="52" width="36" height="56" rx="4" {...stroke} />
      <path d="M30 66 h36" {...stroke} />
      <rect x="94" y="52" width="36" height="56" rx="4" {...stroke} />
      <path d="M94 66 h36" {...stroke} />
      <path d="M70 80 h20 M84 74 l8 6 -8 6" {...stroke} />
    </Frame>
  )
}

function Document({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <path d="M52 36 h42 l16 16 v72 h-58 z" {...stroke} />
      <path d="M94 36 v16 h16" {...stroke} />
      <path d="M64 76 h36 M64 88 h28" {...stroke} />
    </Frame>
  )
}

function Browser({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="38" y="40" width="84" height="80" rx="6" {...stroke} />
      <path d="M38 58 h84" {...stroke} />
      <circle cx="50" cy="49" r="2.2" fill="currentColor" />
      <circle cx="60" cy="49" r="2.2" fill="currentColor" />
      <circle cx="70" cy="49" r="2.2" fill="currentColor" />
    </Frame>
  )
}

function MenuBar({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="36" y="48" width="88" height="64" rx="4" {...stroke} />
      <path d="M36 62 h88" {...stroke} />
      <path d="M46 55 h12 M64 55 h8 M78 55 h8" {...stroke} />
      <circle cx="108" cy="55" r="2.2" fill="currentColor" />
      <circle cx="116" cy="55" r="2.2" fill="currentColor" />
    </Frame>
  )
}

function Calendar({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="48" y="44" width="64" height="72" rx="3" {...stroke} />
      <path d="M64 36 v16 M96 36 v16" {...stroke} />
      <path d="M48 62 h64 M48 86 h64 M69 62 v54 M91 62 v54" {...stroke} />
    </Frame>
  )
}

function TypeMark({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <path d="M44 116 h72" {...stroke} />
      <rect x="50" y="48" width="18" height="68" rx="1" {...stroke} />
      <rect x="72" y="66" width="16" height="50" rx="1" {...stroke} />
      <rect x="92" y="40" width="18" height="76" rx="1" {...stroke} />
    </Frame>
  )
}

function Kiosk({ title }: GlyphProps) {
  return (
    <Frame title={title}>
      <rect x="40" y="46" width="80" height="12" rx="1" {...stroke} />
      <rect x="56" y="58" width="48" height="58" rx="2" {...stroke} />
      <rect x="66" y="68" width="28" height="22" rx="1" {...stroke} />
      <path d="M50 116 h60" {...stroke} />
    </Frame>
  )
}

const catalog: Record<IllustrationKey, (props: GlyphProps) => JSX.Element> = {
  driver: Driver,
  book: Book,
  ruler: Ruler,
  notebook: Notebook,
  "sewing-kit": SewingKit,
  flashlight: Flashlight,
  kit: Kit,
  clip: Clip,
  scissors: Scissors,
  eraser: Eraser,
  pencil: Pencil,
  pouch: Pouch,
  carabiner: Carabiner,
  shard: Shard,
  pen: Pen,
  charger: Charger,
  hook: Hook,
  cloth: Cloth,
  tape: Tape,
  tray: Tray,
  cutter: Cutter,
  window: WindowMark,
  spark: Spark,
  timer: Timer,
  bottle: Bottle,
  drain: Drain,
  patch: Patch,
  cable: Cable,
  brush: Brush,
  towel: Towel,
  globe: Globe,
  transfer: Transfer,
  document: Document,
  browser: Browser,
  "menu-bar": MenuBar,
  calendar: Calendar,
  type: TypeMark,
  kiosk: Kiosk,
}

export function getIllustration(key: string): (props: GlyphProps) => JSX.Element {
  return catalog[resolveIllustrationKey(key)]
}
