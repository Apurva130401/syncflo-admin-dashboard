import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { SubscriptionDetails } from '@/types/billing';
import {
  normalizeBillingCycle,
  getBillingCycleDisplay,
  getPlanDisplayName,
} from '@/lib/billing/utils';

interface SubscriptionOverviewProps {
  subscriptionDetails: SubscriptionDetails | null;
}

export function SubscriptionOverview({ subscriptionDetails }: SubscriptionOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {subscriptionDetails?.subscription_status || 'Inactive'}
              </Badge>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-blue-900 mb-2">
              Subscription Status
            </h3>
            <p className="text-blue-700 text-xs md:text-sm leading-relaxed break-words">
              {subscriptionDetails?.subscription_status === 'active' ? 'Your subscription is active and running smoothly' :
              subscriptionDetails?.subscription_status === 'trial' ? 'Enjoying your free trial period' :
              'No active subscription found'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-800">
                {normalizeBillingCycle(subscriptionDetails?.billing_cycle || '') || 'N/A'}
              </Badge>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-green-900 mb-2">
              Billing Cycle
            </h3>
            <p className="text-green-700 text-xs md:text-sm leading-relaxed break-words">
              {getBillingCycleDisplay(subscriptionDetails?.billing_cycle || '')}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                {subscriptionDetails?.current_plan ? 'Active' : 'None'}
              </Badge>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-purple-900 mb-2">
              Current Plan
            </h3>
            <p className="text-purple-700 text-xs md:text-sm leading-relaxed break-words">
              {subscriptionDetails?.current_plan ?
                getPlanDisplayName(subscriptionDetails.current_plan) :
                'No active plan selected'}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}