import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShieldCheck, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Verify', path: '/verify' },
    { name: 'Reports', path: '/report' },
    { name: 'How It Works', path: '/how-it-works' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF7]/95 backdrop-blur-xs border-b border-[#E2E7E4]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group focus-visible:outline-2 focus-visible:outline-[#155E59] rounded"
          >
            <div className="w-7 h-7 rounded bg-[#155E59] flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-semibold text-base tracking-tight text-[#202B2A]">
              Satya<span className="text-[#155E59]">Check</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? 'text-[#155E59] bg-[#E4F2E9] font-semibold'
                      : 'text-[#516260] hover:text-[#202B2A] hover:bg-[#E8ECE9]/60'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action */}
          <div className="hidden md:flex items-center">
            <Link 
              to="/verify"
              className="px-3 py-1.5 text-xs font-medium rounded bg-[#155E59] text-white hover:bg-[#0F4541] transition-colors"
            >
              Verify Claim
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-[#516260] hover:text-[#202B2A] hover:bg-[#E8ECE9]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E2E7E4] bg-[#FAFAF7] px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm font-medium ${
                  isActive
                    ? 'text-[#155E59] bg-[#E4F2E9] font-semibold'
                    : 'text-[#516260] hover:text-[#202B2A] hover:bg-[#E8ECE9]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <div className="pt-2">
            <Link 
              to="/verify" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center px-3 py-2 text-sm font-medium rounded bg-[#155E59] text-white"
            >
              Verify Claim
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
