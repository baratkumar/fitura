export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-auto py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600">
          &copy; {new Date().getFullYear()} Fitura. Your fitness log companion.
        </p>
      </div>
    </footer>
  )
}

