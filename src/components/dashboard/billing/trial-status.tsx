import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SubscriptionDetails } from '@/types/billing';
import { getDaysUntilExpiry } from '@/lib/billing/utils';

interface TrialStatusProps {
  subscriptionDetails: SubscriptionDetails;
}

export function TrialStatus({ subscriptionDetails }: TrialStatusProps) {
  const router = useRouter();

  if (subscriptionDetails.subscription_status !== 'trial') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-amber-800">🎉 Free Trial Active</CardTitle>
                <CardDescription className="text-amber-700 text-lg">
                  {subscriptionDetails.trial_end_date &&
                    `${getDaysUntilExpiry(subscriptionDetails.trial_end_date)} days remaining`
                  }
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-600">
                {subscriptionDetails.trial_end_date &&
                  Math.max(0, getDaysUntilExpiry(subscriptionDetails.trial_end_date))
                }
              </div>
              <div className="text-sm text-amber-600">Days Left</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white/50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-amber-800 font-medium">Trial Progress</span>
              <span className="text-amber-600 text-sm">
                {subscriptionDetails.trial_end_date &&
                  `${14 - Math.max(0, getDaysUntilExpiry(subscriptionDetails.trial_end_date))}/14 days used`
                }
              </span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: subscriptionDetails.trial_end_date ?
                    `${((14 - Math.max(0, getDaysUntilExpiry(subscriptionDetails.trial_end_date))) / 14) * 100}%` : '0%'
                }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/50 rounded-lg p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">✨ What&apos;s Included:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Full access to all features</li>
                <li>• 24/7 customer support</li>
                <li>• Unlimited API calls</li>
                <li>• Advanced analytics</li>
              </ul>
            </div>
            <div className="bg-white/50 rounded-lg p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">🚀 Ready to Upgrade?</h4>
              <p className="text-sm text-amber-700 mb-3">
                Don&apos;t lose access to your data. Upgrade now and save 20% with annual billing.
              </p>
              <Button
                onClick={() => router.push('/plans')}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
              >
                View Plans &amp; Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}