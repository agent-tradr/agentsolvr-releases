import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Bot, BarChart, Zap, Users, Shield, ArrowRight, Play, CheckCircle, Star, Code, Timer, Download } from 'lucide-react';
import { Button, Card, CardContent, Navigation, Footer } from '@/components/ui';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Voice-First Creation",
      description: "Just speak your app idea and watch AgentSOLVR build it. No coding knowledge needed - perfect for entrepreneurs and developers alike",
      highlight: "Anyone can build"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Team That Never Sleeps",
      description: "9 specialized AI agents handle everything from design to deployment, working together like a full development team",
      highlight: "Your AI workforce"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Understands Any Project",
      description: "Whether it's a simple website or complex enterprise software, AgentSOLVR analyzes and enhances any existing project",
      highlight: "Works with everything"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Launch-Ready Software",
      description: "Every app comes with professional testing, security, and deployment - ready for real customers from day one",
      highlight: "Professional quality"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Developer at TechCorp",
      avatar: "👩‍💻",
      quote: "AgentSOLVR cut our feature development time from weeks to days. The voice commands actually understand context - it's like having a senior developer on call 24/7.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO at StartupLab",
      avatar: "👨‍💼",
      quote: "We shipped our MVP 3x faster with AgentSOLVR. The multi-agent system handles everything from API design to deployment. Game changer for small teams.",
      rating: 5
    },
    {
      name: "Jessica Park",
      role: "Non-Technical Startup Founder",
      avatar: "🚀",
      quote: "I had a great business idea but no technical skills. AgentSOLVR helped me build and launch my SaaS platform in 3 weeks. Now I have paying customers!",
      rating: 5
    }
  ];

  const stats = [
    { number: "100x", label: "Faster Development" },
    { number: "50+", label: "Languages Supported" },
    { number: "99.9%", label: "Uptime SLA" },
    { number: "24/7", label: "Priority Support" }
  ];

  return (
    <div className="min-h-screen bg-ctp-base text-ctp-text">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-ctp-surface0 via-ctp-base to-ctp-mantle"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Announcement bar */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-ctp-blue/20 to-ctp-mauve/20 border border-ctp-blue/30 rounded-full">
              <Star className="w-4 h-4 text-ctp-yellow mr-2" />
              <span className="text-sm text-ctp-text">
                Join 10,000+ builders turning ideas into reality
              </span>
            </div>

            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Turn Any Idea Into{' '}
                <span className="bg-gradient-to-r from-ctp-blue via-ctp-mauve to-ctp-pink bg-clip-text text-transparent">
                  Working Software
                </span>
                <br />
                Just Speak It
              </h1>
              <p className="text-xl md:text-2xl text-ctp-subtext1 max-w-4xl mx-auto leading-relaxed">
                Whether you're an entrepreneur with a vision or a developer shipping features, AgentSOLVR transforms your voice commands into production-ready software. No coding experience required.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => navigate('/register')}
                className="text-lg px-8 py-4 bg-gradient-to-r from-ctp-blue to-ctp-mauve hover:from-ctp-mauve hover:to-ctp-blue shadow-glow"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Free Trial - Build in 2 Minutes
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/downloads')}
                className="text-lg px-8 py-4 border-ctp-surface2 text-ctp-text hover:bg-ctp-surface1"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Desktop App
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-ctp-subtext1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-ctp-green" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-ctp-green" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-ctp-green" />
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="mt-16 relative">
            <Card className="bg-ctp-surface0/50 backdrop-blur-sm border-ctp-surface1 p-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ctp-text">AgentSOLVR Dashboard - Interface Preview</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-ctp-green rounded-full animate-pulse"></div>
                    <span className="text-sm text-ctp-green">9 Agents Active</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Backend Agent', 'Frontend Agent', 'Testing Agent'].map((agent, index) => (
                    <div key={agent} className="p-4 bg-ctp-surface1 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-ctp-blue" />
                        <span className="text-sm font-medium text-ctp-text">{agent}</span>
                      </div>
                      <div className="text-xs text-ctp-subtext1">
                        Performance: {95 + index}%
                      </div>
                      <div className="w-full bg-ctp-surface2 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-ctp-blue to-ctp-green h-2 rounded-full"
                          style={{ width: `${95 + index}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-gradient-to-r from-ctp-mauve/20 to-ctp-blue/20 rounded-lg border border-ctp-mauve/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-4 h-4 text-ctp-mauve animate-pulse" />
                    <span className="text-sm font-medium text-ctp-text">Voice Command Processing...</span>
                  </div>
                  <p className="text-sm text-ctp-subtext1">
                    "Add user authentication with OAuth, create the database schema, and deploy to staging"
                  </p>
                  <div className="mt-2 text-xs text-ctp-green">
                    ✓ Generating authentication module... ✓ Creating database migrations... ✓ Setting up OAuth...
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-ctp-surface0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-ctp-blue mb-2">
                  {stat.number}
                </div>
                <div className="text-ctp-subtext1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The Future of Development is Here
            </h2>
            <p className="text-xl text-ctp-subtext1 max-w-3xl mx-auto">
              AgentSOLVR combines cutting-edge AI with intuitive voice controls to create 
              the most advanced development platform ever built.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="p-8 hover:shadow-glow-blue transition-all duration-300 group">
                <CardContent>
                  <div className="flex items-start gap-6">
                    <div className="p-3 bg-gradient-to-r from-ctp-blue to-ctp-mauve rounded-lg text-ctp-base group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                        <span className="text-sm bg-gradient-to-r from-ctp-green to-ctp-teal bg-clip-text text-transparent font-medium">
                          {feature.highlight}
                        </span>
                      </div>
                      <p className="text-ctp-subtext1 text-lg leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-ctp-surface0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Builders Everywhere
            </h2>
            <p className="text-xl text-ctp-subtext1">
              From entrepreneurs to developers, everyone's creating amazing software
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-ctp-base border-ctp-surface1">
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-ctp-yellow text-ctp-yellow" />
                      ))}
                    </div>
                    <p className="text-ctp-text italic leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{testimonial.avatar}</div>
                      <div>
                        <div className="font-semibold text-ctp-text">{testimonial.name}</div>
                        <div className="text-sm text-ctp-subtext1">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Perfect for Any Builder
            </h2>
            <p className="text-xl text-ctp-subtext1 max-w-3xl mx-auto">
              Whether you're launching a startup or shipping enterprise features, AgentSOLVR adapts to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Entrepreneur Use Cases */}
            <Card className="p-8 bg-gradient-to-br from-ctp-surface0 to-ctp-base border-ctp-surface1">
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-ctp-green to-ctp-teal rounded-lg">
                      <Users className="w-8 h-8 text-ctp-base" />
                    </div>
                    <h3 className="text-2xl font-bold">For Entrepreneurs</h3>
                  </div>
                  <p className="text-ctp-subtext1">
                    Turn your business idea into reality without hiring a technical team
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-ctp-green mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-ctp-text">Launch Your SaaS</h4>
                        <p className="text-sm text-ctp-subtext1">"Build me a project management tool with user accounts and billing"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-ctp-green mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-ctp-text">Create E-commerce</h4>
                        <p className="text-sm text-ctp-subtext1">"I need an online store with inventory management and payments"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-ctp-green mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-ctp-text">Build Mobile Apps</h4>
                        <p className="text-sm text-ctp-subtext1">"Design a fitness tracking app with social features"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Developer Use Cases */}
            <Card className="p-8 bg-gradient-to-br from-ctp-surface0 to-ctp-base border-ctp-surface1">
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-ctp-blue to-ctp-mauve rounded-lg">
                      <Code className="w-8 h-8 text-ctp-base" />
                    </div>
                    <h3 className="text-2xl font-bold">For Developers</h3>
                  </div>
                  <p className="text-ctp-subtext1">
                    Ship features at unprecedented speed with AI-powered development
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-ctp-green mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-ctp-text">Rapid Prototyping</h4>
                        <p className="text-sm text-ctp-subtext1">"Add real-time chat to this React app with WebSocket support"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-ctp-green mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-ctp-text">API Development</h4>
                        <p className="text-sm text-ctp-subtext1">"Create a REST API with authentication and rate limiting"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-ctp-green mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-ctp-text">Code Refactoring</h4>
                        <p className="text-sm text-ctp-subtext1">"Optimize this database query and add proper error handling"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Build Your Dream Software?
            </h2>
            <p className="text-xl text-ctp-subtext1">
              Join thousands of entrepreneurs and developers who are already turning ideas into reality.
              Start your free trial today - no credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/register')}
                className="text-lg px-8 py-4 bg-gradient-to-r from-ctp-blue to-ctp-mauve hover:from-ctp-mauve hover:to-ctp-blue shadow-glow"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/pricing')}
                className="text-lg px-8 py-4 border-ctp-surface2 text-ctp-text hover:bg-ctp-surface1"
              >
                View Pricing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-ctp-subtext1">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Setup in 2 minutes
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Enterprise security
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                10,000+ developers
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;