import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Play, Menu, X, MessageCircle, ChevronDown,
  Shield, Zap, RefreshCw, Headphones, CreditCard,
  Star, ArrowRight, Instagram, Facebook,
} from 'lucide-react'

// ── Servicios ─────────────────────────────────────────────────────────────────
const SERVICES = [
  { name: 'Netflix',          emoji: '🎬', color: '#E50914', desc: 'Series y películas en HD y 4K' },
  { name: 'Disney+',          emoji: '✨', color: '#113CCF', desc: 'Marvel, Star Wars, Pixar y más' },
  { name: 'Prime Video',      emoji: '📦', color: '#00A8E0', desc: 'Amazon Originals y blockbusters' },
  { name: 'HBO Max',          emoji: '👑', color: '#5822B4', desc: 'HBO, DC y contenido premium' },
  { name: 'Spotify Premium',  emoji: '🎵', color: '#1DB954', desc: 'Música sin límites, sin anuncios' },
  { name: 'YouTube Premium',  emoji: '▶️', color: '#FF0000', desc: 'Videos sin anuncios + YouTube Music' },
  { name: 'Crunchyroll',      emoji: '⚡', color: '#F47521', desc: 'El mejor catálogo de anime' },
  { name: 'Paramount+',       emoji: '⭐', color: '#0064FF', desc: 'CBS, MTV, Nickelodeon y más' },
  { name: 'Vix Premium',      emoji: '🌟', color: '#0066CC', desc: 'Contenido latino premium' },
]

// ── Ventajas ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: CreditCard,   title: 'Ahorro en suscripciones',    desc: 'Paga solo por lo que usas, sin comprometer la calidad.' },
  { icon: Headphones,   title: 'Atención personalizada',     desc: 'Un asesor dedicado para cada cliente, siempre disponible.' },
  { icon: RefreshCw,    title: 'Renovaciones rápidas',       desc: 'Proceso ágil y sin complicaciones, listo en minutos.' },
  { icon: MessageCircle,title: 'Soporte por WhatsApp',       desc: 'Comunícate con nosotros en cualquier momento del día.' },
  { icon: Shield,       title: 'Métodos de pago seguros',    desc: 'Transferencia, OXXO, Arcus y más opciones confiables.' },
  { icon: Star,         title: 'Servicio confiable',         desc: 'Años de experiencia y cientos de clientes satisfechos.' },
]

// ── Partícula decorativa ──────────────────────────────────────────────────────
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full bg-blue-500 opacity-20 animate-pulse"
      style={style}
    />
  )
}

