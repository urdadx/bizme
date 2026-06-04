import { env } from "@better-comments/env/web";

export const PLAN_PRODUCT_IDS = {
  starter: {
    monthly: env.VITE_MONTHLY_STARTER_PLAN,
    yearly: env.VITE_YEARLY_STARTER_PLAN,
  },
  growth: {
    monthly: env.VITE_MONTHLY_GROWTH_PLAN,
    yearly: env.VITE_YEARLY_GROWTH_PLAN,
  },
  professional: {
    monthly: env.VITE_MONTHLY_PRO_PLAN,
    yearly: env.VITE_YEARLY_PRO_PLAN,
  },
};

export const ADDON_PRODUCT_IDS = {
  messages: env.VITE_EXTRA_MESSAGE_CREDITS_ADDON,
  branding: env.VITE_REMOVE_BRANDING_ADDON,
  chatbot: env.VITE_EXTRA_CHATBOT_ADDON,
  member: env.VITE_EXTRA_TEAM_MEMBER_ADDON,
} as const;

export const planNameMap: Record<string, string> = {
  [PLAN_PRODUCT_IDS.starter.monthly ?? ""]: "Starter Plan",
  [PLAN_PRODUCT_IDS.starter.yearly ?? ""]: "Starter Plan",
  [PLAN_PRODUCT_IDS.growth.monthly ?? ""]: "Growth Plan",
  [PLAN_PRODUCT_IDS.growth.yearly ?? ""]: "Growth Plan",
  [PLAN_PRODUCT_IDS.professional.monthly ?? ""]: "Professional Plan",
  [PLAN_PRODUCT_IDS.professional.yearly ?? ""]: "Professional Plan",
  [ADDON_PRODUCT_IDS.chatbot ?? ""]: "Chatbot Add-on",
  [ADDON_PRODUCT_IDS.messages ?? ""]: "Message Credits Add-on",
  [ADDON_PRODUCT_IDS.branding ?? ""]: "Branding Add-on",
  [ADDON_PRODUCT_IDS.member ?? ""]: "Team Member Add-on",
};
