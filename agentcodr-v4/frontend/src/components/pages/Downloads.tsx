import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Monitor,
  Apple,
  Shield,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  Laptop
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Logo } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

interface DownloadOption {
  platform: string;
  version: string;
  size: string;
  icon: React.ReactNode;
  downloadUrl: string;
  requirements: string[];
  installer: string;
  checksum: string;
}

const Downloads: React.FC = () => {
  const navigate = useNavigate();
  const [downloadingPlatform, setDownloadingPlatform] = useState<string | null>(null);
  // const { user } = useAuth(); // Uncomment when auth hook is available
  
  // Mock user data
  const user = {
    subscription: { planType: 'Professional', status: 'active' }
  };

  const downloadOptions: DownloadOption[] = [
    {
      platform: 'Windows',
      version: '1.0.0',
      size: '~120 MB',
      icon: <Monitor className="w-8 h-8" />,
      downloadUrl: 'https://github.com/agent-tradr/agentsolvr-releases/releases/download/v1.0.0/AgentSOLVR-1.0.0-Windows-x64.exe',
      installer: 'AgentSOLVR-1.0.0-Windows-x64.exe',
      checksum: 'Will be available after build',
      requirements: [
        'Windows 10 or later (64-bit)',
        '4GB RAM minimum (8GB recommended)',
        '2GB free disk space',
        'Internet connection required',
        '.NET Framework 4.8 or later'
      ]
    },
    {
      platform: 'macOS',
      version: '1.0.0',
      size: '~110 MB',
      icon: <Apple className="w-8 h-8" />,
      downloadUrl: 'https://github.com/agent-tradr/agentsolvr-releases/releases/download/v1.0.0/AgentSOLVR-1.0.0-macOS-universal.dmg',
      installer: 'AgentSOLVR-1.0.0-macOS-universal.dmg',
      checksum: 'Will be available after build',
      requirements: [
        'macOS 11.0 (Big Sur) or later',
        'Apple Silicon (M1/M2) or Intel processor',
        '4GB RAM minimum (8GB recommended)',
        '2GB free disk space',
        'Internet connection required'
      ]
    },
    {
      platform: 'Linux',
      version: '1.0.0',
      size: '~115 MB',
      icon: <Laptop className="w-8 h-8" />,
      downloadUrl: 'https://github.com/agent-tradr/agentsolvr-releases/releases/download/v1.0.0/AgentSOLVR-1.0.0-Linux-x64.AppImage',
      installer: 'AgentSOLVR-1.0.0-Linux-x64.AppImage',
      checksum: 'Will be available after build',
      requirements: [
        'Ubuntu 20.04+ or equivalent distribution',
        'GLIBC 2.31 or later',
        '4GB RAM minimum (8GB recommended)',
        '2GB free disk space',
        'Internet connection required'
      ]
    }
  ];

  const releaseNotes = [
    {
      version: '1.0.0',
      date: 'Coming Soon',
      type: 'Initial Release',
      changes: [
        'First public release of AgentSOLVR desktop application',
        'Voice-controlled development interface',
        'Multi-agent AI system for code generation',
        'Project analysis and intelligent recommendations',
        'Cross-platform support (Windows, macOS, Linux)'
      ]
    }
  ];

  const handleDownload = async (option: DownloadOption) => {
    if (!user?.subscription || user.subscription.status !== 'active') {
      navigate('/pricing');
      return;
    }

    setDownloadingPlatform(option.platform);
    
    try {
      // Open download link in new tab
      window.open(option.downloadUrl, '_blank');
      
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again or contact support.');
    } finally {
      setDownloadingPlatform(null);
    }
  };

  const DownloadCard: React.FC<{ option: DownloadOption }> = ({ option }) => (
    <Card className="hover:shadow-glow transition-all duration-300 hover:scale-105">
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          <div className="p-4 bg-gradient-to-r from-ctp-mauve to-ctp-blue rounded-2xl text-white mx-auto w-fit mb-4">
            {option.icon}
          </div>
          <h3 className="text-2xl font-bold mb-2">{option.platform}</h3>
          <p className="text-ctp-subtext1">Version {option.version} • {option.size}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="text-left">
            <h4 className="font-semibold mb-2 text-sm">System Requirements:</h4>
            <ul className="text-xs text-ctp-subtext1 space-y-1">
              {option.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-ctp-green mt-0.5 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button 
          onClick={() => handleDownload(option)}
          disabled={downloadingPlatform === option.platform}
          className="w-full btn-premium"
        >
          {downloadingPlatform === option.platform ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download for {option.platform}
            </>
          )}
        </Button>

        <div className="mt-4 text-xs text-ctp-subtext0">
          <p>File: {option.installer}</p>
          <p className="font-mono">{option.checksum}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-ctp-base">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="container-padding py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate('/pricing')}>
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container-padding section-spacing">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Download <span className="text-ctp-mauve">Agent</span>
              <span className="text-ctp-blue">SOLVR</span> Desktop
            </h1>
            <p className="text-xl text-ctp-subtext1 mb-8 max-w-2xl mx-auto">
              Start coding with voice commands in under 2 minutes. 
              Available for Windows, macOS, and Linux.
            </p>
            
            {!user?.subscription || user.subscription.status !== 'active' ? (
              <div className="bg-ctp-yellow/10 border border-ctp-yellow/30 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-ctp-yellow" />
                  <span className="font-semibold">Subscription Required</span>
                </div>
                <p className="text-ctp-subtext1 mb-4">
                  You need an active subscription to download AgentSOLVR V4.
                </p>
                <Button onClick={() => navigate('/pricing')}>
                  View Pricing Plans
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="bg-ctp-green/10 border border-ctp-green/30 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-ctp-green" />
                  <span className="font-semibold">Ready to Download</span>
                </div>
                <p className="text-ctp-subtext1">
                  Your {user.subscription.planType} subscription is active. Choose your platform below.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Download Options */}
      <section className="container-padding">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 animate-stagger">
            {downloadOptions.map((option) => (
              <DownloadCard key={option.platform} option={option} />
            ))}
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="container-padding section-spacing">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Installation Guide</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-gradient-to-r from-ctp-mauve to-ctp-blue rounded-lg text-white mx-auto w-fit mb-4">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">1. Download</h3>
                <p className="text-sm text-ctp-subtext1">
                  Choose your platform and download the installer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-gradient-to-r from-ctp-green to-ctp-teal rounded-lg text-white mx-auto w-fit mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">2. Install</h3>
                <p className="text-sm text-ctp-subtext1">
                  Run the installer and follow the setup wizard
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-gradient-to-r from-ctp-blue to-ctp-sky rounded-lg text-white mx-auto w-fit mb-4">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">3. Launch</h3>
                <p className="text-sm text-ctp-subtext1">
                  Sign in with your account and start developing
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-ctp-mauve/10 to-ctp-blue/10 border-ctp-mauve/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4 text-center">Need Help?</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Button 
                  variant="outline"
                  onClick={() => window.open('mailto:support@agentsolvr.com')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Get Installation Help
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('mailto:support@agentsolvr.com')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Release Notes */}
      <section className="container-padding section-spacing bg-ctp-mantle">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Release Notes</h2>
          
          <div className="space-y-8">
            {releaseNotes.map((release, index) => (
              <Card key={release.version}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      Version {release.version}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        release.type === 'Feature Release' 
                          ? 'bg-ctp-green/20 text-ctp-green' 
                          : 'bg-ctp-blue/20 text-ctp-blue'
                      }`}>
                        {release.type}
                      </span>
                    </CardTitle>
                    <span className="text-sm text-ctp-subtext1">{release.date}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {release.changes.map((change, changeIndex) => (
                      <li key={changeIndex} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-ctp-green mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{change}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="outline"
              onClick={() => window.open('https://github.com/agent-tradr/agentsolvr-releases/releases', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View All Releases
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Downloads;