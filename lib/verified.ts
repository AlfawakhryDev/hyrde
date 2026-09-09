// One answer to "is this address confirmed", used by the proxy gate and the
// /verify page so they can never disagree.
//
// A provider that hands us a session has already proved the address. Mailing a
// six digit code to an inbox Google just vouched for is friction with nothing
// gained, so social sign-ins never see the wall.

type IdentityLike = { provider?: string | null };
type UserLike = {
  app_metadata?: { provider?: string | null; providers?: string[] | null } | null;
  identities?: IdentityLike[] | null;
};

/** Every provider we can see on the account, not just the first one used.
 *  app_metadata.provider is only the ORIGINAL provider, so an account that
 *  later linked Google still reads "email" there. identities is the truth. */
function providersOf(user: UserLike | null | undefined): string[] {
  const out = [
    user?.app_metadata?.provider,
    ...(user?.app_metadata?.providers ?? []),
    ...(user?.identities ?? []).map(i => i?.provider),
  ].filter((p): p is string => typeof p === "string" && p.length > 0);
  return [...new Set(out)];
}

export function isEmailVerified(
  user: UserLike | null | undefined,
  verifiedAt: string | null | undefined,
): boolean {
  if (verifiedAt) return true;

  const providers = providersOf(user);

  // Any provider-backed identity means the address is already proved.
  if (providers.some(p => p !== "email")) return true;

  // The previous version defaulted a missing provider to "email", so an OAuth
  // user whose app_metadata had not been hydrated was sent to the wall. Block
  // only on POSITIVE evidence of a password account; not knowing is not
  // grounds for locking someone out of their own account.
  if (!providers.includes("email")) return true;

  return false;
}
