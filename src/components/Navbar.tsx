import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Editor', href: '/#/editor' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Intelligence', href: '/#/intelligence' },
  { label: 'About', href: '/#/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(10, 10, 15, 0.85)' : 'rgba(10, 10, 15, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.3)' : 'none',
        }}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1">
            <span
              className="text-sm font-medium tracking-[0.1em] text-ivory"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              CUTFLOW
            </span>
            <span className="text-coral">.</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#8A8AA0] transition-colors duration-200 hover:text-ivory"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              to="/"
              className="inline-flex items-center rounded-pill bg-coral px-5 py-2 text-sm font-medium text-obsidian transition-all duration-200 hover:brightness-110"
              style={{
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 0 20px rgba(255, 90, 54, 0.2)',
              }}
            >
              Start Free
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="text-ivory md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
            style={{
              backgroundColor: 'rgba(10, 10, 15, 0.98)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="text-2xl font-medium text-ivory transition-colors hover:text-coral"
                style={{ fontFamily: 'Syne, sans-serif' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Link
                to="/"
                className="mt-4 inline-flex items-center rounded-pill bg-coral px-8 py-3 text-lg font-medium text-obsidian"
                onClick={() => setMobileOpen(false)}
              >
                Start Free
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
