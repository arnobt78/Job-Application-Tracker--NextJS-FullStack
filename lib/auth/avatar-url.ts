/** Avatar URL resolver — Clerk image or deterministic robohash fallback */

export type ResolveAvatarUrlInput = {
  imageUrl?: string | null;
  name?: string | null;
  email?: string | null;
  /** When true and imageUrl empty, skip robohash until error (Clerk loading) */
  hasImage?: boolean;
  avatarError?: boolean;
};

/** Robohash seed — stable per user for SSR/client consistency */
export function robohashUrl(seed: string, size = 80): string {
  return `https://robohash.org/${encodeURIComponent(seed)}.png?size=${size}x${size}`;
}

/** Clerk profile image when present; otherwise robohash from name/email */
export function resolveAvatarUrl({
  imageUrl,
  name,
  email,
  hasImage = false,
  avatarError = false,
}: ResolveAvatarUrlInput): string {
  const seed = name?.trim() || email?.trim() || 'user';
  const trimmed = imageUrl?.trim() ?? '';

  if (avatarError || !trimmed) {
    if (hasImage && !avatarError) return '';
    return robohashUrl(seed);
  }

  return trimmed;
}
