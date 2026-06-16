export * from '@/types/age';
export * from '@/types/story';
export * from '@/config/age-groups';
export * from '@/config/tts-voices';
export * from '@/features/home/data/mock-stories';

export const SCENE_MARKER_REGEX = /\[场景(\d+)\]([\s\S]*?)(?=\[场景\d+\]|$)/g;
