import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Menu, X, MessageCircle, Shield, RefreshCw, Headphones,
  CreditCard, Star, ArrowRight, Instagram, Facebook,
  Zap, ChevronDown, ChevronUp, Check, Lock, Gift,
  Play, Clock, BadgeCheck, Users, Sparkles,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
const WA = `https://wa.me/526613519349?text=Hola%20Soul%20Streaming%2C%20quiero%20información%20sobre%20los%20servicios`

// ── Servicios ─────────────────────────────────────────────────────────────────
const SERVICES = [
  { name: 'Spotify Premium',  color: '#1DB954', bg: '#0d1f12', desc: 'Música sin límites, sin anuncios', icon: '🎵' },
  { name: 'Netflix',          color: '#E50914', bg: '#1a0a0a', desc: 'Series y películas en HD y 4K',    icon: '🎬' },
  { name: 'Disney+',          color: '#1a78e5', bg: '#070d1a', desc: 'Marvel, Star Wars, Pixar y más',   icon: '✨' },
  { name: 'YouTube Premium',  color: '#FF0000', bg: '#1a0808', desc: 'Videos sin anuncios + YT Music',   icon: '▶️' },
  { name: 'HBO Max',          color: '#a855f7', bg: '#0f0a1a', desc: 'HBO, DC y contenido premium',      icon: '👑' },
  { name: 'Prime Video',      color: '#00A8E0', bg: '#071419', desc: 'Amazon Originals y blockbusters',  icon: '📦' },
  { name: 'ChatGPT Plus',     color: '#10a37f', bg: '#071410', desc: 'GPT-4 sin restricciones',         icon: '🤖' },
  { name: 'Canva Pro',        color: '#7c3aed', bg: '#0e0a1a', desc: 'Diseño profesional ilimitado',     icon: '🎨' },
  { name: 'Crunchyroll',      color: '#F47521', bg: '#1a0e07', desc: 'El mejor catálogo de anime',       icon: '⚡' },
]

// ── Ventajas ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Zap,          title: 'Entrega inmediata',           desc: 'Recibes tus credenciales en minutos tras el pago.' },
  { icon: BadgeCheck,   title: 'Garantía en todas las cuentas', desc: 'Si hay algún problema, lo resolvemos sin preguntas.' },
  { icon: Headphones,   title: 'Atención personalizada',      desc: 'Soporte dedicado para cada cliente.' },
  { icon: MessageCircle,title: 'Soporte por WhatsApp',        desc: 'Respuesta rápida de lunes a domingo.' },
  { icon: CreditCard,   title: 'Pagos seguros',               desc: 'Transferencia, OXXO, Arcus y más opciones.' },
  { icon: RefreshCw,    title: 'Reposición garantizada',      desc: 'Reponemos tu cuenta si deja de funcionar.' },
]

// ── Opiniones ─────────────────────────────────────────────────────────────────
const REVIEWS = [
  { name: 'Carlos M.', service: 'Spotify Premium', text: 'Entrega en menos de 5 minutos. Excelente servicio y precio inmejorable.', stars: 5 },
  { name: 'Fernanda R.', service: 'Netflix', text: 'Llevo 3 meses y nunca he tenido problemas. El soporte responde rapidísimo.', stars: 5 },
  { name: 'Miguel A.', service: 'Disney+', text: 'La mejor opción para ahorrar en suscripciones. 100% recomendado.', stars: 5 },
  { name: 'Lupita S.', service: 'YouTube Premium', text: 'Sin anuncios en YouTube, vale cada peso. Muy fácil el proceso de compra.', stars: 5 },
  { name: 'Rodrigo T.', service: 'ChatGPT Plus', text: 'Increíble, GPT-4 sin límites y a mitad de precio. Gracias SSouL!', stars: 5 },
  { name: 'Daniela V.', service: 'Canva Pro', text: 'Para mi trabajo de diseño es perfecto. Entrega inmediata y soporte genial.', stars: 5 },
]

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: '¿Cuánto tarda la entrega?', a: 'La entrega es inmediata o en menos de 15 minutos tras confirmar el pago, de lunes a domingo.' },
  { q: '¿Las cuentas tienen garantía?', a: 'Sí. Todas nuestras cuentas tienen garantía. Si dejan de funcionar, las reponemos sin costo adicional.' },
  { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos transferencia bancaria, OXXO Pay, Arcus/CLABE interbancaria y más. Pregunta por WhatsApp por otras opciones.' },
  { q: '¿Cómo funciona el Centro de Canje?', a: 'Si tienes un código de regalo, entra a nuestra página de canje, registra tus datos e ingresa el código. Recibirás los datos de tu cuenta al instante.' },
  { q: '¿Cómo contacto con soporte?', a: 'Puedes escribirnos por WhatsApp al número que aparece en la página. Respondemos en minutos, todos los días.' },
  { q: '¿Comparten varias personas la cuenta?', a: 'Sí, trabajamos con planes compartidos o individuales según el servicio. Cada cliente recibe sus propias credenciales de acceso.' },
]

