'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubscriptionDetails {
  subscription_status: string;
  current_plan?: string;
}

interface SubscriptionGateProps {
  children: ReactNode;
  subscriptionDetails: SubscriptionDetails | null;
  isLoading?: boolean;
}

export function SubscriptionGate({ children, subscriptionDetails, isLoading }: SubscriptionGateProps) {
  const router = useRouter();

  // Show full content only for active subscribers
  // Lock dashboard for inactive or trial status
  if (subscriptionDetails?.subscription_status === 'active') {
    return <>{children}</>;
  }

  // Show limited view for non-subscribers
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Subscription Required Banner */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-amber-800">🚀 Unlock Full Billing Features</CardTitle>
                <CardDescription className="text-amber-700 text-lg">
                  Subscribe to access detailed billing analytics, payment history, and advanced features
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-800 text-sm px-3 py-1">
              Premium Feature
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center mb-3">
                <Crown className="w-5 h-5 text-amber-600 mr-2" />
                <h4 className="font-semibold text-amber-800">Detailed Analytics</h4>
              </div>
              <p className="text-sm text-amber-700">
                Access comprehensive usage statistics, cost breakdowns, and billing insights
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center mb-3">
                <Zap className="w-5 h-5 text-amber-600 mr-2" />
                <h4 className="font-semibold text-amber-800">Payment History</h4>
              </div>
              <p className="text-sm text-amber-700">
                View complete transaction history with downloadable invoices and receipts
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center mb-3">
                <Lock className="w-5 h-5 text-amber-600 mr-2" />
                <h4 className="font-semibold text-amber-800">Advanced Features</h4>
              </div>
              <p className="text-sm text-amber-700">
                Cost optimization tips, billing alerts, and premium support features
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/plans')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg flex-1 sm:flex-none"
            >
              <Crown className="w-4 h-4 mr-2" />
              View Subscription Plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="border-amber-300 text-amber-700 hover:bg-amber-50 flex-1 sm:flex-none"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Greyed out preview of features */}
      <div className="relative">
        <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] z-10 rounded-lg"></div>
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>

        {/* Overlay message */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg max-w-md mx-4">
            <div className="text-center">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Premium Feature</h3>
              <p className="text-gray-600 text-sm mb-4">
                Subscribe to unlock detailed billing analytics and advanced features
              </p>
              <Button
                onClick={() => router.push('/plans')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}