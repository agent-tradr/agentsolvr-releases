import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo, Button } from '@/components/ui';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact' },
    { path: '/downloads', label: 'Download' }
  ];

  return (
    <header className="bg-ctp-surface0 border-b border-ctp-surface1 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors whitespace-nowrap ${
                  isActive(item.path)
                    ? 'text-ctp-blue font-medium'
                    : 'text-ctp-subtext1 hover:text-ctp-text'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link to="/login">
              <Button 
                variant="outline" 
                size="sm"
                className="border-ctp-surface2 text-ctp-text hover:bg-ctp-surface1 whitespace-nowrap"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-ctp-blue to-ctp-mauve hover:from-ctp-mauve hover:to-ctp-blue whitespace-nowrap"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-ctp-text hover:text-ctp-blue"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-ctp-surface1">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`transition-colors ${
                    isActive(item.path)
                      ? 'text-ctp-blue font-medium'
                      : 'text-ctp-subtext1 hover:text-ctp-text'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-ctp-surface1">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-ctp-surface2 text-ctp-text hover:bg-ctp-surface1"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    size="sm"
                    className="w-full bg-gradient-to-r from-ctp-blue to-ctp-mauve hover:from-ctp-mauve hover:to-ctp-blue"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;