// ── Nav link ──────────────────────────────────────────────────────────────────
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href}
      className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 relative group">
      {children}
      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all duration-300" />
    </a>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const WA_LINK = 'https://wa.me/526613519349?text=Hola%20Soul%20Streaming%2C%20me%20interesa%20un%20servicio'

  return (
    <div className="min-h-screen bg-[#060610] text-white overflow-x-hidden">

      {/* ── PARTÍCULAS FONDO ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <Particle style={{ width: 300, height: 300, top: '5%',  left: '10%', filter: 'blur(80px)' }} />
        <Particle style={{ width: 250, height: 250, top: '60%', right: '8%', filter: 'blur(70px)', animationDelay: '1s' }} />
        <Particle style={{ width: 180, height: 180, top: '35%', left: '55%', filter: 'blur(60px)', animationDelay: '2s' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#060610]/95 backdrop-blur-md border-b border-blue-900/30 shadow-[0_0_30px_rgba(59,130,246,0.08)]' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <a href="#inicio" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] transition-all duration-300">
                <Play size={16} className="text-white" fill="white" />
              </div>
              <div className="leading-none">
                <p className="text-sm font-bold text-white tracking-wide">SOUL</p>
                <p className="text-xs font-semibold text-blue-400 tracking-widest">STREAMING</p>
              </div>
            </a>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <NavLink href="#inicio">Inicio</NavLink>
              <NavLink href="#servicios">Servicios</NavLink>
              <NavLink href="#nosotros">Nosotros</NavLink>
              <NavLink href="#contacto">Contacto</NavLink>
            </nav>

            {/* CTA + Admin */}
            <div className="hidden md:flex items-center gap-3">
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-600/30 transition-all duration-200">
                <MessageCircle size={14} />
                WhatsApp
              </a>
              <Link to="/admin/login"
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-400 text-xs font-medium hover:text-slate-200 hover:border-slate-600 transition-all duration-200">
                Iniciar Admin
              </Link>
            </div>

            {/* Burger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0a0a18]/98 backdrop-blur-md border-t border-blue-900/20 px-4 py-4 space-y-3">
            {['#inicio', '#servicios', '#nosotros', '#contacto'].map((href, i) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-300 hover:text-white border-b border-slate-800">
                {['Inicio', 'Servicios', 'Nosotros', 'Contacto'][i]}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 text-sm">
                <MessageCircle size={14} /> WhatsApp
              </a>
              <Link to="/admin/login" onClick={() => setMenuOpen(false)}
                className="flex-1 flex items-center justify-center py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-sm">
                Iniciar Admin
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="inicio" ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">

        {/* Fondo hero */}
        <div className="absolute inset-0 z-0">
          {/* Gradiente base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#060610] via-[#0a0a20] to-[#060614]" />
          {/* Orb central */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
          {/* Líneas de escaneo */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59,130,246,0.5) 2px, rgba(59,130,246,0.5) 3px)', backgroundSize: '100% 8px' }} />
          {/* Hexágonos decorativos */}
          <div className="absolute top-20 right-10 w-64 h-64 opacity-5 border border-blue-400 rotate-12"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
          <div className="absolute bottom-32 left-10 w-40 h-40 opacity-5 border border-blue-400 -rotate-12"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Servicios Digitales Premium · México
          </div>

          {/* Título */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4 leading-none">
            <span className="text-white">SOUL</span>
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">
                STREAMING
              </span>
              {/* Glow text */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent blur-2xl opacity-40 select-none" aria-hidden>
                STREAMING
              </span>
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-blue-300/80 text-lg sm:text-xl font-light tracking-[0.3em] uppercase mb-8">
            Servicios Digitales Premium
          </p>

          {/* Descripción */}
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Soul Streaming es una tienda de servicios digitales premium especializada en la gestión, 
            venta y asesoramiento de cuentas compartidas para las principales plataformas de contenido 
            bajo demanda.
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#servicios"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm transition-all duration-300 shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)]">
              Ver Servicios
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-green-600/20 border border-green-500/40 hover:bg-green-600/30 hover:border-green-500/60 text-green-400 font-semibold text-sm transition-all duration-300">
              <MessageCircle size={16} />
              Contactar por WhatsApp
            </a>
          </div>

          {/* Scroll hint */}
          <div className="mt-16 flex flex-col items-center gap-2 text-slate-600 animate-bounce">
            <ChevronDown size={20} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SERVICIOS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="servicios" className="relative py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Header sección */}
          <div className="text-center mb-16">
            <p className="text-blue-400 text-xs font-semibold tracking-[0.3em] uppercase mb-3">Catálogo</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Nuestros <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Servicios</span>
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Accede a las mejores plataformas de entretenimiento digital a precios accesibles.
            </p>
          </div>

          {/* Grid servicios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {SERVICES.map((s) => (
              <div key={s.name}
                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-blue-500/40 transition-all duration-300 cursor-pointer overflow-hidden hover:bg-white/[0.05]"
                style={{ '--service-color': s.color } as any}>

                {/* Glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}15 0%, transparent 70%)` }} />

                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${s.color}80, transparent)` }} />

                <div className="relative z-10 flex items-start gap-4">
                  {/* Icono */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-white/10 group-hover:border-white/20 transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${s.color}15` }}>
                    {s.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1 group-hover:text-blue-100 transition-colors">{s.name}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-400 transition-colors">{s.desc}</p>
                  </div>
                </div>

                {/* Bottom tag */}
                <div className="relative z-10 mt-4 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Disponible</span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      Cotizar <ArrowRight size={10} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          VENTAJAS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6">
        {/* Separador decorativo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-400 text-xs font-semibold tracking-[0.3em] uppercase mb-3">Beneficios</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              ¿Por qué elegir{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Soul Streaming?
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i}
                className="group flex gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-blue-500/30 hover:bg-white/[0.05] transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all duration-300">
                  <f.icon size={18} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1.5 flex items-center gap-2">
                    <span className="text-green-400">✓</span> {f.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          NOSOTROS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="nosotros" className="relative py-24 px-4 sm:px-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="max-w-5xl mx-auto">
          <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-900/20 to-[#0a0a20] border border-blue-500/20 overflow-hidden">

            {/* Decoración esquinas */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-blue-500/40 rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-blue-500/40 rounded-br-3xl" />
            <div className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full"
              style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

            <div className="relative z-10 text-center">
              <p className="text-blue-400 text-xs font-semibold tracking-[0.3em] uppercase mb-4">Quiénes somos</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Nuestra <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Misión</span>
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mb-6">
                En <span className="text-blue-400 font-semibold">Soul Streaming</span> trabajamos para acercar el entretenimiento 
                digital a más personas mediante soluciones accesibles, seguras y confiables.
              </p>
              <p className="text-slate-400 text-base leading-relaxed max-w-3xl mx-auto mb-8">
                Nuestra misión es ofrecer una experiencia sencilla y transparente para todos nuestros clientes, 
                siendo el punto de conexión confiable y eficiente entre los usuarios que buscan optimizar sus costos 
                de suscripción y la oferta de entretenimiento digital.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                {[
                  { value: '9+',    label: 'Plataformas' },
                  { value: '100%',  label: 'Confiable' },
                  { value: '24/7',  label: 'Soporte' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA / CONTACTO
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="contacto" className="relative py-24 px-4 sm:px-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-400 text-xs font-semibold tracking-[0.3em] uppercase mb-4">Contacto</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-slate-400 text-base mb-10 max-w-xl mx-auto">
            Escríbenos por WhatsApp y te asesoramos de inmediato. Atención personalizada para cada cliente.
          </p>

          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-base transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.35)] hover:shadow-[0_0_45px_rgba(34,197,94,0.55)]">
            <MessageCircle size={20} />
            Contactar por WhatsApp
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <p className="text-slate-600 text-xs mt-6">Respuesta en minutos · Lunes a Domingo</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.06] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                <Play size={13} className="text-white" fill="white" />
              </div>
              <div className="leading-none">
                <p className="text-xs font-bold text-white tracking-wide">SOUL STREAMING</p>
                <p className="text-[10px] text-slate-500">Servicios Digitales Premium</p>
              </div>
            </div>

            {/* Derechos */}
            <p className="text-slate-600 text-xs text-center">
              © {new Date().getFullYear()} Soul Streaming · Todos los derechos reservados
            </p>

            {/* Redes sociales */}
            <div className="flex items-center gap-3">
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/20 transition-all duration-200">
                <MessageCircle size={14} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all duration-200">
                <Facebook size={14} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 hover:bg-pink-500/20 transition-all duration-200">
                <Instagram size={14} />
              </a>
              {/* Admin discreto */}
              <Link to="/admin/login"
                className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/30 flex items-center justify-center text-slate-600 hover:text-slate-400 hover:border-slate-600 transition-all duration-200"
                title="Administración">
                <Shield size={13} />
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
