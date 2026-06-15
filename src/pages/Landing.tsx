import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Menu, X, MessageCircle, Shield,
  RefreshCw, Headphones, CreditCard, Star, ArrowRight,
  Instagram, Facebook, Lock, ChevronDown,
} from 'lucide-react'

// ── WhatsApp ──────────────────────────────────────────────────────────────────
const WA_NUMBER = '526613519349'
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=Hola%20Soul%20Streaming%2C%20me%20interesa%20un%20servicio`

// ── Servicios con logos SVG/PNG reales ───────────────────────────────────────
const SERVICES = [
  {
    name: 'Netflix',
    color: '#E50914',
    bg: '#141414',
    logo: (
      <svg viewBox="0 0 111 30" className="h-7 w-auto" fill="#E50914">
        <path d="M105.06 0l-8.4 23.8L88.26 0h-8.4l12.3 30H99l12.3-30h-6.24zM77.7 0v30h6.3V0H77.7zM65.4 0v30h6.3V13.8L81 30h7.5L72.9 12.6 87.9 0H80.4L65.4 13.2V0H65.4zM27.3 0v30h6.3V16.5L50.1 30h8.1L39 13.5 57.6 0H49.5L33.6 13.2V0H27.3zM0 0v30h18.9c3.3 0 5.7-2.4 5.7-5.7V0H18.9v22.8H5.7V0H0z"/>
      </svg>
    ),
  },
  {
    name: 'Disney+',
    color: '#113CCF',
    bg: '#040d2d',
    logo: (
      <svg viewBox="0 0 180 50" className="h-8 w-auto" fill="none">
        <text x="0" y="38" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="36" fill="#1a78e5">Disney</text>
        <text x="128" y="32" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28" fill="#ffffff">+</text>
      </svg>
    ),
  },
  {
    name: 'Prime Video',
    color: '#00A8E0',
    bg: '#0d1117',
    logo: (
      <svg viewBox="0 0 200 50" className="h-7 w-auto" fill="none">
        <text x="0" y="32" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="22" fill="#ffffff">prime</text>
        <text x="0" y="47" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="18" fill="#00A8E0">video</text>
      </svg>
    ),
  },
  {
    name: 'HBO Max',
    color: '#a855f7',
    bg: '#0a0012',
    logo: (
      <svg viewBox="0 0 160 50" className="h-8 w-auto" fill="none">
        <text x="0" y="38" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="34" fill="#a855f7">Max</text>
      </svg>
    ),
  },
  {
    name: 'Spotify Premium',
    color: '#1DB954',
    bg: '#121212',
    logo: (
      <svg viewBox="0 0 200 60" className="h-7 w-auto" fill="none">
        <circle cx="28" cy="30" r="28" fill="#1DB954"/>
        <path d="M12 20c9-4 22-4 30 2" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M14 30c8-3 19-3 26 2" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M16 39c6-2 15-2 21 2" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <text x="64" y="38" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="20" fill="white">Spotify</text>
      </svg>
    ),
  },
  {
    name: 'YouTube Premium',
    color: '#FF0000',
    bg: '#0f0f0f',
    logo: (
      <svg viewBox="0 0 220 60" className="h-8 w-auto" fill="none">
        <rect x="0" y="8" width="50" height="36" rx="10" fill="#FF0000"/>
        <polygon points="20,18 20,42 40,30" fill="white"/>
        <text x="58" y="28" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="16" fill="white">YouTube</text>
        <text x="58" y="46" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13" fill="#FF0000">Premium</text>
      </svg>
    ),
  },
  {
    name: 'Crunchyroll',
    color: '#F47521',
    bg: '#0d0d0d',
    logo: (
      <svg viewBox="0 0 220 60" className="h-8 w-auto" fill="none">
        <circle cx="28" cy="30" r="26" fill="#F47521"/>
        <circle cx="28" cy="30" r="18" fill="#0d0d0d"/>
        <circle cx="28" cy="18" r="8" fill="#F47521"/>
        <text x="62" y="38" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="18" fill="white">Crunchyroll</text>
      </svg>
    ),
  },
  {
    name: 'Paramount+',
    color: '#0064FF',
    bg: '#00050f',
    logo: (
      <svg viewBox="0 0 200 60" className="h-8 w-auto" fill="none">
        <text x="0" y="38" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="26" fill="#0064FF">Paramount</text>
        <text x="148" y="38" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="26" fill="white">+</text>
      </svg>
    ),
  },
  {
    name: 'Vix Premium',
    color: '#00b4d8',
    bg: '#000a12',
    logo: (
      <svg viewBox="0 0 160 60" className="h-8 w-auto" fill="none">
        <text x="0" y="42" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="38" fill="#00b4d8">VIX</text>
        <text x="0" y="57" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="14" fill="white" letterSpacing="2">PREMIUM</text>
      </svg>
    ),
  },
]

// ── Ventajas ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: CreditCard,    label: 'Ahorro en\nsuscripciones' },
  { icon: Headphones,    label: 'Atención\npersonalizada' },
  { icon: RefreshCw,     label: 'Renovaciones\nrápidas' },
  { icon: MessageCircle, label: 'Soporte por\nWhatsApp' },
  { icon: Shield,        label: 'Métodos de pago\nseguros' },
  { icon: Star,          label: 'Servicio\nconfiable' },
]

// ── Logo SVG SSouL ────────────────────────────────────────────────────────────
function SoulLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sc = size === 'sm' ? 0.6 : size === 'lg' ? 1.4 : 1
  return (
    <svg width={Math.round(130 * sc)} height={Math.round(54 * sc)} viewBox="0 0 130 54"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 ${6 * sc}px rgba(96,165,250,.8)) drop-shadow(0 0 ${14 * sc}px rgba(59,130,246,.4))` }}>
      <defs>
        <linearGradient id={`mg${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f1f5f9"/>
          <stop offset="20%"  stopColor="#ffffff"/>
          <stop offset="48%"  stopColor="#93c5fd"/>
          <stop offset="72%"  stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1d4ed8"/>
        </linearGradient>
        <linearGradient id={`og${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#e2e8f0"/>
          <stop offset="50%"  stopColor="#94a3b8"/>
          <stop offset="100%" stopColor="#60a5fa"/>
        </linearGradient>
        <linearGradient id={`dg${size}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#38bdf8"/>
        </linearGradient>
        <linearGradient id={`sh${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.55"/>
          <stop offset="45%"  stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* SS sombra */}
      <text x="3"  y="31" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="34" fill="#050d1f">S</text>
      <text x="29" y="31" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="34" fill="#050d1f">S</text>
      {/* SS metal */}
      <text x="1"  y="29" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="34" fill={`url(#mg${size})`}>S</text>
      <text x="27" y="29" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="34" fill={`url(#mg${size})`}>S</text>
      {/* SS shine */}
      <text x="1"  y="29" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="34" fill={`url(#sh${size})`} opacity="0.5">S</text>
      <text x="27" y="29" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="34" fill={`url(#sh${size})`} opacity="0.5">S</text>
      {/* oul */}
      <text x="57" y="26" fontFamily="Arial Black,sans-serif" fontWeight="800" fontSize="20" fill={`url(#og${size})`}>oul</text>
      {/* separador */}
      <line x1="56" y1="30" x2="122" y2="30" stroke={`url(#dg${size})`} strokeWidth="0.9" opacity="0.7"/>
      {/* STREAMING */}
      <text x="56" y="42" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="9.5" fill={`url(#dg${size})`} letterSpacing="2.2">STREAMING</text>
      {/* estrella */}
      <polygon points="120,8 121.5,12 126,12 122.5,14.5 124,18.5 120,16 116,18.5 117.5,14.5 114,12 118.5,12"
        fill="#60a5fa" opacity="0.85"/>
    </svg>
  )
}

// ── Spider cursor ─────────────────────────────────────────────────────────────
function SpiderCursor() {
  // Posición real del mouse
  const mouseRef = useRef({ x: -300, y: -300 })
  // Posición de la araña (spring lag)
  const spiderRef = useRef({ x: -300, y: -300 })
  const velRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>()
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const frameRef = useRef(0)

  const [render, setRender] = useState({ x: -300, y: -300, angle: 0, walk: 0, visible: false })

  const STIFFNESS = 0.12   // qué tan rápido sigue al cursor (resorte)
  const DAMPING   = 0.75   // amortiguación
  const SPEED_THR = 0.8    // umbral para animar patas

  const animate = useCallback(() => {
    const mx = mouseRef.current.x
    const my = mouseRef.current.y
    const sx = spiderRef.current.x
    const sy = spiderRef.current.y

    // Spring physics
    const fx = (mx - sx) * STIFFNESS
    const fy = (my - sy) * STIFFNESS
    velRef.current.x = (velRef.current.x + fx) * DAMPING
    velRef.current.y = (velRef.current.y + fy) * DAMPING

    spiderRef.current.x += velRef.current.x
    spiderRef.current.y += velRef.current.y

    const speed = Math.sqrt(velRef.current.x ** 2 + velRef.current.y ** 2)
    const moving = speed > SPEED_THR

    // Ángulo de orientación hacia el movimiento
    let angle = 0
    if (moving) {
      angle = Math.atan2(velRef.current.y, velRef.current.x) * (180 / Math.PI) + 90
    }

    // Ciclo de caminar más rápido cuando hay más velocidad
    if (moving) frameRef.current += Math.min(speed * 0.15, 0.4)

    setRender({
      x: spiderRef.current.x,
      y: spiderRef.current.y,
      angle,
      walk: frameRef.current,
      visible: true,
    })

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setRender(r => ({ ...r, visible: false })), 2500)
    }
    window.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', onMove)
      clearTimeout(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [animate])

  if (!render.visible) return null

  // ── Patas con ciclo de caminar ────────────────────────────────────────────
  // t = fase del ciclo [0..2π]
  const t = render.walk
  const sw = Math.sin(t)       // -1..1
  const cw = Math.cos(t)
  const sw2 = Math.sin(t + Math.PI) // opuesto

  // Cada pata: [xBase, yBase, xMid, yMid, xTip, yTip]
  // Las patas del mismo lado alternan con desplazamiento de fase
  const legs = [
    // Derecha delantera
    [0, -4,  14 + sw * 3,  -16 + cw * 4,   24 + sw * 5,  -8 + cw * 6],
    [0, -2,  16 + sw2 * 3, -8 + sw2 * 3,   26 + sw2 * 4,  2 + sw2 * 5],
    // Derecha trasera
    [0,  2,  15 + sw * 2,   6 + cw * 4,    24 + sw * 3,  16 + cw * 5],
    [0,  5,  13 + sw2 * 2, 14 + sw2 * 3,   20 + sw2 * 3, 24 + sw2 * 4],
    // Izquierda delantera
    [0, -4, -14 - sw * 3,  -16 + cw * 4,  -24 - sw * 5,  -8 + cw * 6],
    [0, -2, -16 - sw2 * 3,  -8 + sw2 * 3, -26 - sw2 * 4,  2 + sw2 * 5],
    // Izquierda trasera
    [0,  2, -15 - sw * 2,    6 + cw * 4,  -24 - sw * 3,  16 + cw * 5],
    [0,  5, -13 - sw2 * 2,  14 + sw2 * 3, -20 - sw2 * 3, 24 + sw2 * 4],
  ]

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: render.x,
        top: render.y,
        transform: `translate(-50%, -50%) rotate(${render.angle}deg)`,
        willChange: 'transform',
      }}
    >
      <svg width="80" height="80" viewBox="-40 -40 80 80" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="spBodyGrad" cx="50%" cy="35%" r="60%">
            <stop offset="0%"   stopColor="#1e3a5f"/>
            <stop offset="100%" stopColor="#060d1f"/>
          </radialGradient>
          <radialGradient id="spHeadGrad" cx="50%" cy="30%" r="60%">
            <stop offset="0%"   stopColor="#0f2040"/>
            <stop offset="100%" stopColor="#060d1f"/>
          </radialGradient>
          <filter id="spGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Hilo de la araña (va hacia arriba, simulando que la jalan) */}
        <line x1="0" y1="-12" x2="0" y2="-48"
          stroke="#60a5fa" strokeWidth="0.7" opacity="0.5" strokeDasharray="2 2"/>

        {/* Patas */}
        {legs.map((l, i) => (
          <polyline key={i}
            points={`${l[0]},${l[1]} ${l[2]},${l[3]} ${l[4]},${l[5]}`}
            stroke="#3b82f6" strokeWidth="1.4" fill="none"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.9"
            filter="url(#spGlow)"
          />
        ))}

        {/* Abdomen */}
        <ellipse cx="0" cy="7" rx="8" ry="11"
          fill="url(#spBodyGrad)" stroke="#3b82f6" strokeWidth="0.9"/>
        {/* Patrón abdomen */}
        <ellipse cx="0" cy="7" rx="3.5" ry="6" fill="#1d4ed8" opacity="0.45"/>
        <circle cx="0" cy="2"  r="1.5" fill="#3b82f6" opacity="0.4"/>
        <circle cx="0" cy="6"  r="1.5" fill="#2563eb" opacity="0.35"/>
        <circle cx="0" cy="11" r="1.5" fill="#1d4ed8" opacity="0.3"/>

        {/* Cefalotórax */}
        <ellipse cx="0" cy="-5" rx="7" ry="8"
          fill="url(#spHeadGrad)" stroke="#60a5fa" strokeWidth="0.9"/>

        {/* Ojos — 2 grandes + 2 pequeños */}
        <ellipse cx="-3.5" cy="-7" rx="2.2" ry="1.8" fill="#60a5fa" opacity="0.95" filter="url(#spGlow)"/>
        <ellipse cx=" 3.5" cy="-7" rx="2.2" ry="1.8" fill="#60a5fa" opacity="0.95" filter="url(#spGlow)"/>
        <ellipse cx="-3.5" cy="-7" rx="0.9" ry="0.8" fill="#e0f2fe"/>
        <ellipse cx=" 3.5" cy="-7" rx="0.9" ry="0.8" fill="#e0f2fe"/>
        <circle  cx="-1.2" cy="-5.5" r="1.2" fill="#3b82f6" opacity="0.7"/>
        <circle  cx=" 1.2" cy="-5.5" r="1.2" fill="#3b82f6" opacity="0.7"/>

        {/* Quelíceros (colmillos) */}
        <path d="M-3 -1 Q-4 2 -3 4" stroke="#60a5fa" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M 3 -1 Q 4 2  3 4" stroke="#60a5fa" strokeWidth="1" fill="none" strokeLinecap="round"/>

        {/* Glow corporal */}
        <ellipse cx="0" cy="1" rx="12" ry="14" fill="transparent"
          stroke="#3b82f6" strokeWidth="0.5" opacity="0.15"/>
      </svg>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen text-white overflow-x-hidden"
      style={{ background: '#060610', fontFamily: 'Inter, Arial, sans-serif' }}>

      <SpiderCursor />

      {/* ── FONDO GLOBAL ──────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(#3b82f6 1px,transparent 1px),linear-gradient(90deg,#3b82f6 1px,transparent 1px)', backgroundSize: '55px 55px' }}/>
        {/* blobs */}
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.06] animate-pulse"
          style={{ background: 'radial-gradient(circle,#3b82f6,transparent)', top: '5%', left: '5%', filter: 'blur(80px)' }}/>
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05] animate-pulse"
          style={{ background: 'radial-gradient(circle,#06b6d4,transparent)', bottom: '10%', right: '5%', filter: 'blur(70px)', animationDelay: '1.5s' }}/>
        {/* binary rain subtle */}
        <div className="absolute top-0 left-[10%] text-blue-900 text-xs leading-4 opacity-10 select-none pointer-events-none"
          style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
          {`01001101\n10110010\n01101101\n10010110\n01101011`}
        </div>
        <div className="absolute top-0 right-[8%] text-blue-900 text-xs leading-4 opacity-10 select-none pointer-events-none"
          style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
          {`011001\n101101\n011001\n101100`}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#060610]/95 backdrop-blur-md border-b border-blue-900/30' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-[70px]">

          {/* Logo */}
          <a href="#inicio"><SoulLogo size="md" /></a>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {[['#inicio','INICIO'],['#servicios','SERVICIOS'],['#nosotros','NOSOTROS'],['#contacto','CONTACTO']].map(([href,label]) => (
              <a key={href} href={href}
                className="text-xs font-bold tracking-widest text-slate-300 hover:text-blue-400 transition-colors duration-200 relative group">
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all duration-300"/>
              </a>
            ))}
          </nav>

          {/* Admin btn */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/admin/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/70 border border-slate-600/40 text-slate-300 text-xs font-semibold hover:border-blue-500/50 hover:text-white transition-all duration-200">
              <Lock size={13}/> Iniciar Admin
            </Link>
          </div>

          {/* Burger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white">
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#080816]/98 backdrop-blur-md border-t border-blue-900/20 px-4 py-4 space-y-3">
            {[['#inicio','INICIO'],['#servicios','SERVICIOS'],['#nosotros','NOSOTROS'],['#contacto','CONTACTO']].map(([href,label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="block py-2 text-xs font-bold tracking-widest text-slate-300 border-b border-slate-800">
                {label}
              </a>
            ))}
            <Link to="/admin/login" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-xs text-slate-400">
              <Lock size={12}/> Iniciar Admin
            </Link>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">

        {/* Fondo hero — círculo azul + figura hacker */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #0a1628 0%, #060610 70%)' }}/>
          {/* Círculo glow central */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full"
            style={{ border: '1.5px solid rgba(59,130,246,0.25)', boxShadow: '0 0 60px 8px rgba(59,130,246,0.12) inset, 0 0 80px 10px rgba(59,130,246,0.08)' }}/>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full"
            style={{ border: '1px solid rgba(59,130,246,0.15)' }}/>
          {/* Mapa mundial sutil */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Cellipse cx='600' cy='300' rx='580' ry='280' fill='none' stroke='%233b82f6' stroke-width='1'/%3E%3Cpath d='M200,200 Q400,150 600,200 Q800,250 1000,200' fill='none' stroke='%233b82f6' stroke-width='1'/%3E%3Cpath d='M100,300 Q350,270 600,300 Q850,330 1100,300' fill='none' stroke='%233b82f6' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: 'cover', backgroundPosition: 'center' }}/>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">

          {/* SERVICIOS SS arriba */}
          <div className="mb-4">
            <p className="text-slate-400 text-xs font-bold tracking-[0.4em] uppercase mb-2">SERVICIOS</p>
            <div className="flex justify-center">
              <SoulLogo size="lg" />
            </div>
          </div>

          {/* Figura hacker SVG */}
          <div className="flex justify-center my-6">
            <div className="relative w-52 h-52 sm:w-64 sm:h-64">
              {/* Glow detrás */}
              <div className="absolute inset-0 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', filter: 'blur(30px)' }}/>
              {/* Círculo borde */}
              <div className="absolute inset-0 rounded-full"
                style={{ border: '2px solid rgba(59,130,246,0.4)', boxShadow: '0 0 30px rgba(59,130,246,0.2)' }}/>
              {/* Hacker SVG */}
              <svg viewBox="0 0 200 220" className="absolute inset-0 w-full h-full p-6" fill="none">
                {/* Laptop */}
                <rect x="45" y="155" width="110" height="65" rx="6" fill="#0a1628" stroke="#3b82f6" strokeWidth="1.5"/>
                <rect x="50" y="160" width="100" height="50" rx="3" fill="#060d1f"/>
                {/* pantalla codigo */}
                <text x="55" y="175" fontFamily="monospace" fontSize="5" fill="#3b82f6" opacity="0.7">01 10 11 00 10</text>
                <text x="55" y="183" fontFamily="monospace" fontSize="5" fill="#60a5fa" opacity="0.6">10 01 00 11 01</text>
                <text x="55" y="191" fontFamily="monospace" fontSize="5" fill="#3b82f6" opacity="0.7">SS · SOUL · 2024</text>
                {/* SS en laptop */}
                <text x="88" y="200" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="14" fill="#3b82f6" opacity="0.8">SS</text>
                {/* Teclado */}
                <rect x="40" y="222" width="120" height="8" rx="3" fill="#0d1f3d" stroke="#1d4ed8" strokeWidth="1"/>
                {/* Cuerpo */}
                <ellipse cx="100" cy="130" rx="25" ry="30" fill="#0a1422"/>
                {/* Hoodie */}
                <path d="M60 155 Q70 130 100 125 Q130 130 140 155 L140 220 L60 220 Z" fill="#080e1e"/>
                <path d="M75 125 Q100 115 125 125 L130 155 Q100 145 70 155 Z" fill="#0a1422"/>
                {/* Capucha */}
                <path d="M70 95 Q75 55 100 50 Q125 55 130 95 Q125 110 100 112 Q75 110 70 95 Z" fill="#080e1e"/>
                <path d="M72 93 Q75 60 100 55 Q125 60 128 93 Q122 108 100 110 Q78 108 72 93 Z" fill="#0a1422"/>
                {/* Cara oscura */}
                <ellipse cx="100" cy="85" rx="18" ry="22" fill="#030608"/>
                {/* ojos glow */}
                <ellipse cx="93" cy="80" rx="3.5" ry="2.5" fill="#3b82f6" opacity="0.8"/>
                <ellipse cx="107" cy="80" rx="3.5" ry="2.5" fill="#3b82f6" opacity="0.8"/>
                <ellipse cx="93" cy="80" rx="1.5" ry="1" fill="#93c5fd"/>
                <ellipse cx="107" cy="80" rx="1.5" ry="1" fill="#93c5fd"/>
                {/* brazos */}
                <path d="M75 155 Q55 165 50 185" stroke="#080e1e" strokeWidth="14" strokeLinecap="round"/>
                <path d="M125 155 Q145 165 150 185" stroke="#080e1e" strokeWidth="14" strokeLinecap="round"/>
                {/* manos sobre laptop */}
                <ellipse cx="55" cy="185" rx="9" ry="6" fill="#0a1422"/>
                <ellipse cx="145" cy="185" rx="9" ry="6" fill="#0a1422"/>
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-2">
            <span className="text-white">SOUL </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
              style={{ textShadow: 'none', filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.5))' }}>
              STREAMING
            </span>
          </h1>
          <p className="text-blue-300/70 text-sm font-bold tracking-[0.35em] uppercase mb-6">
            SERVICIOS DIGITALES PREMIUM
          </p>

          {/* Descripción */}
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-3">
            Soul Streaming es una tienda de servicios digitales premium especializada en la gestión, venta
            y asesoramiento de cuentas compartidas para las principales plataformas de contenido bajo demanda.
          </p>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed mb-8">
            Nuestro objetivo es ser el punto de conexión confiable y eficiente entre los usuarios que buscan
            optimizar sus costos de suscripción y la oferta de entretenimiento digital.
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#servicios"
              className="group flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', boxShadow: '0 0 25px rgba(59,130,246,0.4)' }}>
              ▶ Ver Servicios
            </a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300"
              style={{ background: 'linear-gradient(135deg,#166534,#15803d)', boxShadow: '0 0 25px rgba(34,197,94,0.35)' }}>
              <MessageCircle size={16}/> Contactar por WhatsApp
            </a>
          </div>

          <div className="mt-12 flex justify-center animate-bounce text-slate-700">
            <ChevronDown size={22}/>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SERVICIOS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="servicios" className="relative py-20 px-4 sm:px-6">
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.4),transparent)' }}/>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.5))' }}/>
              <p className="text-xs font-bold tracking-[0.35em] text-slate-400 uppercase">NUESTROS SERVICIOS</p>
              <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(90deg,rgba(59,130,246,0.5),transparent)' }}/>
            </div>
          </div>

          {/* Grid: 5 arriba + 4 abajo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
            {SERVICES.slice(0, 5).map(s => (
              <ServiceCard key={s.name} service={s} waLink={WA_LINK}/>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SERVICES.slice(5).map(s => (
              <ServiceCard key={s.name} service={s} waLink={WA_LINK}/>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          VENTAJAS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 px-4 sm:px-6">
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.4),transparent)' }}/>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.5))' }}/>
              <p className="text-xs font-bold tracking-[0.35em] text-slate-400 uppercase">¿POR QUÉ ELEGIR SOUL STREAMING?</p>
              <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(90deg,rgba(59,130,246,0.5),transparent)' }}/>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i}
                className="flex flex-col items-center text-center p-5 rounded-xl transition-all duration-300 group cursor-default"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(59,130,246,0.12)' }}
                onMouseEnter={e => (e.currentTarget.style.border = '1px solid rgba(59,130,246,0.45)')}
                onMouseLeave={e => (e.currentTarget.style.border = '1px solid rgba(59,130,246,0.12)')}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <f.icon size={20} className="text-blue-400"/>
                </div>
                <p className="text-slate-300 text-xs font-medium leading-tight" style={{ whiteSpace: 'pre-line' }}>
                  {f.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          NOSOTROS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="nosotros" className="relative py-20 px-4 sm:px-6">
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.4),transparent)' }}/>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px flex-1 max-w-[100px]" style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.5))' }}/>
            <p className="text-xs font-bold tracking-[0.35em] text-slate-400 uppercase">SOBRE NOSOTROS</p>
            <div className="h-px flex-1 max-w-[100px]" style={{ background: 'linear-gradient(90deg,rgba(59,130,246,0.5),transparent)' }}/>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Logo SS circular */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full flex items-center justify-center relative"
                style={{ border: '2px solid rgba(59,130,246,0.5)', boxShadow: '0 0 30px rgba(59,130,246,0.2)' }}>
                <div className="absolute inset-0 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent)' }}/>
                <div className="text-center">
                  <p className="text-4xl font-black" style={{ background: 'linear-gradient(180deg,#93c5fd,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SS</p>
                </div>
              </div>
            </div>

            {/* Texto */}
            <div>
              <p className="text-slate-300 text-base leading-relaxed mb-4">
                En <span className="text-blue-400 font-semibold">Soul Streaming</span> trabajamos para acercar el
                entretenimiento digital a más personas mediante soluciones accesibles, seguras y confiables.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Nuestra misión es ofrecer una experiencia sencilla y transparente para todos nuestros clientes,
                siendo el punto de conexión entre quienes buscan optimizar sus costos de suscripción y la oferta
                de entretenimiento digital premium.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CONTACTO CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="contacto" className="relative py-16 px-4">
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.4),transparent)' }}/>
        <div className="max-w-lg mx-auto text-center">
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-3">¿Listo para comenzar?</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">
            Escríbenos y te <span className="text-green-400">asesoramos</span> ahora
          </h2>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base transition-all duration-300"
            style={{ background: 'linear-gradient(135deg,#166534,#15803d)', boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}>
            <MessageCircle size={20}/> Contactar por WhatsApp
            <ArrowRight size={16}/>
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t py-8 px-4 sm:px-6" style={{ borderColor: 'rgba(59,130,246,0.1)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <SoulLogo size="sm" />
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Soul Streaming · Todos los derechos reservados</p>
          <div className="flex items-center gap-3">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 transition-all"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <MessageCircle size={13}/> WhatsApp
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 transition-all"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Facebook size={14}/>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-pink-400 transition-all"
              style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)' }}>
              <Instagram size={14}/>
            </a>
            <Link to="/admin/login"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-400 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              title="Admin">
              <Shield size={13}/>
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

// ── Service Card ──────────────────────────────────────────────────────────────
function ServiceCard({ service, waLink }: { service: typeof SERVICES[0]; waLink: string }) {
  return (
    <a href={waLink} target="_blank" rel="noopener noreferrer"
      className="group flex flex-col items-center justify-center gap-3 p-5 rounded-xl transition-all duration-300 cursor-pointer"
      style={{
        background: service.bg,
        border: `1px solid ${service.color}22`,
        minHeight: 100,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.border = `1px solid ${service.color}66`
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${service.color}22`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.border = `1px solid ${service.color}22`
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}>
      <div className="flex items-center justify-center h-10">
        {service.logo}
      </div>
      <p className="text-xs text-slate-400 group-hover:text-white transition-colors font-medium">{service.name}</p>
    </a>
  )
}
