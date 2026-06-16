import type { AgeGroup } from './age';

export interface Story {
  id: string;
  title: string;
  summary: string;
  era: string;
  playCount: number;
  likeCount: number;
  duration: number;
  hasImage?: boolean;
}

export interface StoryScene {
  index: number;
  content: string;
  imageUrl?: string;
}

export interface StoryContent {
  text: string;
  scenes: StoryScene[];
}

export interface CachedStory {
  story_id: string;
  query: string;
  age_group: string;
  content: string;
  audio_url: string | null;
  image_data: string | null;
}

export interface StoryHistoryRecord {
  id: string;
  title: string;
  content: string;
  ageGroup: AgeGroup | string;
  createdAt: string;
}
