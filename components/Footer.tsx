export default function Footer() {
  return (
    <footer className="bg-luxury-dark border-t border-luxury-border mt-auto py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-luxury-subtle text-sm">
          &copy; {new Date().getFullYear()} <span className="text-gold font-semibold tracking-widest">FITURA</span>. Premium Gym Management.
        </p>
      </div>
    </footer>
  )
}

