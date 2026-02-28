import Link from 'next/link'
import { Dumbbell, Users, TrendingUp, Shield, Zap, Star, ArrowRight, CheckCircle } from 'lucide-react'

export default function Home() {
  const stats = [
    { value: '500+', label: 'Active Members' },
    { value: '₹10L+', label: 'Revenue Tracked' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Access' },
  ]

  const features = [
    {
      icon: Users,
      title: 'Member Management',
      description: 'Complete client profiles with health metrics, photos, payment history and membership tracking — all in one place.',
    },
    {
      icon: TrendingUp,
      title: 'Revenue Analytics',
      description: 'Real-time dashboard showing daily, weekly and all-time revenue, attendance and membership insights.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Protected login, encrypted data, and a rock-solid MongoDB backend that scales with your gym.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built on Next.js 14 for instant page loads, smooth transitions and a seamless management experience.',
    },
    {
      icon: CheckCircle,
      title: 'Attendance Tracking',
      description: 'One-tap check-in and check-out with duration tracking, session history and date filters.',
    },
    {
      icon: Star,
      title: 'Smart Renewals',
      description: 'Auto-calculates expiry dates, flags expiring members, and keeps full renewal history per client.',
    },
  ]

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Background layers */}
        <div className="absolute inset-0 bg-luxury-black" />

        {/* Radial gold glow — center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] rounded-full animate-pulse-gold"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.04) 50%, transparent 70%)' }} />
        </div>

        {/* Top-left glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full animate-pulse-gold"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%)', animationDelay: '2s' }} />

        {/* Bottom-right glow */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full animate-pulse-gold"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', animationDelay: '1s' }} />

        {/* Decorative spinning ring */}
        <div className="absolute right-[8%] top-[15%] opacity-10 animate-spin-slow pointer-events-none hidden lg:block">
          <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
            <circle cx="160" cy="160" r="155" stroke="#D4AF37" strokeWidth="1" strokeDasharray="8 12" />
            <circle cx="160" cy="160" r="120" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="4 8" />
            <circle cx="160" cy="160" r="80"  stroke="#D4AF37" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Decorative dumbbell icon — right */}
        <div className="absolute right-[10%] top-[20%] opacity-5 animate-float-slow pointer-events-none hidden lg:block">
          <Dumbbell className="w-72 h-72 text-gold" />
        </div>

        {/* Horizontal thin line decorators */}
        <div className="absolute left-0 top-1/2 w-24 h-px bg-gradient-to-r from-transparent to-gold/30 hidden lg:block" />
        <div className="absolute right-0 top-1/2 w-24 h-px bg-gradient-to-l from-transparent to-gold/30 hidden lg:block" />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 border border-gold/30 rounded-full px-4 py-1.5 mb-8 bg-gold/5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-gold uppercase">Premium Gym Management</span>
          </div>

          {/* Main Headline */}
          <h1 className="animate-fade-up-delay-1 text-5xl sm:text-6xl lg:text-8xl font-black leading-none tracking-tight mb-6">
            <span className="block text-luxury-text">Elevate Your</span>
            <span className="block shimmer-text mt-2">Fitness Empire</span>
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-up-delay-2 text-luxury-muted text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete gym management system built for premium fitness centers.
            Track members, revenue, attendance and renewals — with elegance.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard"
              className="group inline-flex items-center gap-2 bg-gold text-luxury-black px-8 py-4 rounded-xl font-bold text-sm tracking-wide hover:bg-gold-light transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
              Enter Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features"
              className="inline-flex items-center gap-2 border border-gold/30 text-gold px-8 py-4 rounded-xl font-semibold text-sm tracking-wide hover:bg-gold/5 hover:border-gold/60 transition-all">
              Explore Features
            </a>
          </div>

          {/* Scroll hint */}
          <div className="mt-20 flex justify-center animate-float-slow opacity-40">
            <div className="w-6 h-10 border border-gold/40 rounded-full flex items-start justify-center pt-2">
              <div className="w-1 h-2 bg-gold rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="border-y border-luxury-border bg-luxury-surface py-4 overflow-hidden">
        <div className="animate-ticker flex gap-16 whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-16 shrink-0">
              {['Member Management', 'Revenue Tracking', 'Attendance System', 'Renewal Alerts', 'Receipt Downloads', 'Membership Plans', 'Analytics Dashboard', 'Secure Login'].map((item) => (
                <span key={item} className="flex items-center gap-3 text-luxury-muted text-sm font-medium">
                  <span className="text-gold text-xs">✦</span> {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="py-20 bg-luxury-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-luxury-border rounded-2xl overflow-hidden">
            {stats.map((stat, i) => (
              <div key={i}
                className={`p-8 text-center bg-luxury-surface hover:bg-luxury-card transition-colors
                  ${i < stats.length - 1 ? 'border-r border-luxury-border' : ''}`}>
                <p className="shimmer-text text-4xl font-black mb-2">{stat.value}</p>
                <p className="text-luxury-muted text-xs font-semibold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 bg-luxury-black">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="text-xs font-semibold tracking-widest text-gold uppercase">Everything You Need</span>
            <h2 className="text-4xl sm:text-5xl font-black text-luxury-text mt-3 mb-4">
              Built for <span className="shimmer-text">Excellence</span>
            </h2>
            <div className="mx-auto mt-4 w-16 h-px bg-gold/40" />
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div key={i}
                className="group relative bg-luxury-surface border border-luxury-border rounded-2xl p-8 hover:border-gold/40 transition-all duration-300 hover:bg-luxury-card overflow-hidden">
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 30% 30%, rgba(212,175,55,0.06), transparent 60%)' }} />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-5 group-hover:bg-gold/15 transition-colors">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="text-luxury-text font-bold text-lg mb-3">{title}</h3>
                  <p className="text-luxury-muted text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-luxury-surface" />
        {/* Gold glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full animate-pulse-gold"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }} />
        </div>
        {/* Top & bottom border lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <span className="text-xs font-semibold tracking-widest text-gold uppercase">Get Started Today</span>
          <h2 className="text-4xl sm:text-6xl font-black text-luxury-text mt-4 mb-6">
            Your Gym Deserves<br />
            <span className="shimmer-text">The Best Tools</span>
          </h2>
          <p className="text-luxury-muted text-lg max-w-xl mx-auto mb-10">
            Join the premium gym management experience. Track every member, every rupee, every session.
          </p>
          <Link href="/dashboard"
            className="group inline-flex items-center gap-2 bg-gold text-luxury-black px-10 py-4 rounded-xl font-bold text-sm tracking-wide hover:bg-gold-light transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]">
            Open Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  )
}
