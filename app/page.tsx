import Link from 'next/link'
import { Zap, Palette, Shield } from 'lucide-react'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section bg-fitura-dark bg-gradient-fitura text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center min-h-[60vh]">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Welcome to Fitura
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                A modern, powerful fitness log application. 
                Experience seamless functionality with a beautiful, intuitive interface.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/dashboard" 
                  className="bg-white text-fitura-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
                >
                  Go to Dashboard
                </Link>
                <a 
                  href="#features" 
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-fitura-blue transition-colors text-center"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="lg:w-1/2 text-center">
              <Zap className="w-64 h-64 mx-auto opacity-30 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Features</h2>
            <p className="text-gray-600 text-lg">Everything you need to get started</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 text-center flex justify-center">
                <Zap className="w-12 h-12 text-fitura-blue" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">Fast & Efficient</h3>
              <p className="text-gray-600 text-center">
                Track your fitness journey with optimal performance and scalability.
              </p>
            </div>
            <div className="feature-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 text-center flex justify-center">
                <Palette className="w-12 h-12 text-fitura-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">Modern UI</h3>
              <p className="text-gray-600 text-center">
                Beautiful, responsive design that works on all devices.
              </p>
            </div>
            <div className="feature-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 text-center flex justify-center">
                <Shield className="w-12 h-12 text-fitura-magenta" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">Secure & Reliable</h3>
              <p className="text-gray-600 text-center">
                Built with security best practices in mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 text-lg mb-8">
            Explore the dashboard and see what Fitura can do for you.
          </p>
          <Link 
            href="/dashboard" 
            className="bg-fitura-dark text-white px-8 py-3 rounded-lg font-semibold hover:bg-fitura-blue transition-colors inline-block"
          >
            Get Started
          </Link>
        </div>
      </section>
    </>
  )
}