// ─────────────────────────────────────────────────────────────────────────────
// ── Helpers ───────────────────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp} transition={{ delay }} className={className}>
      {children}
    </motion.div>
  )
}

function SectionHeader({ tag, title, sub }: { tag: string, title: React.ReactNode, sub?: string }) {
  return (
    <FadeIn className="text-center mb-12 sm:mb-16">
      <p className="text-xs font-bold tracking-[0.35em] text-blue-400 uppercase mb-3">{tag}</p>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">{title}</h2>
      {sub && <p className="text-slate-400 text-base max-w-xl mx-auto">{sub}</p>}
    </FadeIn>
  )
}

// ── Logo ──────────────────────────────────────────────────────────────────────
function SoulLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sc = size === 'sm' ? 0.6 : size === 'lg' ? 1.4 : 1
  return (
    <svg width={Math.round(130 * sc)} height={Math.round(54 * sc)} viewBox="0 0 130 54" fill="none"
      style={{ filter: `drop-shadow(0 0 ${6*sc}px rgba(96,165,250,.9))` }}>
      <defs>
        <linearGradient id={`mg${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9"/>
          <stop offset="25%" stopColor="#ffffff"/>
          <stop offset="50%" stopColor="#93c5fd"/>
          <stop offset="75%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1d4ed8"/>
        </linearGradient>
        <linearGradient id={`dg${size}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#38bdf8"/>
        </linearGradient>
        <linearGradient id={`sh${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.55"/>
          <stop offset="45%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <text x="3" y="31" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="34" fill="#050d1f">S</text>
      <text x="29" y="31" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="34" fill="#050d1f">S</text>
      <text x="1" y="29" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="34" fill={`url(#mg${size})`}>S</text>
      <text x="27" y="29" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="34" fill={`url(#mg${size})`}>S</text>
      <text x="1" y="29" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="34" fill={`url(#sh${size})`} opacity="0.5">S</text>
      <text x="27" y="29" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="34" fill={`url(#sh${size})`} opacity="0.5">S</text>
      <text x="57" y="26" fontFamily="Arial Black,sans-serif" fontWeight="800" fontSize="20" fill={`url(#dg${size})`}>oul</text>
      <line x1="56" y1="30" x2="122" y2="30" stroke={`url(#dg${size})`} strokeWidth="0.9" opacity="0.7"/>
      <text x="56" y="42" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="9.5" fill={`url(#dg${size})`} letterSpacing="2.2">STREAMING</text>
      <polygon points="120,8 121.5,12 126,12 122.5,14.5 124,18.5 120,16 116,18.5 117.5,14.5 114,12 118.5,12" fill="#60a5fa" opacity="0.9"/>
    </svg>
  )
}

// ── Spider Cursor ─────────────────────────────────────────────────────────────
function SpiderCursor() {
  const mouseRef = useRef({ x: -300, y: -300 })
  const spiderRef = useRef({ x: -300, y: -300 })
  const velRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>()
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const frameRef = useRef(0)
  const [render, setRender] = useState({ x: -300, y: -300, angle: 0, walk: 0, visible: false })

  useEffect(() => {
    const animate = () => {
      const { x: mx, y: my } = mouseRef.current
      const { x: sx, y: sy } = spiderRef.current
      velRef.current.x = (velRef.current.x + (mx - sx) * 0.12) * 0.75
      velRef.current.y = (velRef.current.y + (my - sy) * 0.12) * 0.75
      spiderRef.current.x += velRef.current.x
      spiderRef.current.y += velRef.current.y
      const speed = Math.sqrt(velRef.current.x ** 2 + velRef.current.y ** 2)
      if (speed > 0.8) frameRef.current += Math.min(speed * 0.15, 0.4)
      const angle = speed > 0.8 ? Math.atan2(velRef.current.y, velRef.current.x) * (180 / Math.PI) + 90 : 0
      setRender({ x: spiderRef.current.x, y: spiderRef.current.y, angle, walk: frameRef.current, visible: true })
      rafRef.current = requestAnimationFrame(animate)
    }
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setRender(r => ({ ...r, visible: false })), 2500)
    }
    window.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(animate)
    return () => { window.removeEventListener('mousemove', onMove); if (rafRef.current) cancelAnimationFrame(rafRef.current); clearTimeout(timerRef.current) }
  }, [])

  if (!render.visible) return null
  const t = render.walk
  const sw = Math.sin(t), cw = Math.cos(t), sw2 = Math.sin(t + Math.PI)
  const legs = [
    [0,-4, 14+sw*3,-16+cw*4, 24+sw*5,-8+cw*6], [0,-2, 16+sw2*3,-8+sw2*3, 26+sw2*4,2+sw2*5],
    [0,2, 15+sw*2,6+cw*4, 24+sw*3,16+cw*5], [0,5, 13+sw2*2,14+sw2*3, 20+sw2*3,24+sw2*4],
    [0,-4, -14-sw*3,-16+cw*4, -24-sw*5,-8+cw*6], [0,-2, -16-sw2*3,-8+sw2*3, -26-sw2*4,2+sw2*5],
    [0,2, -15-sw*2,6+cw*4, -24-sw*3,16+cw*5], [0,5, -13-sw2*2,14+sw2*3, -20-sw2*3,24+sw2*4],
  ]
  return (
    <div className="fixed pointer-events-none z-[9999]" style={{ left: render.x, top: render.y, transform: `translate(-50%,-50%) rotate(${render.angle}deg)`, willChange: 'transform' }}>
      <svg width="80" height="80" viewBox="-40 -40 80 80" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="spB" cx="50%" cy="35%" r="60%"><stop offset="0%" stopColor="#1e3a5f"/><stop offset="100%" stopColor="#060d1f"/></radialGradient>
          <filter id="spG"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <line x1="0" y1="-12" x2="0" y2="-48" stroke="#60a5fa" strokeWidth="0.7" opacity="0.4" strokeDasharray="2 2"/>
        {legs.map((l,i) => <polyline key={i} points={`${l[0]},${l[1]} ${l[2]},${l[3]} ${l[4]},${l[5]}`} stroke="#3b82f6" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" filter="url(#spG)"/>)}
        <ellipse cx="0" cy="7" rx="8" ry="11" fill="url(#spB)" stroke="#3b82f6" strokeWidth="0.9"/>
        <ellipse cx="0" cy="7" rx="3.5" ry="6" fill="#1d4ed8" opacity="0.45"/>
        <ellipse cx="0" cy="-5" rx="7" ry="8" fill="#0f2040" stroke="#60a5fa" strokeWidth="0.9"/>
        <ellipse cx="-3.5" cy="-7" rx="2.2" ry="1.8" fill="#60a5fa" opacity="0.95" filter="url(#spG)"/>
        <ellipse cx="3.5" cy="-7" rx="2.2" ry="1.8" fill="#60a5fa" opacity="0.95" filter="url(#spG)"/>
        <ellipse cx="-3.5" cy="-7" rx="0.9" ry="0.8" fill="#e0f2fe"/>
        <ellipse cx="3.5" cy="-7" rx="0.9" ry="0.8" fill="#e0f2fe"/>
        <path d="M-3-1 Q-4 2-3 4" stroke="#60a5fa" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M3-1 Q4 2 3 4" stroke="#60a5fa" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#060610', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <SpiderCursor />

      {/* ── FONDO GLOBAL ──────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(#3b82f6 1px,transparent 1px),linear-gradient(90deg,#3b82f6 1px,transparent 1px)', backgroundSize: '55px 55px' }}/>
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle,#3b82f6,transparent)', top: '-10%', left: '10%', filter: 'blur(100px)' }}/>
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle,#7c3aed,transparent)', bottom: '5%', right: '5%', filter: 'blur(90px)' }}/>
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle,#06b6d4,transparent)', top: '40%', right: '20%', filter: 'blur(70px)' }}/>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#060610]/95 backdrop-blur-md border-b border-white/[0.06]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-[68px]">
          <a href="#inicio"><SoulLogo size="md"/></a>

          <nav className="hidden md:flex items-center gap-7">
            {[['#inicio','Inicio'],['#servicios','Servicios'],['#canje','Centro de Canje'],['#nosotros','Nosotros'],['#contacto','Contacto']].map(([href,label]) => (
              <a key={href} href={href} className="text-xs font-semibold tracking-wider text-slate-300 hover:text-white transition-colors relative group">
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all duration-300"/>
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/canjear"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white transition-all duration-200"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 0 18px rgba(124,58,237,0.35)' }}>
              <Gift size={14}/> Canjear regalo
            </Link>
            <Link to="/admin/login"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 text-xs font-medium hover:text-white hover:border-white/[0.15] transition-all">
              <Lock size={12}/> Iniciar Admin
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-[#080816]/98 backdrop-blur-md border-t border-white/[0.06] px-4 py-4 space-y-1">
              {[['#inicio','Inicio'],['#servicios','Servicios'],['#canje','Centro de Canje'],['#nosotros','Nosotros'],['#contacto','Contacto']].map(([href,label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm font-medium text-slate-300 border-b border-white/[0.05] hover:text-white transition-colors">{label}</a>
              ))}
              <div className="flex gap-3 pt-3">
                <Link to="/canjear" onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                  <Gift size={14}/> Canjear regalo
                </Link>
                <Link to="/admin/login" onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 text-sm">
                  <Lock size={13}/>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%,#0a1628 0%,#060610 70%)' }}/>
          {/* Círculos orbitales */}
          {[520, 380, 250].map((r, i) => (
            <div key={r} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: r, height: r, border: `1px solid rgba(59,130,246,${0.08 - i*0.02})` }}/>
          ))}
          {/* Puntos flotantes */}
          {[[-160,-80],[160,-100],[200,60],[-180,80],[0,-140]].map(([x,y],i) => (
            <motion.div key={i} className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-blue-400"
              style={{ marginLeft: x, marginTop: y, opacity: 0.4 }}
              animate={{ y: [0,-8,0], opacity: [0.4,0.8,0.4] }}
              transition={{ duration: 2+i*0.5, repeat: Infinity, delay: i*0.3 }}/>
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"/>
            Servicios Digitales Premium · Entrega Inmediata
          </motion.div>

          {/* Título */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
            <span className="text-white">Cuentas Premium de</span>
            <br/>
            <span className="relative">
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Streaming</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent blur-2xl opacity-40 select-none" aria-hidden>Streaming</span>
            </span>
            <span className="text-white"> al Mejor Precio</span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Accede a cuentas premium de Spotify, Netflix, Disney+, YouTube Premium, ChatGPT y muchos más,
            con <span className="text-white font-medium">entrega rápida</span> y <span className="text-white font-medium">soporte garantizado</span>.
          </motion.p>

          {/* Botones */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <a href={WA} target="_blank" rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300"
              style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 0 25px rgba(37,99,235,0.45)' }}>
              Comprar ahora <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/>
            </a>
            <Link to="/canjear"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 25px rgba(124,58,237,0.4)' }}>
              <Gift size={15}/> Canjear regalo
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: Zap,       label: 'Entrega inmediata' },
              { icon: Clock,     label: 'Soporte 24/7' },
              { icon: Shield,    label: 'Pagos seguros' },
              { icon: Users,     label: 'Miles de clientes' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
                <Icon size={14} className="text-blue-400"/>
                <span>{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Mockup dashboard */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 relative mx-auto max-w-2xl">
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(10,16,40,0.8)', boxShadow: '0 0 60px rgba(59,130,246,0.15), 0 40px 80px rgba(0,0,0,0.5)' }}>
              {/* Barra de ventana */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }}/>)}
                <div className="flex-1 mx-3 h-5 rounded bg-white/[0.04] flex items-center px-3"><span className="text-xs text-slate-600">app.soulstreaming.mx</span></div>
              </div>
              {/* Contenido mockup */}
              <div className="p-5 grid grid-cols-3 gap-3">
                {[
                  { label: 'Clientes activos', value: '2,847', color: '#3b82f6' },
                  { label: 'Servicios activos', value: '9,312', color: '#7c3aed' },
                  { label: 'Ingreso mensual', value: '$45,780', color: '#10b981' },
                ].map(k => (
                  <div key={k.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs text-slate-500 mb-1">{k.label}</p>
                    <p className="text-xl font-black" style={{ color: k.color }}>{k.value}</p>
                  </div>
                ))}
                <div className="col-span-3 rounded-xl p-3 flex gap-2 flex-wrap" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {SERVICES.slice(0,6).map(s => (
                    <div key={s.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs" style={{ background: `${s.color}15`, border: `1px solid ${s.color}25`, color: s.color }}>
                      <span>{s.icon}</span> {s.name.split(' ')[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Glow debajo */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 rounded-full opacity-20" style={{ background: 'radial-gradient(ellipse,#3b82f6,transparent)', filter: 'blur(20px)' }}/>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SERVICIOS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="servicios" className="relative py-24 px-4 sm:px-6">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.35),transparent)' }}/>
        <div className="max-w-7xl mx-auto">
          <SectionHeader tag="Catálogo" title={<>Todos los servicios que <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">necesitas</span></>} sub="Accede a las mejores plataformas digitales a precios accesibles. Entrega inmediata garantizada."/>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
            {SERVICES.map(s => (
              <motion.div key={s.name} variants={fadeUp}
                className="group relative p-5 rounded-2xl cursor-pointer overflow-hidden transition-all duration-300"
                style={{ background: s.bg, border: `1px solid ${s.color}20` }}
                whileHover={{ scale: 1.02, borderColor: `${s.color}50` }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: `radial-gradient(circle at 50% 0%,${s.color}12,transparent 70%)` }}/>
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg,transparent,${s.color}80,transparent)` }}/>
                <div className="relative z-10 flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110" style={{ background: `${s.color}18`, border: `1px solid ${s.color}25` }}>
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{s.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                    <span className="text-xs text-green-400 font-medium">Disponible</span>
                  </div>
                  <a href={WA} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}30` }}>
                    Comprar <ArrowRight size={11}/>
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          VENTAJAS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(124,58,237,0.35),transparent)' }}/>
        <div className="max-w-7xl mx-auto">
          <SectionHeader tag="Ventajas" title={<>¿Por qué elegir <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">SSouL Streaming?</span></>}/>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                className="group flex gap-4 p-6 rounded-2xl transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                whileHover={{ borderColor: 'rgba(99,102,241,0.35)', background: 'rgba(255,255,255,0.04)' }}>
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-all duration-300">
                  <f.icon size={19} className="text-blue-400"/>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1.5 flex items-center gap-2">
                    <span className="text-green-400 text-xs">✓</span> {f.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CENTRO DE CANJE
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="canje" className="relative py-24 px-4 sm:px-6">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(124,58,237,0.35),transparent)' }}/>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.12))', border: '1px solid rgba(124,58,237,0.25)', boxShadow: '0 0 60px rgba(124,58,237,0.1)' }}>
              {/* Decoraciones */}
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#7c3aed,transparent)', filter: 'blur(60px)' }}/>
              <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-8" style={{ background: 'radial-gradient(circle,#3b82f6,transparent)', filter: 'blur(50px)' }}/>
              {/* Esquinas decorativas */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-violet-500/40 rounded-tl-3xl"/>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-blue-500/40 rounded-br-3xl"/>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 sm:p-12">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-semibold mb-4">
                    <Gift size={12}/> Centro de Canje
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">¿Tienes un <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">código de regalo?</span></h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Canjea tu código y recibe tu cuenta premium automáticamente en pocos segundos. Sin complicaciones.
                  </p>
                  <Link to="/canjear"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 0 25px rgba(124,58,237,0.45)' }}>
                    <Gift size={16}/> Ir al Centro de Canje <ArrowRight size={14}/>
                  </Link>
                </div>

                {/* Ilustración tarjeta de regalo */}
                <div className="flex-shrink-0">
                  <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-48 h-28 rounded-2xl flex flex-col items-center justify-center relative"
                    style={{ background: 'linear-gradient(135deg,#4c1d95,#1e3a8a)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)' }}/>
                    <Gift size={28} className="text-violet-300 mb-2"/>
                    <p className="text-xs font-mono text-white/60 tracking-widest">XXXX-XXXX-XXXX</p>
                    <div className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"><Sparkles size={10} className="text-yellow-300"/></div>
                  </motion.div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CÓMO FUNCIONA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent)' }}/>
        <div className="max-w-5xl mx-auto">
          <SectionHeader tag="Proceso" title={<>Cómo <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">funciona</span></>} sub="Obtener tu cuenta premium es rápido y sencillo."/>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '🛒', title: 'Elige el servicio', desc: 'Selecciona la plataforma que deseas en nuestro catálogo.' },
              { step: '02', icon: '💳', title: 'Realiza el pago', desc: 'Paga de forma segura con tu método preferido.' },
              { step: '03', icon: '📩', title: 'Recibe tus datos', desc: 'Te enviamos las credenciales de acceso por WhatsApp.' },
              { step: '04', icon: '🎉', title: 'Disfruta tu cuenta', desc: 'Accede al contenido premium de inmediato.' },
            ].map((s, i) => (
              <FadeIn key={s.step} delay={i * 0.1}>
                <div className="relative flex flex-col items-center text-center p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-3xl mb-4">{s.icon}</div>
                  <div className="absolute top-4 right-4 text-xs font-black text-blue-500/30">{s.step}</div>
                  <h3 className="font-bold text-white text-sm mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  {i < 3 && <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-700 text-xl">→</div>}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          OPINIONES
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="nosotros" className="relative py-24 px-4 sm:px-6">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(124,58,237,0.3),transparent)' }}/>
        <div className="max-w-7xl mx-auto">
          <SectionHeader tag="Reseñas" title={<>Lo que dicen nuestros <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">clientes</span></>}/>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
            {REVIEWS.map((r, i) => (
              <motion.div key={i} variants={fadeUp}
                className="p-6 rounded-2xl flex flex-col gap-4"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex gap-0.5">{Array(r.stars).fill(0).map((_,j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400"/>)}</div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">"{r.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">{r.name.charAt(0)}</div>
                  <div>
                    <p className="text-xs font-semibold text-white">{r.name}</p>
                    <p className="text-xs text-slate-600">{r.service}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent)' }}/>
        <div className="max-w-3xl mx-auto">
          <SectionHeader tag="FAQ" title={<>Preguntas <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">frecuentes</span></>}/>
          <div className="space-y-2">
            {FAQS.map((f, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
                    <span className="text-sm font-semibold text-white">{f.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={16} className="text-slate-500 flex-shrink-0"/>
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                        className="overflow-hidden">
                        <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA CONTACTO
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="contacto" className="relative py-24 px-4 sm:px-6">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent)' }}/>
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-blue-400 text-xs font-bold tracking-[0.35em] uppercase mb-4">Contacto</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">¿Listo para empezar?</h2>
            <p className="text-slate-400 text-base mb-8">Escríbenos por WhatsApp y te asesoramos de inmediato. Respondemos todos los días.</p>
            <a href={WA} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base text-white transition-all duration-300"
              style={{ background: 'linear-gradient(135deg,#166534,#15803d)', boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}>
              <MessageCircle size={20}/> Contactar por WhatsApp <ArrowRight size={16}/>
            </a>
            <p className="text-slate-600 text-xs mt-4">Respuesta en minutos · Lunes a Domingo</p>
          </div>
        </FadeIn>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t py-10 px-4 sm:px-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-1">
              <SoulLogo size="sm"/>
              <p className="text-slate-500 text-xs mt-3 leading-relaxed max-w-[180px]">Servicios digitales premium con entrega inmediata.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Servicios</p>
              {SERVICES.slice(0,5).map(s => <a key={s.name} href={WA} target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-500 hover:text-slate-300 transition-colors py-0.5">{s.name}</a>)}
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Navegación</p>
              {[['#servicios','Servicios'],['#canje','Centro de Canje'],['#nosotros','Reseñas'],['#contacto','Contacto']].map(([href,label]) => (
                <a key={href} href={href} className="block text-xs text-slate-500 hover:text-slate-300 transition-colors py-0.5">{label}</a>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Contáctanos</p>
              <div className="flex gap-2 flex-wrap">
                <a href={WA} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-green-400 transition-all" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}><MessageCircle size={12}/> WhatsApp</a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 transition-all" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}><Facebook size={13}/></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center text-pink-400 transition-all" style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)' }}><Instagram size={13}/></a>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/[0.05]">
            <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Soul Streaming · Todos los derechos reservados</p>
            <div className="flex gap-4">
              <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacidad</a>
              <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Términos</a>
              <Link to="/admin/login" className="text-xs text-slate-700 hover:text-slate-500 transition-colors flex items-center gap-1"><Lock size={10}/> Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
