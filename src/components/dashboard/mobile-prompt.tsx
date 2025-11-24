'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Monitor, X, Smartphone } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

export function MobilePrompt() {
  const isMobile = useMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isMobile && !dismissed) {
      // Check if user has already dismissed this prompt
      const dismissedPrompt = localStorage.getItem('mobile_prompt_dismissed');
      if (!dismissedPrompt) {
        // Show prompt after a short delay
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isMobile, dismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    localStorage.setItem('mobile_prompt_dismissed', 'true');
  };

  const handleContinue = () => {
    setIsVisible(false);
  };

  if (!isMobile || dismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleContinue}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 z-50 w-auto max-w-sm mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Better on Desktop
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  For the best experience with SyncFlo AI, we recommend using a desktop or tablet device.
                </p>
              </div>

              {/* Mobile icon indicator */}
              <div className="flex items-center justify-center mb-6 p-3 bg-blue-50 rounded-lg">
                <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-700 font-medium">
                  You&apos;re on mobile
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="flex-1"
                >
                  Continue Anyway
                </Button>
                <Button
                  onClick={handleContinue}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Got it
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}