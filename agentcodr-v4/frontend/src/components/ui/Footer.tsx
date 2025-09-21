import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui';

const Footer: React.FC = () => {
  return (
    <footer className="bg-ctp-surface0 border-t border-ctp-surface1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-ctp-subtext1 text-sm max-w-xs">
              Multi-Agent AI platform that revolutionizes software development through voice-controlled commands and intelligent automation.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-ctp-text font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/pricing" className="text-ctp-subtext1 hover:text-ctp-text transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/downloads" className="text-ctp-subtext1 hover:text-ctp-text transition-colors text-sm">
                  Download
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-ctp-subtext1 hover:text-ctp-text transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-ctp-subtext1 hover:text-ctp-text transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-ctp-text font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/contact" 
                  className="text-ctp-subtext1 hover:text-ctp-text transition-colors text-sm"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:support@agentsolvr.com" className="text-ctp-subtext1 hover:text-ctp-text transition-colors text-sm">
                  support@agentsolvr.com
                </a>
              </li>
              <li>
                <span className="text-ctp-subtext1 text-sm">
                  24/7 Priority Support
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-ctp-text font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-ctp-subtext1 hover:text-ctp-text transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-ctp-subtext1 hover:text-ctp-text transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-ctp-subtext1 hover:text-ctp-text transition-colors text-sm">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-ctp-surface1 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-ctp-subtext1 text-sm">
            © 2025 AgentSOLVR. Built with AI-first development.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-ctp-subtext1 text-sm">
              Made with ❤️ for developers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;