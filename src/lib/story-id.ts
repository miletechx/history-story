import type { AgeGroup } from '@/types/age';

export function generateStoryId(storyName: string, ageGroup: AgeGroup): string {
  const combined = `${storyName}_${ageGroup}`;
  let hash = 0;

  for (let index = 0; index < combined.length; index += 1) {
    const char = combined.charCodeAt(index);
    hash = ((hash << 5) - hash) + char;
    hash &= hash;
  }

  return `story_${Math.abs(hash)}`;
}
