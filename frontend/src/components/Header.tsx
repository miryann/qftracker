import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, Plane } from 'lucide-react'

const NAV_LINKS = [
  { to: '/map', label: 'Live Map' },
  // Phase 2:
  // { to: '/schedule', label: 'Schedule' },
  // { to: '/fleet', label: 'Fleet' },
  // { to: '/about', label: 'About' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-neutral-light-gray border-b border-neutral-soft-gray shadow-sm z-20 flex-shrink-0">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 text-neutral-charcoal hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-base bg-primary-pink flex items-center justify-center shadow-btn">
            <Plane size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight">QF Tracker</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-base text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-pink text-white shadow-btn'
                    : 'text-neutral-medium-gray hover:text-neutral-charcoal hover:bg-neutral-soft-gray'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-base text-neutral-medium-gray hover:bg-neutral-soft-gray transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-soft-gray bg-neutral-light-gray px-4 py-2">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-sm font-medium ${
                  isActive ? 'text-primary-pink' : 'text-neutral-medium-gray'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
