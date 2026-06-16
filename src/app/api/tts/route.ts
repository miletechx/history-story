import { NextRequest, NextResponse } from 'next/server';
import { synthesizeStoryAudio } from '@/services/tts.service';

export async function POST(request: NextRequest) {
  try {
    const { text, ageGroup } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '缺少文本内容' }, { status: 400 });
    }

    const audio = await synthesizeStoryAudio(text, ageGroup, request.headers);
    return NextResponse.json(audio);
  } catch (error) {
    console.error('TTS错误:', error);
    return NextResponse.json({ error: '语音合成失败' }, { status: 500 });
  }
}
