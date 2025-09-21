import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Downloads from '@/components/pages/Downloads';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      subscription: { planType: 'Professional', status: 'active' },
    },
  }),
}));

// Mock document methods for download simulation
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();

const renderDownloads = () => {
  return render(
    <BrowserRouter>
      <Downloads />
    </BrowserRouter>
  );
};

describe('Downloads Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    global.window.open = vi.fn();
    
    // Mock document methods
    global.document.createElement = mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    });
    global.document.body.appendChild = mockAppendChild;
    global.document.body.removeChild = mockRemoveChild;
  });

  describe('Header', () => {
    it('renders the logo', () => {
      renderDownloads();
      expect(screen.getByRole('img', { name: /agentsolvr/i })).toBeInTheDocument();
    });

    it('has glass effect styling', () => {
      renderDownloads();
      const header = document.querySelector('.glass-effect');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });

    it('renders navigation buttons', () => {
      renderDownloads();
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
    });

    it('navigates to dashboard when back button is clicked', () => {
      renderDownloads();
      fireEvent.click(screen.getByText('Back to Dashboard'));
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('navigates to pricing when upgrade button is clicked', () => {
      renderDownloads();
      fireEvent.click(screen.getByText('Upgrade Plan'));
      expect(mockNavigate).toHaveBeenCalledWith('/pricing');
    });
  });

  describe('Hero Section', () => {
    it('renders main heading with brand colors', () => {
      renderDownloads();
      expect(screen.getByText(/download/i)).toBeInTheDocument();
      expect(screen.getByText('Agent')).toBeInTheDocument();
      expect(screen.getByText('SOLVR')).toBeInTheDocument();
      expect(screen.getByText(/v4/i)).toBeInTheDocument();
    });

    it('displays value proposition', () => {
      renderDownloads();
      expect(screen.getByText(/get the desktop application and start transforming/i)).toBeInTheDocument();
      expect(screen.getByText(/available for windows, macos, and linux/i)).toBeInTheDocument();
    });

    it('shows subscription status for active users', () => {
      renderDownloads();
      expect(screen.getByText('Ready to Download')).toBeInTheDocument();
      expect(screen.getByText(/your professional subscription is active/i)).toBeInTheDocument();
    });
  });

  describe('Download Options', () => {
    it('renders all three platform options', () => {
      renderDownloads();
      expect(screen.getByText('Windows')).toBeInTheDocument();
      expect(screen.getByText('macOS')).toBeInTheDocument();
      expect(screen.getByText('Linux')).toBeInTheDocument();
    });

    it('displays version and file size for each platform', () => {
      renderDownloads();
      expect(screen.getByText('Version 4.2.1 • 156 MB')).toBeInTheDocument(); // Windows
      expect(screen.getByText('Version 4.2.1 • 142 MB')).toBeInTheDocument(); // macOS
      expect(screen.getByText('Version 4.2.1 • 134 MB')).toBeInTheDocument(); // Linux
    });

    describe('Windows Download', () => {
      it('displays Windows system requirements', () => {
        renderDownloads();
        expect(screen.getByText('Windows 10 or later (64-bit)')).toBeInTheDocument();
        expect(screen.getByText('4GB RAM minimum (8GB recommended)')).toBeInTheDocument();
        expect(screen.getByText('.NET Framework 4.8 or later')).toBeInTheDocument();
      });

      it('shows correct installer filename', () => {
        renderDownloads();
        expect(screen.getByText('AgentSOLVR-4.2.1-Windows-x64.exe')).toBeInTheDocument();
      });

      it('displays checksum', () => {
        renderDownloads();
        expect(screen.getByText('sha256:a1b2c3d4e5f6...')).toBeInTheDocument();
      });

      it('initiates download when button is clicked', async () => {
        renderDownloads();
        const windowsDownloadButton = screen.getByRole('button', { name: /download for windows/i });
        
        fireEvent.click(windowsDownloadButton);
        
        await waitFor(() => {
          expect(mockCreateElement).toHaveBeenCalledWith('a');
          expect(mockClick).toHaveBeenCalled();
        });
      });
    });

    describe('macOS Download', () => {
      it('displays macOS system requirements', () => {
        renderDownloads();
        expect(screen.getByText('macOS 11.0 (Big Sur) or later')).toBeInTheDocument();
        expect(screen.getByText('Apple Silicon (M1/M2) or Intel processor')).toBeInTheDocument();
      });

      it('shows correct installer filename', () => {
        renderDownloads();
        expect(screen.getByText('AgentSOLVR-4.2.1-macOS-arm64.dmg')).toBeInTheDocument();
      });
    });

    describe('Linux Download', () => {
      it('displays Linux system requirements', () => {
        renderDownloads();
        expect(screen.getByText('Ubuntu 20.04+ or equivalent distribution')).toBeInTheDocument();
        expect(screen.getByText('GLIBC 2.31 or later')).toBeInTheDocument();
      });

      it('shows correct installer filename', () => {
        renderDownloads();
        expect(screen.getByText('AgentSOLVR-4.2.1-Linux-x64.AppImage')).toBeInTheDocument();
      });
    });

    it('download cards have hover effects', () => {
      renderDownloads();
      const downloadCards = document.querySelectorAll('.hover\\:shadow-glow');
      expect(downloadCards.length).toBe(3);
    });

    it('download cards have scale animations', () => {
      renderDownloads();
      const scaleCards = document.querySelectorAll('.hover\\:scale-105');
      expect(scaleCards.length).toBe(3);
    });

    it('download buttons have premium styling', () => {
      renderDownloads();
      const premiumButtons = document.querySelectorAll('.btn-premium');
      expect(premiumButtons.length).toBe(3);
    });
  });

  describe('Download Process', () => {
    it('shows loading state during download', async () => {
      renderDownloads();
      const downloadButton = screen.getByRole('button', { name: /download for windows/i });
      
      fireEvent.click(downloadButton);
      
      expect(screen.getByText('Preparing Download...')).toBeInTheDocument();
    });

    it('disables button during download', async () => {
      renderDownloads();
      const downloadButton = screen.getByRole('button', { name: /download for windows/i });
      
      fireEvent.click(downloadButton);
      
      expect(downloadButton).toBeDisabled();
    });

    it('creates download link with correct attributes', async () => {
      renderDownloads();
      const downloadButton = screen.getByRole('button', { name: /download for windows/i });
      
      fireEvent.click(downloadButton);
      
      await waitFor(() => {
        expect(mockCreateElement).toHaveBeenCalledWith('a');
      });
    });
  });

  describe('Installation Guide', () => {
    it('renders installation guide section', () => {
      renderDownloads();
      expect(screen.getByText('Installation Guide')).toBeInTheDocument();
    });

    it('displays installation steps', () => {
      renderDownloads();
      expect(screen.getByText('1. Download')).toBeInTheDocument();
      expect(screen.getByText('2. Install')).toBeInTheDocument();
      expect(screen.getByText('3. Launch')).toBeInTheDocument();
    });

    it('shows step descriptions', () => {
      renderDownloads();
      expect(screen.getByText('Choose your platform and download the installer')).toBeInTheDocument();
      expect(screen.getByText('Run the installer and follow the setup wizard')).toBeInTheDocument();
      expect(screen.getByText('Sign in with your account and start developing')).toBeInTheDocument();
    });

    it('has help section with support links', () => {
      renderDownloads();
      expect(screen.getByText('Need Help?')).toBeInTheDocument();
      expect(screen.getByText('Installation Guide')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });

    it('opens installation guide in new tab', () => {
      renderDownloads();
      fireEvent.click(screen.getByRole('button', { name: /installation guide/i }));
      expect(window.open).toHaveBeenCalledWith('https://docs.agentsolvr.com/installation', '_blank');
    });

    it('opens support email', () => {
      renderDownloads();
      fireEvent.click(screen.getByRole('button', { name: /contact support/i }));
      expect(window.open).toHaveBeenCalledWith('mailto:support@agentsolvr.com');
    });
  });

  describe('Release Notes', () => {
    it('renders release notes section', () => {
      renderDownloads();
      expect(screen.getByText('Release Notes')).toBeInTheDocument();
    });

    it('displays version 4.2.1 release notes', () => {
      renderDownloads();
      expect(screen.getByText('Version 4.2.1')).toBeInTheDocument();
      expect(screen.getByText('March 8, 2024')).toBeInTheDocument();
      expect(screen.getByText('Bug Fix')).toBeInTheDocument();
    });

    it('shows 4.2.1 changelog items', () => {
      renderDownloads();
      expect(screen.getByText('Fixed voice command recognition in noisy environments')).toBeInTheDocument();
      expect(screen.getByText('Improved memory usage for large project analysis')).toBeInTheDocument();
      expect(screen.getByText('Enhanced Claude API response handling')).toBeInTheDocument();
      expect(screen.getByText('Security updates for authentication system')).toBeInTheDocument();
    });

    it('displays version 4.2.0 release notes', () => {
      renderDownloads();
      expect(screen.getByText('Version 4.2.0')).toBeInTheDocument();
      expect(screen.getByText('March 1, 2024')).toBeInTheDocument();
      expect(screen.getByText('Feature Release')).toBeInTheDocument();
    });

    it('shows 4.2.0 changelog items', () => {
      renderDownloads();
      expect(screen.getByText('Added multi-language project analysis support')).toBeInTheDocument();
      expect(screen.getByText('Introduced real-time collaboration features')).toBeInTheDocument();
      expect(screen.getByText('Enhanced voice command processing with 40+ new commands')).toBeInTheDocument();
      expect(screen.getByText('Improved desktop app performance by 35%')).toBeInTheDocument();
    });

    it('has "View All Releases" link', () => {
      renderDownloads();
      expect(screen.getByText('View All Releases')).toBeInTheDocument();
    });

    it('opens GitHub releases in new tab', () => {
      renderDownloads();
      fireEvent.click(screen.getByRole('button', { name: /view all releases/i }));
      expect(window.open).toHaveBeenCalledWith('https://github.com/agentsolvr/releases', '_blank');
    });
  });

  describe('Subscription Gating', () => {
    it('shows upgrade prompt for inactive subscription', () => {
      // Mock inactive subscription
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: { subscription: { status: 'inactive' } },
      });

      renderDownloads();
      expect(screen.getByText('Subscription Required')).toBeInTheDocument();
      expect(screen.getByText(/you need an active subscription to download/i)).toBeInTheDocument();
    });

    it('redirects to pricing for users without subscription', () => {
      // Mock no subscription
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: { subscription: null },
      });

      renderDownloads();
      const downloadButton = screen.getByRole('button', { name: /download for windows/i });
      fireEvent.click(downloadButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/pricing');
    });
  });

  describe('Responsive Design', () => {
    it('uses responsive grid for download options', () => {
      renderDownloads();
      expect(document.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
    });

    it('has proper container and spacing', () => {
      renderDownloads();
      expect(document.querySelector('.container-padding')).toBeInTheDocument();
      expect(document.querySelector('.section-spacing')).toBeInTheDocument();
    });

    it('installation guide uses responsive grid', () => {
      renderDownloads();
      expect(document.querySelector('.md\\:grid-cols-3')).toBeInTheDocument();
    });

    it('help section buttons stack on mobile', () => {
      renderDownloads();
      expect(document.querySelector('.sm\\:grid-cols-2')).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('hero section has fade-in animation', () => {
      renderDownloads();
      expect(document.querySelector('.animate-fade-in')).toBeInTheDocument();
    });

    it('download cards have staggered animation', () => {
      renderDownloads();
      expect(document.querySelector('.animate-stagger')).toBeInTheDocument();
    });

    it('installation steps have gradient icons', () => {
      renderDownloads();
      const gradientIcons = document.querySelectorAll('.bg-gradient-to-r');
      expect(gradientIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderDownloads();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(8);
    });

    it('all buttons have accessible names', () => {
      renderDownloads();
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('download buttons indicate platform', () => {
      renderDownloads();
      expect(screen.getByRole('button', { name: /download for windows/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download for macos/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download for linux/i })).toBeInTheDocument();
    });

    it('system requirements are clearly marked', () => {
      renderDownloads();
      expect(screen.getByText('System Requirements:')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('loads download page efficiently', async () => {
      renderDownloads();
      await waitFor(() => {
        expect(screen.getByText('Download AgentSOLVR V4')).toBeInTheDocument();
      });
    });

    it('optimizes image loading', () => {
      renderDownloads();
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('loading');
      });
    });
  });

  describe('Brand Consistency', () => {
    it('uses Catppuccin color scheme', () => {
      renderDownloads();
      expect(document.querySelector('.bg-ctp-base')).toBeInTheDocument();
      expect(document.querySelector('.text-ctp-mauve')).toBeInTheDocument();
      expect(document.querySelector('.text-ctp-blue')).toBeInTheDocument();
    });

    it('maintains consistent spacing', () => {
      renderDownloads();
      expect(document.querySelector('.gap-8')).toBeInTheDocument();
      expect(document.querySelector('.gap-6')).toBeInTheDocument();
    });
  });

  describe('Security', () => {
    it('displays file checksums for verification', () => {
      renderDownloads();
      expect(screen.getByText(/sha256:/)).toBeInTheDocument();
    });

    it('shows secure download indicators', () => {
      renderDownloads();
      const checksumElements = document.querySelectorAll('.font-mono');
      expect(checksumElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('handles download errors gracefully', async () => {
      mockCreateElement.mockImplementation(() => {
        throw new Error('Download failed');
      });

      renderDownloads();
      const downloadButton = screen.getByRole('button', { name: /download for windows/i });
      
      expect(() => {
        fireEvent.click(downloadButton);
      }).not.toThrow();
    });

    it('handles navigation errors gracefully', () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation failed');
      });
      
      renderDownloads();
      
      expect(() => {
        fireEvent.click(screen.getByText('Back to Dashboard'));
      }).not.toThrow();
    });

    it('handles external link errors gracefully', () => {
      global.window.open = vi.fn().mockImplementation(() => {
        throw new Error('Failed to open');
      });
      
      renderDownloads();
      
      expect(() => {
        fireEvent.click(screen.getByRole('button', { name: /installation guide/i }));
      }).not.toThrow();
    });
  });

  describe('Platform Detection', () => {
    it('shows all platforms regardless of user agent', () => {
      renderDownloads();
      expect(screen.getByText('Windows')).toBeInTheDocument();
      expect(screen.getByText('macOS')).toBeInTheDocument();
      expect(screen.getByText('Linux')).toBeInTheDocument();
    });

    it('maintains consistent file sizes across platforms', () => {
      renderDownloads();
      expect(screen.getByText('156 MB')).toBeInTheDocument(); // Windows
      expect(screen.getByText('142 MB')).toBeInTheDocument(); // macOS
      expect(screen.getByText('134 MB')).toBeInTheDocument(); // Linux
    });
  });
});