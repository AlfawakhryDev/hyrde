// One answer to "is this address confirmed", used by the proxy gate and the
// /verify page so they can never disagree.
//
// Google, GitHub and Microsoft already proved the address before handing us a
// session. Mailing a six digit code to an inbox the provider just vouched for
// is friction with no security gained, so social sign-ins pass by provider.
export function isEmailVerified(
  provider: string | undefined,
  verifiedAt: string | null | undefined,
): boolean {
  if ((provider ?? "email") !== "email") return true;
  return !!verifiedAt;
}
