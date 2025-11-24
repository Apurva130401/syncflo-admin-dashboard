import { PlanConfig } from '@/types/billing';

export const PLANS: {
  whatsapp: Record<string, PlanConfig>;
  voice: Record<string, PlanConfig>;
  suite: Record<string, PlanConfig>;
} = {
  whatsapp: {
    starter: {
      id: 'whatsapp-starter',
      name: 'WhatsApp Starter',
      description: 'Perfect for small businesses getting started with AI-powered WhatsApp',
      price: {
        monthly: 99900, // ₹999 in paisa
        yearly: 999000, // ₹9990 in paisa
      },
      features: [
        'Up to 1,000 messages/month',
        'Basic AI responses',
        'WhatsApp Business API',
        '24/7 support',
        'Message analytics'
      ],
      limits: {
        messages: 1000,
        aiResponses: 1000
      }
    },
    professional: {
      id: 'whatsapp-professional',
      name: 'WhatsApp Professional',
      description: 'Advanced features for growing businesses',
      price: {
        monthly: 249900, // ₹2499 in paisa
        yearly: 2499000, // ₹24990 in paisa
      },
      features: [
        'Up to 10,000 messages/month',
        'Advanced AI responses',
        'Custom branding',
        'Priority support',
        'Advanced analytics',
        'Multi-agent support'
      ],
      limits: {
        messages: 10000,
        aiResponses: 10000
      }
    },
    enterprise: {
      id: 'whatsapp-enterprise',
      name: 'WhatsApp Enterprise',
      description: 'Full-featured solution for large enterprises',
      price: {
        monthly: 499900, // ₹4999 in paisa
        yearly: 4999000, // ₹49990 in paisa
      },
      features: [
        'Unlimited messages',
        'Custom AI models',
        'White-label solution',
        'Dedicated account manager',
        'API access',
        'Custom integrations'
      ],
      limits: {
        messages: -1, // unlimited
        aiResponses: -1
      }
    }
  },
  voice: {
    starter: {
      id: 'voice-starter',
      name: 'Voice Starter',
      description: 'AI voice agent for basic customer interactions',
      price: {
        monthly: 149900, // ₹1499 in paisa
        yearly: 1499000, // ₹14990 in paisa
      },
      features: [
        'Up to 500 minutes/month',
        'Basic voice responses',
        'Phone integration',
        'Call analytics',
        '24/7 availability'
      ],
      limits: {
        voiceMinutes: 500
      }
    },
    professional: {
      id: 'voice-professional',
      name: 'Voice Professional',
      description: 'Advanced voice AI for complex interactions',
      price: {
        monthly: 349900, // ₹3499 in paisa
        yearly: 3499000, // ₹34990 in paisa
      },
      features: [
        'Up to 2,000 minutes/month',
        'Advanced AI conversations',
        'Custom voice training',
        'CRM integration',
        'Priority support'
      ],
      limits: {
        voiceMinutes: 2000
      }
    },
    enterprise: {
      id: 'voice-enterprise',
      name: 'Voice Enterprise',
      description: 'Enterprise-grade voice AI solution',
      price: {
        monthly: 699900, // ₹6999 in paisa
        yearly: 6999000, // ₹69990 in paisa
      },
      features: [
        'Unlimited minutes',
        'Custom AI models',
        'Multi-language support',
        'Advanced analytics',
        'White-label solution'
      ],
      limits: {
        voiceMinutes: -1 // unlimited
      }
    }
  },
  suite: {
    starter: {
      id: 'suite-starter',
      name: 'Business Suite Starter',
      description: 'Complete AI business suite for small teams',
      price: {
        monthly: 199900, // ₹1999 in paisa
        yearly: 1999000, // ₹19990 in paisa
      },
      features: [
        'WhatsApp: 2,000 messages',
        'Voice: 1,000 minutes',
        'Basic AI responses',
        'Unified dashboard',
        'Email support'
      ],
      limits: {
        messages: 2000,
        voiceMinutes: 1000,
        aiResponses: 3000
      }
    },
    professional: {
      id: 'suite-professional',
      name: 'Business Suite Professional',
      description: 'Advanced AI suite for growing businesses',
      price: {
        monthly: 449900, // ₹4499 in paisa
        yearly: 4499000, // ₹44990 in paisa
      },
      features: [
        'WhatsApp: 15,000 messages',
        'Voice: 3,000 minutes',
        'Advanced AI features',
        'Custom branding',
        'Priority support',
        'API access'
      ],
      limits: {
        messages: 15000,
        voiceMinutes: 3000,
        aiResponses: 18000
      }
    },
    enterprise: {
      id: 'suite-enterprise',
      name: 'Business Suite Enterprise',
      description: 'Full enterprise AI business suite',
      price: {
        monthly: 899900, // ₹8999 in paisa
        yearly: 8999000, // ₹89990 in paisa
      },
      features: [
        'Unlimited WhatsApp messages',
        'Unlimited voice minutes',
        'Custom AI models',
        'White-label solution',
        'Dedicated support',
        'Custom integrations'
      ],
      limits: {
        messages: -1,
        voiceMinutes: -1,
        aiResponses: -1
      }
    }
  }
};