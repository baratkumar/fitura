import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-fitura-dark text-white mt-auto">
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold hover:text-fitura-purple-300 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Fitura
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign in
            </Link>
            <a href="/#features" className="hover:text-white transition-colors">
              Features
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} Fitura. Gym management for modern fitness studios.</p>
        </div>
      </div>
    </footer>
  )
}
