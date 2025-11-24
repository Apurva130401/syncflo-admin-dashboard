'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Crown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubscriptionBannerProps {
  subscriptionStatus: string | null;
}

export function SubscriptionBanner({ subscriptionStatus }: SubscriptionBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show banner when subscription_status is "inactive", "NULL", or empty
    const shouldShowBanner = !subscriptionStatus ||
                            subscriptionStatus === 'inactive' ||
                            subscriptionStatus === 'null' ||
                            subscriptionStatus === '';

    if (shouldShowBanner && !dismissed) {
      // Check if user has already dismissed this banner
      const dismissedBanner = localStorage.getItem('subscription_banner_dismissed');
      if (!dismissedBanner) {
        // Show banner after a short delay
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [subscriptionStatus, dismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    localStorage.setItem('subscription_banner_dismissed', 'true');
  };

  const handleUpgrade = () => {
    router.push('/plans');
  };

  // Show banner when subscription_status is "inactive", "NULL", or empty
  const shouldShowBanner = !subscriptionStatus ||
                          subscriptionStatus === 'inactive' ||
                          subscriptionStatus === 'null' ||
                          subscriptionStatus === '';

  if (!shouldShowBanner || dismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="relative z-30 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <Crown className="w-5 h-5 text-yellow-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    🚀 <span className="hidden sm:inline">Subscribe to get</span> full access to all features
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 ml-4">
                <Button
                  onClick={handleUpgrade}
                  size="sm"
                  className="bg-white text-orange-600 hover:bg-gray-50 font-medium px-4 py-1.5 h-auto text-xs sm:text-sm whitespace-nowrap"
                >
                  Upgrade Now
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>

                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}