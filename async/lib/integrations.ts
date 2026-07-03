/**
 * The single source of truth for supported integrations.
 * The integrations page, credential API, and (later) the agent
 * all read from this list.
 */

export type Platform =
  | "aisensy"
  | "razorpay"
  | "zoho_books"
  | "nimbuspost"
  | "brevo"
  | "resend"
  | "google_sheets";

export type Integration = {
  id: Platform;
  name: string;
  category: "messaging" | "payments" | "invoicing" | "shipping" | "email" | "data";
  description: string;
  keyLabel: string; // what the input field asks for
  docsUrl: string;  // where users find their key
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "aisensy",
    name: "AiSensy",
    category: "messaging",
    description: "WhatsApp Business API — send messages, templates, and campaign triggers.",
    keyLabel: "AiSensy API key",
    docsUrl: "https://wiki.aisensy.com/",
  },
  {
    id: "razorpay",
    name: "Razorpay",
    category: "payments",
    description: "Payment events power your triggers — payment received, refund issued.",
    keyLabel: "Razorpay Key ID : Key Secret",
    docsUrl: "https://dashboard.razorpay.com/app/website-app-settings/api-keys",
  },
  {
    id: "zoho_books",
    name: "Zoho Books",
    category: "invoicing",
    description: "Auto-generate GST invoices when payments come in.",
    keyLabel: "Zoho OAuth token",
    docsUrl: "https://www.zoho.com/books/api/v3/",
  },
  {
    id: "nimbuspost",
    name: "NimbusPost",
    category: "shipping",
    description: "Create shipments and track orders automatically.",
    keyLabel: "NimbusPost API key",
    docsUrl: "https://nimbuspost.com/",
  },
  {
    id: "brevo",
    name: "Brevo",
    category: "email",
    description: "Transactional email — confirmations, receipts, follow-ups.",
    keyLabel: "Brevo API key",
    docsUrl: "https://app.brevo.com/settings/keys/api",
  },
  {
    id: "resend",
    name: "Resend",
    category: "email",
    description: "Developer-friendly email API, great free tier.",
    keyLabel: "Resend API key",
    docsUrl: "https://resend.com/api-keys",
  },
  {
    id: "google_sheets",
    name: "Google Sheets",
    category: "data",
    description: "Read and write rows — many startups run on Sheets.",
    keyLabel: "Service account JSON",
    docsUrl: "https://console.cloud.google.com/",
  },
];
