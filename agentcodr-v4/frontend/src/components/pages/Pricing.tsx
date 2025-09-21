import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Zap, Shield, Users, Star, Crown, Rocket, CheckCircle } from 'lucide-react';
import { Button, Card, CardContent, Navigation, Footer } from '@/components/ui';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billing: string;
  description: string;
  features: string[];
  popular: boolean;
  cta: string;
  badge?: string;
  icon: React.ReactNode;
  savings?: string;
}

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const pricingPlans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 39,
      billing: 'month',
      description: 'Perfect for entrepreneurs and individual builders',
      icon: <Rocket className="w-6 h-6" />,
      features: [
        'AgentSOLVR Desktop App',
        'Voice commands to build any software idea',
        'Project analysis (up to 50 files)',
        'Email support',
        '1 user license',
        'GitHub integration',
        'Turn ideas into working software in minutes',
        'AI team that handles the technical complexity'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      billing: 'month',
      description: 'For growing businesses and development teams',
      icon: <Star className="w-6 h-6" />,
      badge: 'Most Popular',
      savings: 'Save $468/year',
      features: [
        'Everything in Starter',
        'Unlimited voice commands and AI interactions',
        'Unlimited project analysis and codebase understanding',
        'Priority support (24h response time)',
        'Up to 5 user licenses',
        'Advanced workflow automation and customization',
        'Ship features 100x faster with AI pair programming',
        'Advanced multi-agent coordination',
        'Custom workflow automation'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      billing: 'month',
      description: 'White-glove service for enterprises and complex projects',
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Everything in Professional',
        'Dedicated implementation specialist',
        'Custom setup and training for your team',
        'Unlimited user licenses',
        'On-premise deployment assistance',
        'Custom workflow integrations and automation',
        'SLA guarantees (99.9% uptime)',
        'Direct access to engineering team',
        'Custom AI model training',
        'White-label options'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const faqs = [
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time with no cancellation fees. Your access will continue until the end of your current billing period."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! We offer a 14-day free trial of the Professional plan so you can experience the full power of AgentSOLVR. No credit card required."
    },
    {
      question: "What programming languages are supported?",
      answer: "AgentSOLVR supports 50+ programming languages including JavaScript/TypeScript, Python, Java, C#, Go, Rust, PHP, and more."
    },
    {
      question: "How does the voice control work?",
      answer: "Simply speak your requirements in natural language. AgentSOLVR's AI understands development context and translates your voice commands into working code."
    }
  ];

  return (
    <div className="min-h-screen bg-ctp-base text-ctp-text">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-ctp-green/20 to-ctp-teal/20 border border-ctp-green/30 rounded-full">
              <CheckCircle className="w-4 h-4 text-ctp-green mr-2" />
              <span className="text-sm text-ctp-text">
                14-day free trial • No credit card required
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Simple Pricing for{' '}
              <span className="bg-gradient-to-r from-ctp-blue via-ctp-mauve to-ctp-pink bg-clip-text text-transparent">
                Powerful Development
              </span>
            </h1>
            
            <p className="text-xl text-ctp-subtext1 max-w-3xl mx-auto">
              Choose the perfect plan for turning your ideas into software. All plans include our voice-controlled AI development platform.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative p-8 ${
                  plan.popular 
                    ? 'ring-2 ring-ctp-blue bg-gradient-to-b from-ctp-surface0 to-ctp-base shadow-glow-blue' 
                    : 'bg-ctp-surface0'
                } hover:shadow-glow transition-all duration-300`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-ctp-blue to-ctp-mauve text-ctp-base px-4 py-1 rounded-full text-sm font-medium">
                      {plan.badge}
                    </div>
                  </div>
                )}

                <CardContent className="space-y-6">
                  {/* Plan Header */}
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-ctp-blue to-ctp-mauve text-ctp-base' 
                          : 'bg-ctp-surface1 text-ctp-text'
                      }`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-ctp-text">{plan.name}</h3>
                    </div>
                    
                    <div>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-ctp-text">${plan.price}</span>
                        <span className="text-ctp-subtext1">/{plan.billing}</span>
                      </div>
                      {plan.savings && (
                        <div className="text-sm text-ctp-green mt-1">{plan.savings}</div>
                      )}
                    </div>
                    
                    <p className="text-ctp-subtext1">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-ctp-green flex-shrink-0 mt-0.5" />
                        <span className="text-ctp-text text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => plan.id === 'enterprise' ? navigate('/contact') : navigate('/register')}
                    className={`w-full text-lg py-3 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-ctp-blue to-ctp-mauve hover:from-ctp-mauve hover:to-ctp-blue shadow-glow'
                        : 'bg-ctp-surface1 hover:bg-ctp-surface2 text-ctp-text'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-ctp-surface0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose AgentSOLVR?
            </h2>
            <p className="text-xl text-ctp-subtext1">
              The most advanced AI development platform with proven results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <CardContent>
                <div className="w-16 h-16 bg-gradient-to-r from-ctp-blue to-ctp-mauve rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-ctp-base" />
                </div>
                <h3 className="text-2xl font-bold mb-4">10x Faster Development</h3>
                <p className="text-ctp-subtext1">
                  What took hours now takes minutes. Voice commands that understand your development context and execute complex tasks automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 text-center">
              <CardContent>
                <div className="w-16 h-16 bg-gradient-to-r from-ctp-green to-ctp-teal rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-ctp-base" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Enterprise Security</h3>
                <p className="text-ctp-subtext1">
                  Built-in security scanning, audit logs, and compliance features. Your code stays secure with enterprise-grade encryption.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 text-center">
              <CardContent>
                <div className="w-16 h-16 bg-gradient-to-r from-ctp-mauve to-ctp-pink rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-ctp-base" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Team Collaboration</h3>
                <p className="text-ctp-subtext1">
                  Perfect for teams of any size. Share voice commands, coordinate AI agents, and ship features together faster than ever.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-ctp-subtext1">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <CardContent>
                  <h3 className="text-lg font-semibold text-ctp-text mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-ctp-subtext1">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-ctp-subtext1 mb-4">
              Still have questions?
            </p>
            <Button 
              variant="outline"
              onClick={() => navigate('/contact')}
              className="border-ctp-blue text-ctp-blue hover:bg-ctp-blue hover:text-ctp-base"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-ctp-surface0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Code 10x Faster?
            </h2>
            <p className="text-xl text-ctp-subtext1">
              Start your free trial today. No credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/register')}
                className="text-lg px-8 py-4 bg-gradient-to-r from-ctp-blue to-ctp-mauve hover:from-ctp-mauve hover:to-ctp-blue shadow-glow"
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/downloads')}
                className="text-lg px-8 py-4 border-ctp-surface2 text-ctp-text hover:bg-ctp-surface1"
              >
                Download App
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;