import { Config, HeaderUtils, TTSClient } from 'coze-coding-dev-sdk';
import { TTS_VOICES } from '@/config/tts-voices';

type StoryTTSRequest = Parameters<TTSClient['synthesize']>[0] & { speed: number };

export async function synthesizeStoryAudio(text: string, ageGroup: unknown, requestHeaders: Headers) {
  const customHeaders = HeaderUtils.extractForwardHeaders(requestHeaders);
  const config = new Config();
  const client = new TTSClient(config, customHeaders);
  const voiceKey = ageGroup === '3-6' ? 'storyteller' : ageGroup === '7-12' ? 'narrator' : 'scholar';
  const voice = TTS_VOICES[voiceKey];

  const request: StoryTTSRequest = {
    uid: 'history-story-user',
    text: text.slice(0, 5000),
    speaker: voice.id,
    audioFormat: 'mp3',
    sampleRate: 24000,
    speed: 0.85,
  };

  const response = await client.synthesize(request);

  return {
    audioUrl: response.audioUri,
    audioSize: response.audioSize,
    voice: voice.name,
  };
}
