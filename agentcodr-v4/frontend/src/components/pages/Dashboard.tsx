import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Settings, 
  HelpCircle, 
  CreditCard, 
  User, 
  Zap,
  BarChart3,
  Mic,
  Calendar,
  Activity,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Logo } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionData {
  planType: string;
  price: number;
  status: string;
  nextBilling: string;
  usage: {
    voiceCommands: number;
    projectsAnalyzed: number;
    aiResponses: number;
  };
}

interface ActivityItem {
  time: string;
  action: string;
  type: 'download' | 'analysis' | 'voice' | 'upgrade';
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // const { user } = useAuth(); // Uncomment when auth hook is available
  
  // Mock data - replace with real API calls
  const user = {
    fullName: 'Alex Developer',
    email: 'alex@example.com',
    avatar: '/api/placeholder/40/40'
  };

  const subscription: SubscriptionData = {
    planType: 'Professional',
    price: 99,
    status: 'active',
    nextBilling: 'March 15, 2024',
    usage: {
      voiceCommands: 147,
      projectsAnalyzed: 23,
      aiResponses: 892
    }
  };

  const recentActivity: ActivityItem[] = [
    { time: '2 hours ago', action: 'Downloaded AgentSOLVR V4.2.1', type: 'download' },
    { time: '1 day ago', action: 'Analyzed React project (45 files)', type: 'analysis' },
    { time: '3 days ago', action: 'Voice command: "Add authentication"', type: 'voice' },
    { time: '1 week ago', action: 'Upgraded to Professional plan', type: 'upgrade' },
    { time: '2 weeks ago', action: 'Voice command: "Fix TypeScript errors"', type: 'voice' }
  ];

  const StatCard: React.FC<{ title: string; value: string; limit: string; icon: React.ReactNode }> = ({ 
    title, value, limit, icon 
  }) => (
    <Card className="hover:shadow-glow transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-ctp-mauve to-ctp-blue rounded-lg text-white">
            {icon}
          </div>
          <div>
            <p className="text-sm text-ctp-subtext1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-ctp-subtext0">Limit: {limit}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActivityItemComponent: React.FC<{ item: ActivityItem }> = ({ item }) => {
    const getIcon = () => {
      switch (item.type) {
        case 'download': return <Download className="w-4 h-4 text-ctp-blue" />;
        case 'analysis': return <BarChart3 className="w-4 h-4 text-ctp-green" />;
        case 'voice': return <Mic className="w-4 h-4 text-ctp-mauve" />;
        case 'upgrade': return <ArrowUpRight className="w-4 h-4 text-ctp-yellow" />;
        default: return <Activity className="w-4 h-4 text-ctp-subtext1" />;
      }
    };

    return (
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-ctp-surface0 transition-colors">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm">{item.action}</p>
          <p className="text-xs text-ctp-subtext1">{item.time}</p>
        </div>
      </div>
    );
  };

  const DashboardNav: React.FC = () => (
    <header className="glass-effect sticky top-0 z-50">
      <div className="container-padding py-4">
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={user.avatar} 
                alt={user.fullName}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium">{user.fullName}</span>
            </div>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-ctp-base">
      <DashboardNav />

      <div className="container-padding py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user.fullName.split(' ')[0]}! Ready to build something amazing? 🚀
            </h1>
            <p className="text-ctp-subtext1 text-lg">
              Your AgentSOLVR dashboard - manage your subscription, download the desktop app, and track your development velocity
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Subscription Status */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Subscription Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-ctp-mauve/10 to-ctp-blue/10 rounded-lg border border-ctp-mauve/20">
                    <div>
                      <h3 className="text-xl font-semibold">{subscription.planType} Plan</h3>
                      <p className="text-ctp-subtext1 mb-2">
                        ${subscription.price}/month • Next billing: {subscription.nextBilling}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-ctp-green rounded-full"></div>
                        <span className="text-sm text-ctp-green font-medium">Active</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Billing
                      </Button>
                      <Button size="sm" onClick={() => navigate('/pricing')}>
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Your Development Velocity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <StatCard 
                      title="Voice Commands" 
                      value={subscription.usage.voiceCommands.toString()} 
                      limit="Unlimited"
                      icon={<Mic className="w-5 h-5" />}
                    />
                    <StatCard 
                      title="Projects Analyzed" 
                      value={subscription.usage.projectsAnalyzed.toString()} 
                      limit="Unlimited"
                      icon={<BarChart3 className="w-5 h-5" />}
                    />
                    <StatCard 
                      title="AI Responses" 
                      value={subscription.usage.aiResponses.toString()} 
                      limit="Unlimited"
                      icon={<Zap className="w-5 h-5" />}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentActivity.map((item, index) => (
                      <ActivityItemComponent key={index} item={item} />
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Button variant="outline">
                      View All Activity
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/downloads')}
                      className="w-full justify-start btn-premium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Get the Desktop App
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://docs.agentsolvr.com', '_blank')}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Voice Commands Guide
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://community.agentsolvr.com', '_blank')}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Join Community
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-ctp-subtext1">Full Name</label>
                      <p className="font-medium">{user.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-ctp-subtext1">Email</label>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-ctp-subtext1">Plan</label>
                      <p className="font-medium">{subscription.planType}</p>
                    </div>
                    <div>
                      <label className="text-sm text-ctp-subtext1">Member Since</label>
                      <p className="font-medium">January 2024</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Features */}
              <Card className="animate-fade-in bg-gradient-to-br from-ctp-mauve/10 to-ctp-blue/10 border-ctp-mauve/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Coming Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-ctp-mauve rounded-full"></div>
                      <span>Real-time collaboration features</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-ctp-blue rounded-full"></div>
                      <span>Advanced project templates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-ctp-green rounded-full"></div>
                      <span>Mobile companion app</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;