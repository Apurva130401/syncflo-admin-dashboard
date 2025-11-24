import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';

export function BillingAlerts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-800">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg mr-3">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            🔔 Billing Alerts &amp; Notifications
          </CardTitle>
          <CardDescription className="text-amber-600">
            Stay informed about your subscription and billing activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">Payment Successful</p>
                  <p className="text-sm text-amber-600">
                    Your monthly payment was processed successfully
                  </p>
                </div>
              </div>
              <span className="text-xs text-amber-500">2 days ago</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">Upcoming Renewal</p>
                  <p className="text-sm text-amber-600">
                    Your subscription renews in 15 days
                  </p>
                </div>
              </div>
              <span className="text-xs text-amber-500">Today</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">Usage Alert</p>
                  <p className="text-sm text-amber-600">
                    You&apos;ve used 80% of your monthly API limit
                  </p>
                </div>
              </div>
              <span className="text-xs text-amber-500">5 days ago</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-amber-200">
            <span className="text-sm text-amber-700">Email notifications</span>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Manage Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}