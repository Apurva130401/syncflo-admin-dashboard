'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface OnboardingStep {
  id: string;
  label: string;
  completed: boolean;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const initialSteps: OnboardingStep[] = [
  { id: 'whatsapp', label: 'Connect WhatsApp', completed: false },
  { id: 'logo', label: 'Upload Logo', completed: false },
  { id: 'team', label: 'Invite Team Member', completed: false },
];

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [steps, setSteps] = useState<OnboardingStep[]>(initialSteps);

  const handleStepToggle = (stepId: string) => {
    setSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const allCompleted = steps.every(step => step.completed);

  useEffect(() => {
    if (allCompleted) {
      // Auto-complete after a short delay
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [allCompleted, onComplete]);

  const handleClose = () => {
    if (allCompleted) {
      onComplete();
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-lg border-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="text-center">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Welcome to SyncFlo! 🎉
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Let&apos;s get you started with these quick steps
                </p>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={step.id}
                      checked={step.completed}
                      onCheckedChange={() => handleStepToggle(step.id)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label
                      htmlFor={step.id}
                      className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                    >
                      {step.label}
                    </label>
                    {step.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-500"
                      >
                        <CheckCircle size={20} />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {allCompleted ? 'Complete' : 'Skip for now'}
                </Button>

                {allCompleted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-600 font-medium"
                  >
                    All done! 🎉
                  </motion.div>
                )}
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}