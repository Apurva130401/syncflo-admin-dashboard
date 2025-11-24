import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Settings,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SubscriptionDetails, ProductCategory } from '@/types/billing';
import { getUserProductCategory, normalizeBillingCycle } from '@/lib/billing/utils';
import { PLANS } from '@/lib/billing/plans';

interface PlansOverviewProps {
  subscriptionDetails: SubscriptionDetails;
}

export function PlansOverview({ subscriptionDetails }: PlansOverviewProps) {
  const router = useRouter();
  const productCategory = getUserProductCategory(subscriptionDetails);
  
  const getPlansForCategory = (category: ProductCategory) => {
    switch (category) {
      case 'WhatsApp Business AI':
        return PLANS.whatsapp;
      case 'AI Voice Agent':
        return PLANS.voice;
      case 'Full AI Business Suite':
        return PLANS.suite;
    }
  };

  const plans = getPlansForCategory(productCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-3">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            🚀 Plan Management
          </CardTitle>
          <CardDescription className="text-blue-600">
            Upgrade, downgrade, or modify your subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan Status */}
          <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-blue-800">{productCategory} Plan</h4>
                <p className="text-sm text-blue-600">{plans[subscriptionDetails.current_plan?.split('-')[1] || 'starter']?.name}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {subscriptionDetails.subscription_status === 'active'
                  ? 'Active'
                  : subscriptionDetails.subscription_status === 'trial'
                  ? 'Trial'
                  : 'Inactive'}
              </Badge>
            </div>
            {subscriptionDetails.subscription_status === 'active' && (
              <div className="text-sm text-blue-600">
                Billing cycle:{' '}
                {normalizeBillingCycle(subscriptionDetails.billing_cycle) === 'yearly'
                  ? 'Annual (20% savings)'
                  : 'Monthly'}
              </div>
            )}
          </div>

          {/* Plan Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                className={`bg-white/60 rounded-lg p-4 border ${
                  subscriptionDetails.current_plan?.includes(key)
                    ? 'border-green-300 ring-1 ring-green-300'
                    : 'border-blue-200'
                } hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600">{plan.name.split(' ')[0]}</span>
                  </div>
                  <h4 className="font-semibold text-blue-800">{key}</h4>
                </div>
                <p className="text-2xl font-bold text-blue-800 mb-2">
                  ₹{(plan.price.monthly / 100).toLocaleString()}{' '}
                  <span className="text-sm font-normal">/month</span>
                </p>
                <ul className="text-sm text-blue-600 space-y-1 mb-4">
                  {plan.features?.slice(0, 3).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
                {subscriptionDetails.current_plan?.includes(key) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => router.push('/plans')}
                    className={`w-full ${
                      key === 'enterprise'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                    }`}
                  >
                    {key === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Billing Preferences */}
          <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">Billing Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-blue-700 mb-2 block">
                  Billing Cycle
                </label>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={
                      normalizeBillingCycle(subscriptionDetails.billing_cycle) === 'monthly'
                        ? 'default'
                        : 'outline'
                    }
                    className="flex-1"
                  >
                    Monthly
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      normalizeBillingCycle(subscriptionDetails.billing_cycle) === 'yearly'
                        ? 'default'
                        : 'outline'
                    }
                    className="flex-1"
                  >
                    Yearly (20% off)
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-700 mb-2 block">
                  Auto-renewal
                </label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded border-blue-300" />
                  <span className="text-sm text-blue-600">
                    Automatically renew subscription
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => router.push('/plans')}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg px-8"
            >
              <Settings className="w-5 h-5 mr-2" />
              View All Plans & Features
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}