import { Link } from 'react-router-dom';
import { Github, Twitter, MessageCircle } from 'lucide-react';

const productLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Editor', href: '/#/editor' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Intelligence', href: '/#/intelligence' },
];

const companyLinks = [
  { label: 'About', href: '/#/about' },
  { label: 'Blog', href: '/' },
  { label: 'Careers', href: '/' },
  { label: 'Contact', href: '/' },
];

export default function Footer() {
  return (
    <footer
      className="w-full"
      style={{
        backgroundColor: '#0A0A0F',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 - Logo & Tagline */}
          <div>
            <Link to="/" className="flex items-center gap-1">
              <span
                className="text-sm font-medium tracking-[0.1em] text-ivory"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                CUTFLOW
              </span>
              <span className="text-coral">.</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
              AI-powered music video editing. Cut to the beat, automate your workflow, and deliver faster.
            </p>
          </div>

          {/* Column 2 - Product */}
          <div>
            <h4
              className="mb-4 text-xs font-medium uppercase tracking-[0.05em] text-muted"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#8A8AA0] transition-colors duration-200 hover:text-coral"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h4
              className="mb-4 text-xs font-medium uppercase tracking-[0.05em] text-muted"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#8A8AA0] transition-colors duration-200 hover:text-coral"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Newsletter */}
          <div>
            <h4
              className="mb-4 text-xs font-medium uppercase tracking-[0.05em] text-muted"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Stay Updated
            </h4>
            <p className="mb-4 text-sm text-[#8A8AA0]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Get the latest on AI editing features.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-pill border border-slate bg-surface-elevated px-4 py-2 text-sm text-ivory placeholder-muted outline-none transition-all focus:border-coral"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <button
                type="submit"
                className="rounded-pill bg-coral px-4 py-2 text-sm font-medium text-obsidian transition-all hover:brightness-110"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate/30 pt-8 sm:flex-row"
        >
          <p className="text-sm text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
            &copy; 2025 CutFlow AI. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-muted transition-colors duration-200 hover:text-coral" aria-label="GitHub">
              <Github size={20} />
            </a>
            <a href="#" className="text-muted transition-colors duration-200 hover:text-coral" aria-label="X (Twitter)">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-muted transition-colors duration-200 hover:text-coral" aria-label="Discord">
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
