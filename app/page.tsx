import {
  Users,
  CalendarClock,
  Wallet,
  ClipboardCheck,
  BadgeCheck,
  MessageCircle,
  Building2,
  BarChart3,
  UserPlus,
  Zap,
} from 'lucide-react'
import LandingCTA from '@/components/LandingCTA'

const FEATURES = [
  {
    icon: Users,
    title: 'Client profiles',
    description:
      'Store member details, photos, membership plans, and payment history in one place.',
    color: 'text-fitura-blue',
    bg: 'bg-fitura-blue/10',
  },
  {
    icon: CalendarClock,
    title: 'Expiry tracking',
    description:
      'See who is expiring today, this month, active, or lapsed — and act before members churn.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Wallet,
    title: 'Revenue dashboard',
    description:
      'Track today’s revenue, monthly totals, and yearly performance with IST-accurate reporting.',
    color: 'text-fitura-purple-600',
    bg: 'bg-fitura-purple-600/10',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance',
    description:
      'Record check-ins quickly and review attendance history for every member.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp reminders',
    description:
      'Send renewal reminders automatically so members never miss their membership date.',
    color: 'text-green-600',
    bg: 'bg-green-500/10',
  },
  {
    icon: Building2,
    title: 'Multi-gym ready',
    description:
      'Filter dashboard metrics and client lists by location when you run more than one studio.',
    color: 'text-fitura-magenta',
    bg: 'bg-fitura-magenta/10',
  },
]

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
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-fitura-dark text-white">
        <div className="absolute inset-0 bg-gradient-fitura opacity-90" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-fitura-magenta/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-fitura-blue/40 blur-3xl" />

        <div className="container mx-auto px-4 py-16 sm:py-24 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Zap className="w-4 h-4 text-fitura-magenta" />
                Gym management, simplified
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
                Everything your fitness studio needs — in one place
              </h1>
              <p className="text-lg sm:text-xl text-white/85 mb-8 max-w-xl mx-auto lg:mx-0 text-balance">
                Fitura helps gym owners manage clients, memberships, attendance, and revenue
                without spreadsheets or scattered tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <LandingCTA variant="hero-primary" />
                <LandingCTA variant="hero-secondary" />
              </div>
            </div>

            {/* Dashboard preview mock */}
            <div className="lg:w-1/2 w-full max-w-lg lg:max-w-none">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-xl" />
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider font-medium">
                        Dashboard
                      </p>
                      <p className="text-lg font-semibold">Today at a glance</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[
                      { label: "Today's revenue", value: '₹12,500', accent: 'bg-fitura-blue/30' },
                      { label: 'Active members', value: '248', accent: 'bg-emerald-500/30' },
                      { label: 'Expiring this month', value: '18', accent: 'bg-orange-500/30' },
                      { label: 'Attendance today', value: '42', accent: 'bg-fitura-purple-600/30' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className={`${stat.accent} rounded-xl p-3 sm:p-4 border border-white/10`}
                      >
                        <p className="text-[10px] sm:text-xs text-white/70 mb-1">{stat.label}</p>
                        <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl bg-white/10 border border-white/10 p-4">
                    <p className="text-xs text-white/60 mb-3">Membership overview</p>
                    <div className="space-y-3">
                      {[
                        { label: 'Active', pct: 72, color: 'bg-emerald-400' },
                        { label: 'Expiring soon', pct: 18, color: 'bg-orange-400' },
                        { label: 'Lapsed', pct: 10, color: 'bg-white/35' },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-white/80">{item.label}</span>
                            <span className="text-white/50">{item.pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
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
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <p className="text-fitura-blue font-semibold text-sm uppercase tracking-wider mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
              Built for gym owners who stay busy on the floor
            </h2>
            <p className="text-gray-600 text-lg">
              From the front desk to the back office — manage your studio without losing focus on
              your members.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="group p-6 sm:p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:border-fitura-blue/20 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <p className="text-fitura-purple-600 font-semibold text-sm uppercase tracking-wider mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Up and running in three steps</h2>
            <p className="text-gray-600 text-lg">
              No complicated setup. Start managing your gym the same day.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {STEPS.map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="relative text-center md:text-left">
                <span className="text-5xl font-black text-fitura-blue/10 absolute -top-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0">
                  {step}
                </span>
                <div className="relative pt-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-fitura text-white flex items-center justify-center mb-5 mx-auto md:mx-0 shadow-lg">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-gray-600 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-fitura px-8 py-14 sm:px-16 sm:py-20 text-center text-white">
            <div className="absolute inset-0 bg-fitura-dark/20" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
                Ready to run your gym smarter?
              </h2>
              <p className="text-lg text-white/90 mb-8">
                Sign in to access your dashboard, client lists, attendance, and revenue reports.
              </p>
              <LandingCTA variant="banner" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
