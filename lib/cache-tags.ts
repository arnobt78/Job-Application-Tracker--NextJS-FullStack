/** Next.js cache tags — scoped per authenticated user for revalidateTag on CRUD */

export function jobsTag(userId: string): string {
  return `jobs-${userId}`;
}

export function statsTag(userId: string): string {
  return `stats-${userId}`;
}

export function chartsTag(userId: string): string {
  return `charts-${userId}`;
}

export function allUserTags(userId: string): string[] {
  return [jobsTag(userId), statsTag(userId), chartsTag(userId)];
}
