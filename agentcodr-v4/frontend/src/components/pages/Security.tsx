import React from 'react';
import { Shield, Lock, Eye, Server, Key, CheckCircle } from 'lucide-react';
import { Navigation, Footer, Card, CardContent } from '@/components/ui';

const Security: React.FC = () => {
  const securityFeatures = [
    {
      icon: <Lock className="w-8 h-8" />,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption."
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Zero-Knowledge Architecture",
      description: "Your code and voice commands are processed locally. We never see your proprietary code."
    },
    {
      icon: <Server className="w-8 h-8" />,
      title: "Secure Infrastructure",
      description: "Hosted on enterprise-grade cloud infrastructure with 99.9% uptime SLA and automatic backups."
    },
    {
      icon: <Key className="w-8 h-8" />,
      title: "Multi-Factor Authentication",
      description: "Optional 2FA and SSO integration to keep your account secure from unauthorized access."
    }
  ];

  const certifications = [
    "SOC 2 Type II Compliant",
    "GDPR Compliant",
    "ISO 27001 Certified",
    "CCPA Compliant"
  ];

  return (
    <div className="min-h-screen bg-ctp-base text-ctp-text flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-ctp-blue to-ctp-mauve rounded-2xl">
                <Shield className="w-12 h-12 text-ctp-base" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-ctp-blue via-ctp-mauve to-ctp-pink bg-clip-text text-transparent mb-4">
              Security & Trust
            </h1>
            <p className="text-xl text-ctp-subtext1 max-w-3xl mx-auto">
              Your code, data, and privacy are our top priority. AgentSOLVR is built with enterprise-grade security from the ground up.
            </p>
          </div>

          {/* Security Features */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">How We Protect Your Work</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="p-6 bg-ctp-surface0 border-ctp-surface1">
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-r from-ctp-blue to-ctp-mauve rounded-lg text-ctp-base">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-ctp-subtext1 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Data Processing */}
          <section className="bg-ctp-surface0 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Local Processing First</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Your Code Stays Private</h3>
                <p className="text-ctp-subtext1 leading-relaxed">
                  AgentSOLVR processes your voice commands and analyzes your code locally on your machine. 
                  Your proprietary code, business logic, and sensitive data never leave your environment.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-ctp-green" />
                    <span className="text-ctp-text">Voice processing happens on-device</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-ctp-green" />
                    <span className="text-ctp-text">Code analysis runs locally</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-ctp-green" />
                    <span className="text-ctp-text">No proprietary code sent to cloud</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-ctp-green" />
                    <span className="text-ctp-text">Full offline capability available</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-ctp-blue/20 to-ctp-mauve/20 rounded-2xl p-8 border border-ctp-blue/30">
                  <div className="space-y-4">
                    <div className="text-4xl">🖥️</div>
                    <h4 className="text-lg font-semibold">Local First</h4>
                    <p className="text-sm text-ctp-subtext1">
                      Your sensitive code and business logic stays on your machine
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Compliance */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">Compliance & Certifications</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {certifications.map((cert, index) => (
                <Card key={index} className="p-4 bg-ctp-surface0 border-ctp-surface1 text-center">
                  <CardContent>
                    <CheckCircle className="w-8 h-8 text-ctp-green mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">{cert}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Security Practices */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Security Practices</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="text-4xl">🔒</div>
                <h3 className="text-lg font-semibold">Regular Audits</h3>
                <p className="text-ctp-subtext1 text-sm">
                  Third-party security audits and penetration testing conducted quarterly
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="text-4xl">🛡️</div>
                <h3 className="text-lg font-semibold">Incident Response</h3>
                <p className="text-ctp-subtext1 text-sm">
                  24/7 security monitoring with rapid incident response procedures
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="text-4xl">📋</div>
                <h3 className="text-lg font-semibold">Transparency</h3>
                <p className="text-ctp-subtext1 text-sm">
                  Regular security reports and transparent communication about any issues
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="text-center bg-ctp-surface0 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Security Questions?</h2>
            <p className="text-ctp-subtext1 mb-6">
              Our security team is here to answer any questions about how we protect your data.
            </p>
            <a 
              href="mailto:security@agentsolvr.com" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-ctp-blue to-ctp-mauve rounded-lg text-ctp-base font-medium hover:opacity-90 transition-opacity"
            >
              Contact Security Team
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Security;