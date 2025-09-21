import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Navigation, Footer } from '@/components/ui';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Send email using our SMTP2GO backend service
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        setSubmitMessage('Email sent successfully! We\'ll get back to you within 24 hours.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsSubmitted(true);
      setSubmitMessage('There was an issue sending your message. Please email us directly at info@agenttradr.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ctp-base text-ctp-text flex flex-col">
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-ctp-blue via-ctp-mauve to-ctp-pink bg-clip-text text-transparent mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-ctp-subtext1 max-w-2xl mx-auto">
            Have questions about AgentSOLVR? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-ctp-surface0 border-ctp-surface1">
              <CardHeader>
                <CardTitle className="text-ctp-text">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-ctp-blue to-ctp-mauve rounded-full flex items-center justify-center">
                    <span className="text-ctp-base text-sm">📧</span>
                  </div>
                  <div>
                    <p className="text-ctp-text font-medium">Email</p>
                    <p className="text-ctp-subtext1">support@agentsolvr.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-ctp-green to-ctp-teal rounded-full flex items-center justify-center">
                    <span className="text-ctp-base text-sm">💬</span>
                  </div>
                  <div>
                    <p className="text-ctp-text font-medium">Support</p>
                    <p className="text-ctp-subtext1">24/7 priority support for Professional+ plans</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-ctp-yellow to-ctp-peach rounded-full flex items-center justify-center">
                    <span className="text-ctp-base text-sm">⚡</span>
                  </div>
                  <div>
                    <p className="text-ctp-text font-medium">Response Time</p>
                    <p className="text-ctp-subtext1">Within 24 hours (24h for priority support)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card className="bg-gradient-to-br from-ctp-surface0 to-ctp-surface1 border-ctp-surface2">
              <CardContent className="p-6">
                <h3 className="text-ctp-text font-semibold mb-2">Quick Answers</h3>
                <p className="text-ctp-subtext1 mb-4">
                  Check out our FAQ for instant answers to common questions about AgentSOLVR.
                </p>
                <Button variant="outline" size="sm" className="border-ctp-blue text-ctp-blue hover:bg-ctp-blue hover:text-ctp-base">
                  <a href="/faq">View FAQ</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-ctp-surface0 border-ctp-surface1">
            <CardHeader>
              <CardTitle className="text-ctp-text">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-ctp-green to-ctp-teal rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-ctp-base text-2xl">✓</span>
                  </div>
                  <h3 className="text-ctp-text font-semibold mb-2">
                    {submitMessage.includes('successfully') ? 'Message Sent!' : 'Message Received!'}
                  </h3>
                  <p className="text-ctp-subtext1">
                    {submitMessage}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-ctp-surface1 border-ctp-surface2 text-ctp-text"
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-ctp-surface1 border-ctp-surface2 text-ctp-text"
                    />
                  </div>
                  
                  <Input
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="bg-ctp-surface1 border-ctp-surface2 text-ctp-text"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-ctp-text mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-ctp-surface1 border border-ctp-surface2 rounded-md text-ctp-text placeholder-ctp-subtext0 focus:outline-none focus:ring-2 focus:ring-ctp-blue focus:border-transparent resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-ctp-blue to-ctp-mauve hover:from-ctp-mauve hover:to-ctp-blue"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;