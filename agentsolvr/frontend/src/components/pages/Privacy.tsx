import React from 'react';
import { Navigation, Footer } from '@/components/ui';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-ctp-base text-ctp-text flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-ctp-blue via-ctp-mauve to-ctp-pink bg-clip-text text-transparent mb-4">
              Privacy Policy
            </h1>
            <p className="text-ctp-subtext1">
              Last updated: January 2025
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-ctp-text mb-4">Overview</h2>
              <p className="text-ctp-subtext1 leading-relaxed">
                At AgentSOLVR, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, and protect your information when you use our voice-controlled AI development platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ctp-text mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-ctp-text mb-2">Account Information</h3>
                  <p className="text-ctp-subtext1">
                    When you create an account, we collect your name, email address, and billing information.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-ctp-text mb-2">Voice Data</h3>
                  <p className="text-ctp-subtext1">
                    Voice commands are processed locally on your device. We do not store or transmit voice recordings to our servers.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-ctp-text mb-2">Usage Data</h3>
                  <p className="text-ctp-subtext1">
                    We collect analytics about how you use AgentSOLVR to improve our service, including feature usage and performance metrics.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ctp-text mb-4">How We Use Your Information</h2>
              <ul className="space-y-2 text-ctp-subtext1">
                <li>• To provide and improve our AI development platform</li>
                <li>• To process payments and manage your subscription</li>
                <li>• To provide customer support</li>
                <li>• To send important updates about our service</li>
                <li>• To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ctp-text mb-4">Data Security</h2>
              <p className="text-ctp-subtext1 leading-relaxed">
                We implement industry-standard security measures to protect your data, including encryption in transit and at rest, 
                regular security audits, and strict access controls. Your code and projects remain private and secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ctp-text mb-4">Third-Party Services</h2>
              <p className="text-ctp-subtext1 leading-relaxed">
                We use trusted third-party services for payment processing (Stripe), analytics (anonymized), and infrastructure. 
                These services are bound by strict privacy agreements and cannot access your development projects or voice data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ctp-text mb-4">Your Rights</h2>
              <p className="text-ctp-subtext1 leading-relaxed">
                You have the right to access, update, or delete your personal information. You can export your data or 
                close your account at any time. Contact us at <a href="mailto:privacy@agentsolvr.com" className="text-ctp-blue hover:underline">privacy@agentsolvr.com</a> for any privacy-related requests.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ctp-text mb-4">Contact Us</h2>
              <p className="text-ctp-subtext1 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@agentsolvr.com" className="text-ctp-blue hover:underline">
                  privacy@agentsolvr.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;