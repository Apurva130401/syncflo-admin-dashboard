import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { SubscriptionDetails } from '@/types/billing';
import { normalizeBillingCycle } from '@/lib/billing/utils';

interface CostOptimizationProps {
  subscriptionDetails: SubscriptionDetails;
}

export function CostOptimization({ subscriptionDetails }: CostOptimizationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-indigo-800">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg mr-3">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            💡 Cost Optimization Tips
          </CardTitle>
          <CardDescription className="text-indigo-600">
            Maximize your subscription value with these smart recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 text-sm">💰</span>
                </div>
                <h4 className="font-semibold text-indigo-800">Switch to Yearly</h4>
              </div>
              <p className="text-sm text-indigo-600 mb-2">
                Save 20% by switching to annual billing. Pay ₹
                {normalizeBillingCycle(subscriptionDetails.billing_cycle) === 'monthly'
                  ? '12,000'
                  : '10,000'}
                /year instead of ₹14,400.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                Switch to Yearly
              </Button>
            </div>

            <div className="bg-white/60 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm">📊</span>
                </div>
                <h4 className="font-semibold text-indigo-800">Monitor Usage</h4>
              </div>
              <p className="text-sm text-indigo-600 mb-2">
                Track your API usage and optimize costs. You&apos;re using 57% of your monthly
                limit.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                View Usage Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}