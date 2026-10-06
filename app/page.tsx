import {
  Users,
  CalendarClock,
  Wallet,
  ClipboardCheck,
  MessageCircle,
  Building2,
  BarChart3,
  UserPlus,
  BadgeCheck,
  Sparkles,
  Search,
  LayoutDashboard,
  Settings,
  Clock,
  ArrowUpRight,
  Check,
} from 'lucide-react'
import LandingCTA from '@/components/LandingCTA'

/* Heights (%) for the mock revenue chart — shaped like a real week-on-week trend. */
const CHART_BARS = [38, 52, 44, 61, 55, 72, 66, 84, 71, 90, 78, 96]

const STEPS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Add your members',
    description: 'Register clients with photos, plans, and payment details in minutes.',
  },
  {
    step: '02',
    icon: BadgeCheck,
    title: 'Track memberships',
    description: 'Monitor active, expiring, and lapsed memberships from a single dashboard.',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Grow with insight',
    description: 'Use revenue and attendance data to make smarter decisions every day.',
  },
]

export default function Home() {
  return (
    <div className="bg-fitura-night text-white">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        {/* Ambient colour — kept low-opacity so the gradient reads as light, not wallpaper */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[70rem] -translate-x-1/2 rounded-full bg-fitura-blue/25 blur-[128px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-24 h-[28rem] w-[28rem] rounded-full bg-fitura-magenta/20 blur-[112px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-72 h-[26rem] w-[26rem] rounded-full bg-fitura-purple-600/20 blur-[112px]"
        />
        {/* Grid */}
        <div
          aria-hidden
          className="mask-fade-b pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="container relative mx-auto px-4 pb-20 pt-28 sm:pb-28 sm:pt-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fitura-magenta opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fitura-magenta" />
              </span>
              Gym management, simplified
            </div>

            <h1 className="animate-fade-up mt-7 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl [animation-delay:80ms]">
              Run your gym.
              <br />
              <span className="bg-gradient-to-r from-fitura-blue-400 via-fitura-purple-400 to-fitura-magenta-400 bg-clip-text text-transparent">
                Not your spreadsheets.
              </span>
            </h1>

            <p className="animate-fade-up mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-white/60 sm:text-xl [animation-delay:160ms]">
              Fitura brings clients, memberships, attendance, and revenue into one dashboard —
              so you can spend your day on the floor, not in a browser tab.
            </p>

            <div className="animate-fade-up mt-9 flex flex-col justify-center gap-3 sm:flex-row [animation-delay:240ms]">
              <LandingCTA variant="hero-primary" />
              <LandingCTA variant="hero-secondary" />
            </div>

            <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/45 [animation-delay:320ms]">
              {['IST-accurate reporting', 'WhatsApp reminders', 'Multi-gym ready'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* ------------------------------------------------ Product shot */}
          <div className="animate-fade-up relative mx-auto mt-16 max-w-5xl [animation-delay:400ms] sm:mt-20">
            {/* Glow bed */}
            <div
              aria-hidden
              className="absolute -inset-x-8 -top-6 bottom-0 rounded-[2rem] bg-gradient-fitura opacity-25 blur-3xl"
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl shadow-black/60 ring-1 ring-white/10">
              {/* Window chrome */}
              <div className="flex items-center gap-3 border-b border-gray-200/80 bg-gray-50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto hidden items-center gap-2 rounded-md bg-white px-3 py-1 text-[11px] text-gray-400 ring-1 ring-gray-200 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  fitura.app/dashboard
                </div>
              </div>

              <div className="flex">
                {/* Sidebar */}
                <aside className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-gray-100 bg-gray-50/60 py-4 sm:flex">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-fitura text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  {[LayoutDashboard, Users, Clock, BarChart3, Settings].map((Icon, i) => (
                    <div
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        i === 0 ? 'bg-fitura-blue/10 text-fitura-blue' : 'text-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  ))}
                </aside>

                {/* Panel */}
                <div className="min-w-0 flex-1 bg-white p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 sm:text-base">Dashboard</p>
                      <p className="text-[11px] text-gray-400">Today at a glance</p>
                    </div>
                    <div className="hidden items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-[11px] text-gray-400 ring-1 ring-gray-200 sm:flex">
                      <Search className="h-3 w-3" />
                      Search members
                    </div>
                  </div>

                  {/* Stat tiles */}
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {[
                      { label: "Today's revenue", value: '₹12,500', delta: '+18%', tint: 'text-fitura-blue', dot: 'bg-fitura-blue' },
                      { label: 'Active members', value: '248', delta: '+12', tint: 'text-emerald-600', dot: 'bg-emerald-500' },
                      { label: 'Expiring soon', value: '18', delta: 'this month', tint: 'text-orange-500', dot: 'bg-orange-500' },
                      { label: 'Attendance', value: '42', delta: 'today', tint: 'text-fitura-purple-600', dot: 'bg-fitura-purple-600' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-gray-100 bg-gray-50/70 p-3"
                      >
                        <div className="mb-1.5 flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${stat.dot}`} />
                          <p className="truncate text-[10px] font-medium text-gray-500">
                            {stat.label}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-gray-900 sm:text-xl">{stat.value}</p>
                        <p className={`text-[10px] font-medium ${stat.tint}`}>{stat.delta}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart + breakdown */}
                  <div className="mt-2.5 grid gap-2.5 lg:grid-cols-5">
                    <div className="rounded-xl border border-gray-100 p-3.5 lg:col-span-3">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-gray-700">Revenue this month</p>
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                          <ArrowUpRight className="h-2.5 w-2.5" />
                          24%
                        </span>
                      </div>
                      <div className="flex h-20 items-end gap-1 sm:h-24 sm:gap-1.5">
                        {CHART_BARS.map((h, i) => (
                          <div
                            key={i}
                            className="animate-grow-bar flex-1 origin-bottom rounded-sm bg-gradient-to-t from-fitura-blue/70 to-fitura-purple-500"
                            style={{
                              height: `${h}%`,
                              animationDelay: `${500 + i * 45}ms`,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 p-3.5 lg:col-span-2">
                      <p className="mb-3 text-[11px] font-semibold text-gray-700">
                        Membership overview
                      </p>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Active', pct: 72, color: 'bg-emerald-500' },
                          { label: 'Expiring soon', pct: 18, color: 'bg-orange-400' },
                          { label: 'Lapsed', pct: 10, color: 'bg-gray-300' },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="mb-1 flex justify-between text-[10px]">
                              <span className="font-medium text-gray-600">{item.label}</span>
                              <span className="text-gray-400">{item.pct}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={`h-full rounded-full ${item.color}`}
                                style={{ width: `${item.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <section id="features" className="relative py-20 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-px w-full max-w-5xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fitura-blue-400">
              Features
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Built for gym owners who stay busy on the floor
            </h2>
            <p className="mt-4 text-lg text-white/55">
              From the front desk to the back office — manage your studio without losing focus on
              your members.
            </p>
          </div>

          {/* Bento */}
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {/* Revenue — hero card */}
            <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-white/20 md:col-span-2">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-fitura-blue/20 blur-3xl"
              />
              <div className="relative flex h-full flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-fitura-blue/15 text-fitura-blue-300">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">Revenue dashboard</h3>
                  <p className="mt-2 leading-relaxed text-white/55">
                    Track today’s revenue, monthly totals, and yearly performance with IST-accurate
                    reporting.
                  </p>
                </div>
                {/* Mini chart */}
                <div className="flex h-24 w-full items-end gap-1.5 sm:w-44">
                  {[40, 58, 47, 70, 62, 88, 76, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-fitura-blue/40 to-fitura-blue-400 transition-transform duration-500 group-hover:scale-y-105"
                      style={{ height: `${h}%`, transformOrigin: 'bottom' }}
                    />
                  ))}
                </div>
              </div>
            </article>

            {/* Expiry */}
            <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-white/20">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-orange-500/15 blur-3xl"
              />
              <div className="relative">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-orange-500/15 text-orange-400">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">Expiry tracking</h3>
                <p className="mt-2 leading-relaxed text-white/55">
                  See who is expiring today, this month, active, or lapsed — and act before members
                  churn.
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {[
                    { label: 'Today · 3', cls: 'bg-red-500/15 text-red-300 border-red-500/20' },
                    { label: 'This month · 18', cls: 'bg-orange-500/15 text-orange-300 border-orange-500/20' },
                    { label: 'Active · 248', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
                  ].map((pill) => (
                    <span
                      key={pill.label}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${pill.cls}`}
                    >
                      {pill.label}
                    </span>
                  ))}
                </div>
              </div>
            </article>

            {/* Client profiles */}
            <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-white/20">
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-fitura-purple-600/20 blur-3xl"
              />
              <div className="relative">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-fitura-purple-600/15 text-fitura-purple-300">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">Client profiles</h3>
                <p className="mt-2 leading-relaxed text-white/55">
                  Store member details, photos, membership plans, and payment history in one place.
                </p>
                <div className="mt-5 flex items-center">
                  {['A', 'S', 'R', 'M'].map((initial, i) => (
                    <div
                      key={initial}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-fitura-night bg-gradient-fitura text-xs font-bold"
                      style={{ marginLeft: i === 0 ? 0 : '-0.5rem' }}
                    >
                      {initial}
                    </div>
                  ))}
                  <span className="ml-3 text-xs text-white/40">+244 members</span>
                </div>
              </div>
            </article>

            {/* WhatsApp — wide */}
            <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-white/20 md:col-span-2">
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-green-500/15 blur-3xl"
              />
              <div className="relative flex h-full flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-green-500/15 text-green-400">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">WhatsApp reminders</h3>
                  <p className="mt-2 leading-relaxed text-white/55">
                    Send renewal reminders automatically so members never miss their membership
                    date.
                  </p>
                </div>
                <div className="w-full space-y-2 sm:w-56">
                  <div className="ml-auto w-fit rounded-2xl rounded-br-sm border border-green-500/20 bg-green-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-white/75">
                    Hi Arjun 👋 Your membership expires in 3 days. Renew today to keep your streak
                    going!
                  </div>
                  <div className="flex items-center justify-end gap-1 pr-1 text-[10px] text-white/35">
                    Delivered
                    <Check className="h-3 w-3 text-green-400" />
                  </div>
                </div>
              </div>
            </article>

            {/* Multi-gym — wide */}
            <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-white/20 md:col-span-2">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-fitura-magenta/15 blur-3xl"
              />
              <div className="relative flex h-full flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-fitura-magenta/15 text-fitura-magenta-300">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">Multi-gym ready</h3>
                  <p className="mt-2 leading-relaxed text-white/55">
                    Filter dashboard metrics and client lists by location when you run more than one
                    studio.
                  </p>
                </div>
                <div className="w-full space-y-1.5 sm:w-52">
                  {[
                    { name: 'Anna Nagar', members: 248, active: true },
                    { name: 'T. Nagar', members: 176, active: false },
                    { name: 'Velachery', members: 94, active: false },
                  ].map((gym) => (
                    <div
                      key={gym.name}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                        gym.active
                          ? 'border-fitura-magenta/30 bg-fitura-magenta/10 text-white'
                          : 'border-white/10 bg-white/[0.02] text-white/45'
                      }`}
                    >
                      <span className="font-medium">{gym.name}</span>
                      <span className="tabular-nums">{gym.members}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            {/* Attendance */}
            <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-white/20">
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-emerald-500/15 blur-3xl"
              />
              <div className="relative">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-emerald-500/15 text-emerald-400">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">Attendance</h3>
                <p className="mt-2 leading-relaxed text-white/55">
                  Record check-ins quickly and review attendance history for every member.
                </p>
                {/* Check-in streak grid */}
                <div className="mt-5 grid grid-cols-7 gap-1.5">
                  {[1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1].map((on, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-[3px] ${
                        on ? 'bg-emerald-500/70' : 'bg-white/[0.06]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- How it works */}
      <section className="relative py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fitura-magenta-300">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in three steps
            </h2>
            <p className="mt-4 text-lg text-white/55">
              No complicated setup. Start managing your gym the same day.
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl">
            {/* Connecting rail */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-fitura-blue/0 via-fitura-purple-500/50 to-fitura-magenta/0 md:block"
            />
            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map(({ step, icon: Icon, title, description }) => (
                <div key={step} className="relative text-center md:text-left">
                  <div className="mb-5 flex justify-center md:justify-start">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-fitura-night shadow-lg">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-gradient-fitura opacity-20"
                      />
                      <Icon className="relative h-6 w-6 text-white" />
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white text-[10px] font-black text-fitura-night">
                        {step}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-white/55">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="px-4 pb-24 pt-4 sm:pb-28">
        <div className="container mx-auto">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-16 text-center sm:px-16 sm:py-20">
            {/* Gradient rim + bloom, instead of a full gradient fill */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-fitura opacity-30 blur-[100px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                Ready to run your gym smarter?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-white/60">
                Sign in to access your dashboard, client lists, attendance, and revenue reports.
              </p>
              <div className="mt-9 flex justify-center">
                <LandingCTA variant="banner" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
