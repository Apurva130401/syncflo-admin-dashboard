import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Receipt,
  Clock,
  CheckCircle,
  Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PaymentRecord } from '@/types/billing';
import { formatDate, formatCurrency } from '@/lib/billing/utils';
import { createClient } from '@/lib/supabase/client';

interface PaymentHistoryProps {
  paymentHistory: PaymentRecord[];
}

export function PaymentHistory({ paymentHistory }: PaymentHistoryProps) {
  const router = useRouter();
  const supabase = createClient();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border-purple-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-800">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            📋 Payment History & Invoices
          </CardTitle>
          <CardDescription className="text-purple-600">
            Complete transaction history with downloadable invoices and receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                No Payment History
              </h3>
              <p className="text-purple-600 mb-6">
                Your payment history will appear here once you make your first payment
              </p>
              <Button
                onClick={() => router.push('/plans')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                View Plans
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-white/60 rounded-lg p-4 border border-purple-200 text-center">
                  <div className="text-2xl font-bold text-purple-800">
                    {paymentHistory.length}
                  </div>
                  <div className="text-sm text-purple-600">Total Payments</div>
                </div>
                <div className="bg-white/60 rounded-lg p-4 border border-purple-200 text-center">
                  <div className="text-2xl font-bold text-green-800">
                    {paymentHistory.filter((p) => p.status === 'paid').length}
                  </div>
                  <div className="text-sm text-green-600">Successful</div>
                </div>
                <div className="bg-white/60 rounded-lg p-4 border border-purple-200 text-center">
                  <div className="text-2xl font-bold text-blue-800">
                    ₹
                    {paymentHistory.reduce(
                      (sum, p) => sum + (p.status === 'paid' ? p.amount : 0),
                      0
                    ) / 100}
                  </div>
                  <div className="text-sm text-blue-600">Total Paid</div>
                </div>
                <div className="bg-white/60 rounded-lg p-4 border border-purple-200 text-center">
                  <div className="text-2xl font-bold text-orange-800">
                    {paymentHistory[0] ? formatDate(paymentHistory[0].created_at) : 'N/A'}
                  </div>
                  <div className="text-sm text-orange-600">Last Payment</div>
                </div>
              </div>

              {/* Payment List */}
              <div className="space-y-3">
                {paymentHistory.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/60 rounded-lg p-3 md:p-4 border border-purple-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            payment.status === 'paid'
                              ? 'bg-green-100'
                              : 'bg-yellow-100'
                          }`}
                        >
                          {payment.status === 'paid' ? (
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-purple-800 text-sm md:text-base truncate">
                            {payment.plan_name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1 md:gap-4 text-xs md:text-sm text-purple-600">
                            <span className="truncate">
                              {formatDate(payment.created_at)}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="capitalize truncate">
                              {payment.billing_cycle}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">{payment.payment_method}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                        <div className="text-left sm:text-right">
                          <div className="text-base md:text-lg font-bold text-purple-800">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                            <Badge
                              variant={payment.status === 'paid' ? 'default' : 'secondary'}
                              className={`text-xs ${
                                payment.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : ''
                              }`}
                            >
                              {payment.status === 'paid' ? '✓ Paid' : payment.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-purple-600 hover:text-purple-800 p-1"
                              onClick={async () => {
                                try {
                                  const { data: { session } } = await supabase.auth.getSession();
                                  if (!session?.access_token) {
                                    alert('Please log in to view invoices');
                                    return;
                                  }

                                  // Use fetch to get the invoice HTML and open in new tab
                                  const response = await fetch(`/api/view-invoice?paymentId=${payment.razorpay_payment_id}`, {
                                    method: 'GET',
                                    headers: {
                                      'Authorization': `Bearer ${session.access_token}`,
                                    },
                                  });

                                  if (!response.ok) {
                                    throw new Error('Failed to fetch invoice');
                                  }

                                  const html = await response.text();
                                  const newWindow = window.open('', '_blank');
                                  if (newWindow) {
                                    newWindow.document.write(html);
                                    newWindow.document.close();
                                  }
                                } catch (error) {
                                  console.error('Error fetching invoice:', error);
                                  alert('Failed to load invoice. Please try again.');
                                }
                              }}
                            >
                              <Download className="w-3 h-3 md:w-4 md:h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Download All Invoices */}
              <div className="flex justify-center pt-6 border-t border-purple-200">
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All Invoices (PDF)
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}