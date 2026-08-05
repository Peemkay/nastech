export const SITE_NAME = "NASTECH Gadgets";
export const SITE_TAGLINE = "Smart Tech. Better Life.";

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
] as const;

export const PAYMENT_METHODS = ["PAYSTACK", "FLUTTERWAVE", "BANK_TRANSFER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PAYSTACK: "Card / Transfer / USSD — Paystack",
  FLUTTERWAVE: "Card / Transfer / USSD — Flutterwave",
  BANK_TRANSFER: "Direct Bank Transfer",
};

export const PRODUCT_GRADES = ["LIKE_NEW", "GOOD", "FAIR"] as const;
export type ProductGrade = (typeof PRODUCT_GRADES)[number];

export const GRADE_LABELS: Record<ProductGrade, string> = {
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
};

export const GRADE_DESCRIPTIONS: Record<ProductGrade, string> = {
  LIKE_NEW: "Little to no signs of use. Looks and works like new.",
  GOOD: "Minor signs of use that are barely noticeable. Fully functional.",
  FAIR: "Visible signs of use (light scratches/marks). Fully functional.",
};

export const SELL_REQUEST_STATUSES = [
  "QUOTE_GENERATED",
  "PICKUP_SCHEDULED",
  "PICKED_UP",
  "INSPECTING",
  "OFFER_REVISED",
  "ACCEPTED",
  "REJECTED_BY_CUSTOMER",
  "PAID_OUT",
  "CANCELLED",
] as const;
export type SellRequestStatus = (typeof SELL_REQUEST_STATUSES)[number];

export const SELL_REQUEST_STATUS_LABELS: Record<SellRequestStatus, string> = {
  QUOTE_GENERATED: "Quote Generated",
  PICKUP_SCHEDULED: "Pickup Scheduled",
  PICKED_UP: "Device Picked Up",
  INSPECTING: "Under Inspection",
  OFFER_REVISED: "Offer Revised",
  ACCEPTED: "Offer Accepted",
  REJECTED_BY_CUSTOMER: "Rejected by Customer",
  PAID_OUT: "Paid Out",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PAID: "Payment Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUSES = ["PENDING", "AWAITING_VERIFICATION", "PAID", "FAILED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const MAIN_NAV = [
  { href: "/sell", label: "Sell / Trade-in" },
  { href: "/shop", label: "Shop Refurbished" },
  { href: "/track", label: "Track Order" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  smartphones: "smartphone",
  laptops: "laptop",
  tablets: "tablet",
  smartwatches: "watch",
  audio: "headphones",
  consoles: "gamepad-2",
};
