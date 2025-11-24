import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Calendar,
  Receipt,
  Settings,
  Download,
  BarChart3,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SubscriptionDetails } from '@/types/billing';
import { 
  formatDate,
  getDaysUntilExpiry,
  getUserProductCategory,
  normalizeBillingCycle,
  getPlanDisplayName
} from '@/lib/billing/utils';

interface ActiveSubscriptionProps {
  subscriptionDetails: SubscriptionDetails;
}

export function ActiveSubscription({ subscriptionDetails }: ActiveSubscriptionProps) {
  const router = useRouter();

  if (subscriptionDetails.subscription_status !== 'active') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-800">
                  🚀 {getUserProductCategory(subscriptionDetails)} Subscription
                </CardTitle>
                <CardDescription className="text-green-700 text-lg">
                  {getPlanDisplayName(subscriptionDetails.current_plan)}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1 mb-2">
                ✓ Active
              </Badge>
              <div className="text-sm text-green-600">Auto-renews</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/60 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Billing Cycle</span>
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-green-800 capitalize">
                {normalizeBillingCycle(subscriptionDetails.billing_cycle)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {normalizeBillingCycle(subscriptionDetails.billing_cycle) === 'yearly'
                  ? '💰 20% savings'
                  : '📅 Monthly renewal'}
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Next Billing</span>
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-green-800">
                {subscriptionDetails.subscription_end_date &&
                  formatDate(subscriptionDetails.subscription_end_date)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {subscriptionDetails.subscription_end_date &&
                  `${Math.max(0, getDaysUntilExpiry(subscriptionDetails.subscription_end_date))} days left`}
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Last Payment</span>
                <Receipt className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-green-800">
                {subscriptionDetails.last_payment_date
                  ? formatDate(subscriptionDetails.last_payment_date)
                  : 'N/A'}
              </div>
              <div className="text-xs text-green-600 mt-1">✅ Payment successful</div>
            </div>
          </div>

          {/* Plan Benefits */}
          <div className="bg-white/60 rounded-lg p-6 border border-green-200">
            <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Your Plan Includes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div key={index} className="flex items-center space-x-3">
                  {item.included ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                  )}
                  <span
                    className={`text-sm ${
                      item.included ? 'text-green-700' : 'text-gray-500'
                    }`}
                  >
                    {item.feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => router.push('/plans')}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 flex-1 min-w-0"
            >
              <Settings className="w-4 h-4 mr-2" />
              Change Plan
            </Button>
            <Button
              onClick={() => router.push('/dashboard/billing')}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 flex-1 min-w-0"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Usage
            </Button>
            <Button
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 flex-1 min-w-0"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}