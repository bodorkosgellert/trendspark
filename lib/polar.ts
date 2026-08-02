import { Linking, Platform } from 'react-native';

/**
 * Card payments for contributions, via a Polar checkout link.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * .env  →  EXPO_PUBLIC_POLAR_CHECKOUT_URL=https://buy.polar.sh/polar_cl_xxxxx
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Why Polar rather than Stripe: Polar is a Merchant of Record. It is legally the
 * seller to the customer, so it handles EU VAT, invoicing and OSS filing and you
 * book one B2B payout. With Stripe the VAT liability, registration and invoices
 * stay yours. Lemon Squeezy and Paddle work the same way as Polar; swap the URL.
 *
 * Set the product up as pay-what-you-want, then `?amount=` (in cents) preselects
 * the rung the user chose here. The success URL is configured in Polar's
 * dashboard and should point at `https://your-domain/contribute?paid=1`.
 *
 * IMPORTANT, and stated in the UI: without a backend to receive Polar's webhook
 * the app cannot verify that a payment happened. What gets recorded is the
 * user's own confirmation — the same standard as the outcome ledger, and it is
 * labelled as self-reported. A verified total needs a server holding the webhook
 * secret; an EXPO_PUBLIC_ key never can.
 *
 * On iOS/Android this is only legal for a store build via the External Purchase
 * Link entitlement. On the web PWA there is no such restriction and no store cut.
 */
const CHECKOUT_URL = process.env.EXPO_PUBLIC_POLAR_CHECKOUT_URL ?? '';

/** Polar's cut on a card payment: 4% + 40 cents, in the same shape as the store fee. */
const FEE_RATE = 0.04;
const FEE_FIXED_CENTS = 40;

export function isCheckoutConfigured(): boolean {
  return CHECKOUT_URL.length > 0;
}

/** What actually lands after processor fees, in euro cents. */
export function netAfterCheckoutFees(cents: number): number {
  if (cents <= 0) return 0;
  return Math.max(0, Math.round(cents - cents * FEE_RATE - FEE_FIXED_CENTS));
}

export function checkoutUrl(cents: number, email?: string | null): string {
  const url = new URL(CHECKOUT_URL);
  url.searchParams.set('amount', String(cents));
  if (email) url.searchParams.set('customer_email', email);
  return url.toString();
}

/** Opens the hosted checkout. Returns false when nothing could be opened. */
export async function openCheckout(cents: number, email?: string | null): Promise<boolean> {
  if (!isCheckoutConfigured()) return false;

  const url = checkoutUrl(cents, email);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }

  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
