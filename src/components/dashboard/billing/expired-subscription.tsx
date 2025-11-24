import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SubscriptionDetails } from '@/types/billing';

interface ExpiredSubscriptionProps {
  subscriptionDetails: SubscriptionDetails;
}

export function ExpiredSubscription({ subscriptionDetails }: ExpiredSubscriptionProps) {
  const router = useRouter();

  if (subscriptionDetails.subscription_status !== 'expired') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="border-red-200 bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-red-800">⚠️ Subscription Expired</CardTitle>
                <CardDescription className="text-red-700 text-lg">
                  Your access has been limited. Renew now to restore full functionality.
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-red-100 text-red-800 text-sm px-3 py-1">
              Expired
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white/60 rounded-lg p-4 border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">🔒 Limited Access Active</h4>
            <p className="text-red-700 text-sm mb-3">
              You can still view your data and settings, but core features are disabled until renewal.
            </p>
            <div className="flex items-center space-x-2 text-xs text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Renewal required to restore full access</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-lg p-4 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">💰 Pricing Options</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Monthly: Flexible payment</li>
                <li>• Yearly: 20% savings</li>
                <li>• Enterprise: Custom solutions</li>
              </ul>
            </div>
            <div className="bg-white/60 rounded-lg p-4 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">🎯 Why Renew?</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Restore full access</li>
                <li>• Keep your data safe</li>
                <li>• Continue customer support</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push('/plans')}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Renew Subscription Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}