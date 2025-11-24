'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Users } from 'lucide-react';

interface WelcomeScreenProps {
  isOpen: boolean;
  onGetStarted: () => void;
  userName?: string;
}

export function WelcomeScreen({ isOpen, onGetStarted, userName }: WelcomeScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleGetStarted = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onGetStarted();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Main Content */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-8"
        >
          {/* Logo/Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring", bounce: 0.4 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Welcome to SyncFlo AI
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your intelligent business automation platform. Let&apos;s get you set up in just a few simple steps.
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">Automate your workflows with AI-powered speed</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-sm text-gray-600">Work seamlessly with your entire team</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600">Intelligent automation at your fingertips</p>
            </motion.div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="pt-8"
          >
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              disabled={isAnimating}
            >
              {isAnimating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  Let&apos;s Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </motion.div>

          {/* User Greeting */}
          {userName && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-gray-500 mt-6"
            >
              Welcome aboard, {userName}! &nbsp;🎉
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Exit Animation Overlay */}
      {isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white z-20"
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}