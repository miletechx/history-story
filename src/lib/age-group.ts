import { AGE_GROUPS } from '@/config/age-groups';
import type { AgeGroup } from '@/types/age';

export function normalizeAgeGroup(value: unknown): AgeGroup {
  const normalized = String(value ?? '').replace(/\s/g, '+');
  return AGE_GROUPS.includes(normalized as AgeGroup) ? (normalized as AgeGroup) : '7-12';
}
