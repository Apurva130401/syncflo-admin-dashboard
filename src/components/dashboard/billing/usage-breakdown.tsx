import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Star, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SubscriptionDetails } from '@/types/billing';

interface UsageBreakdownProps {
  subscriptionDetails: SubscriptionDetails;
}

export function UsageBreakdown({ subscriptionDetails }: UsageBreakdownProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-indigo-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-indigo-700">
              <BarChart3 className="w-5 h-5 mr-2" />
              Usage Breakdown
            </CardTitle>
            <CardDescription className="text-indigo-600">
              Your feature usage for this billing cycle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  WhatsApp Messages
                </span>
                <span className="text-sm text-gray-600">2,847 / 5,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                  style={{ width: '57%' }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  AI Conversations
                </span>
                <span className="text-sm text-gray-600">156 / 500</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  style={{ width: '31%' }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Voice Minutes
                </span>
                <span className="text-sm text-gray-600">45 / 200</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: '23%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Star className="w-5 h-5 mr-2" />
              Plan Benefits
            </CardTitle>
            <CardDescription className="text-green-600">
              Features included in your current plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { feature: 'WhatsApp Business API', included: true },
                { feature: 'AI-Powered Responses', included: true },
                { feature: '24/7 Customer Support', included: true },
                { feature: 'Advanced Analytics', included: true },
                {
                  feature: 'Custom Branding',
                  included: subscriptionDetails.current_plan?.includes('enterprise'),
                },
                {
                  feature: 'White-label Solution',
                  included: subscriptionDetails.current_plan?.includes('enterprise'),
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span
                    className={`text-sm ${
                      item.included ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {item.feature}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full ${
                      item.included
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'border border-gray-300'
                    }`}
                  ></div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-green-200">
              <Button
                onClick={() => router.push('/plans')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Gift className="w-4 h-4 mr-2" />
                Upgrade for More Features
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}