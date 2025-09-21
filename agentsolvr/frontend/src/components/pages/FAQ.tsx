import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Navigation, Footer } from '@/components/ui';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'pricing' | 'support';
}

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqData: FAQItem[] = [
    // General Questions
    {
      category: 'general',
      question: 'What is AgentSOLVR?',
      answer: 'AgentSOLVR is a multi-agent AI platform that revolutionizes software development through voice-controlled commands and intelligent automation. It helps developers ship features 100x faster by providing AI pair programming, project analysis, and automated development workflows.'
    },
    {
      category: 'general',
      question: 'How does AgentSOLVR work?',
      answer: 'AgentSOLVR uses multiple specialized AI agents working together to understand your codebase, execute voice commands, and perform complex development tasks. Simply speak your requirements, and our agents analyze your project, write code, run tests, and deploy features automatically.'
    },
    {
      category: 'general',
      question: 'Who should use AgentSOLVR?',
      answer: 'AgentSOLVR is perfect for individual developers, startup teams, and enterprise development organizations who want to accelerate their development process. Whether you\'re building side projects or shipping production features, AgentSOLVR adapts to your workflow.'
    },
    {
      category: 'general',
      question: 'What programming languages are supported?',
      answer: 'AgentSOLVR supports all major programming languages including JavaScript/TypeScript, Python, Java, C#, Go, Rust, PHP, and more. Our agents are continuously learning new languages and frameworks based on community needs.'
    },

    // Technical Questions
    {
      category: 'technical',
      question: 'How do I install the AgentSOLVR desktop app?',
      answer: 'Download the desktop app from our Downloads page. The app is available for Windows, macOS, and Linux. Simply run the installer and follow the setup wizard. The app will automatically integrate with your development environment.'
    },
    {
      category: 'technical',
      question: 'Can AgentSOLVR work with my existing development tools?',
      answer: 'Yes! AgentSOLVR works with your existing development environment and tools. It integrates with version control systems (Git), CI/CD pipelines, and development frameworks. The desktop application provides a powerful interface for voice-controlled development without requiring changes to your existing workflow.'
    },
    {
      category: 'technical',
      question: 'Is my code secure with AgentSOLVR?',
      answer: 'Absolutely. Your code never leaves your local environment. AgentSOLVR processes everything locally on your machine, ensuring complete privacy and security. We use enterprise-grade encryption for any necessary cloud communications.'
    },
    {
      category: 'technical',
      question: 'What system requirements does AgentSOLVR have?',
      answer: 'AgentSOLVR requires: 8GB RAM (16GB recommended), 2GB free disk space, and a modern processor (Intel i5/AMD Ryzen 5 or better). Internet connection is required for initial setup and updates.'
    },

    // Pricing Questions
    {
      category: 'pricing',
      question: 'What\'s included in the Starter plan ($39/month)?',
      answer: 'The Starter plan includes the AgentSOLVR desktop app, voice commands for common development tasks, project analysis up to 50 files, email support, 1 user license, GitHub integration, and the ability to save 20+ hours per week on repetitive coding.'
    },
    {
      category: 'pricing',
      question: 'Why should I choose Professional ($99/month)?',
      answer: 'Professional is our most popular plan, offering unlimited voice commands and AI interactions, unlimited project analysis, priority support (24h response), up to 5 user licenses, advanced integrations, and the ability to ship features 100x faster with AI pair programming.'
    },
    {
      category: 'pricing',
      question: 'What makes Enterprise ($299/month) worth it?',
      answer: 'Enterprise includes everything in Professional plus: dedicated implementation specialist, custom setup and training, unlimited user licenses, on-premise deployment assistance, custom integrations, SLA guarantees (99.9% uptime), and direct access to our engineering team.'
    },
    {
      category: 'pricing',
      question: 'Is there a free trial available?',
      answer: 'Yes! We offer a 14-day free trial of the Professional plan so you can experience the full power of AgentSOLVR. No credit card required to start your trial.'
    },
    {
      category: 'pricing',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Absolutely. You can cancel your subscription at any time with no cancellation fees. Your access will continue until the end of your current billing period.'
    },

    // Support Questions
    {
      category: 'support',
      question: 'How do I get support?',
      answer: 'Starter plan users receive email support with responses within 48 hours. Professional and Enterprise users get priority support with 24-hour response times. Enterprise users also have direct access to our engineering team.'
    },
    {
      category: 'support',
      question: 'Do you offer training and onboarding?',
      answer: 'Yes! Professional users get comprehensive documentation and video tutorials. Enterprise users receive personalized onboarding with a dedicated implementation specialist and custom training for their team.'
    },
    {
      category: 'support',
      question: 'How often do you release updates?',
      answer: 'We release updates regularly with new features, performance improvements, and bug fixes. The desktop app updates automatically, and we notify users of major feature releases via email.'
    },
    {
      category: 'support',
      question: 'Can I request custom features?',
      answer: 'Enterprise users can request custom integrations and features, which we prioritize based on business needs. Professional users can submit feature requests through our feedback system.'
    }
  ];

  const categories = [
    { id: 'general', name: 'General', icon: '🤖' },
    { id: 'technical', name: 'Technical', icon: '⚙️' },
    { id: 'pricing', name: 'Pricing', icon: '💰' },
    { id: 'support', name: 'Support', icon: '🛟' }
  ];

  const filteredFAQs = faqData.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-ctp-base text-ctp-text flex flex-col">
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-ctp-blue via-ctp-mauve to-ctp-pink bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-ctp-subtext1 max-w-3xl mx-auto">
            Find answers to common questions about AgentSOLVR. Can't find what you're looking for? 
            <a href="/contact" className="text-ctp-blue hover:text-ctp-mauve transition-colors ml-1">Contact us</a>.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-ctp-surface0 p-1 rounded-lg">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-ctp-blue to-ctp-mauve text-ctp-base font-medium'
                    : 'text-ctp-subtext1 hover:text-ctp-text hover:bg-ctp-surface1'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <Card key={index} className="bg-ctp-surface0 border-ctp-surface1 overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left focus:outline-none focus:ring-2 focus:ring-ctp-blue focus:ring-inset"
              >
                <CardHeader className="hover:bg-ctp-surface1 transition-colors">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-ctp-text pr-4">{faq.question}</CardTitle>
                    <div className={`text-ctp-mauve transition-transform ${
                      openItems.has(index) ? 'rotate-180' : ''
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </CardHeader>
              </button>
              
              {openItems.has(index) && (
                <CardContent className="bg-ctp-surface0/50 border-t border-ctp-surface1">
                  <p className="text-ctp-subtext1 leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-br from-ctp-surface0 to-ctp-surface1 border-ctp-surface2 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-ctp-text mb-4">
                Still have questions?
              </h3>
              <p className="text-ctp-subtext1 mb-6">
                Can't find the answer you're looking for? Our support team is here to help you get started with AgentSOLVR.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-gradient-to-r from-ctp-blue to-ctp-mauve hover:from-ctp-mauve hover:to-ctp-blue"
                >
                  <a href="/contact">Contact Support</a>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-ctp-blue text-ctp-blue hover:bg-ctp-blue hover:text-ctp-base"
                >
                  <a href="/downloads">Try AgentSOLVR Free</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;