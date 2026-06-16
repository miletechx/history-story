import { Client } from 'pg';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { normalizeAgeGroup } from '@/lib/age-group';
import { generateStoryId } from '@/lib/story-id';

function normalizeQuery(value: unknown): string {
  return String(value ?? '').trim();
}

async function ensureGeneratedStoriesTable() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return;
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    await client.query(`
      create table if not exists generated_stories (
        id serial primary key,
        story_id text not null unique,
        query text not null,
        age_group text not null,
        content text not null,
        audio_url text,
        image_data text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
      create index if not exists generated_stories_story_id_idx on generated_stories(story_id);
      create index if not exists generated_stories_query_age_idx on generated_stories(query, age_group);
    `);
  } catch (error) {
    console.warn('自动创建 generated_stories 表失败，请手动执行建表 SQL:', error);
  } finally {
    await client.end();
  }
}

const generatedStorySelect = 'story_id, query, age_group, content, audio_url, image_data, created_at, updated_at';

export async function getGeneratedStory(queryValue: unknown, ageGroupValue: unknown) {
  const query = normalizeQuery(queryValue);
  const ageGroup = normalizeAgeGroup(ageGroupValue);

  if (!query) {
    return { error: '缺少查询内容' as const };
  }

  const storyId = generateStoryId(query, ageGroup);
  const supabase = getSupabaseClient();

  let { data, error } = await supabase
    .from('generated_stories')
    .select(generatedStorySelect)
    .eq('story_id', storyId)
    .maybeSingle();

  if (error && error.code === '42P01') {
    await ensureGeneratedStoriesTable();
    const retry = await supabase
      .from('generated_stories')
      .select(generatedStorySelect)
      .eq('story_id', storyId)
      .maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw error;
  }

  return { story: data ?? null, storyId };
}

export async function saveGeneratedStory(body: Record<string, unknown>) {
  const query = normalizeQuery(body.query);
  const ageGroup = normalizeAgeGroup(body.ageGroup);
  const content = normalizeQuery(body.content);
  const audioUrl = body.audioUrl ? String(body.audioUrl) : null;
  const imageData = body.imageData ? JSON.stringify(body.imageData) : null;

  if (!query || !content) {
    return { error: '缺少故事内容' as const };
  }

  const storyId = generateStoryId(query, ageGroup);
  const supabase = getSupabaseClient();
  const payload = {
    story_id: storyId,
    query,
    age_group: ageGroup,
    content,
    audio_url: audioUrl,
    image_data: imageData,
    updated_at: new Date().toISOString(),
  };

  let { data, error } = await supabase
    .from('generated_stories')
    .upsert(payload, { onConflict: 'story_id' })
    .select(generatedStorySelect)
    .single();

  if (error && error.code === '42P01') {
    await ensureGeneratedStoriesTable();
    const retry = await supabase
      .from('generated_stories')
      .upsert(payload, { onConflict: 'story_id' })
      .select(generatedStorySelect)
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw error;
  }

  return { success: true, story: data };
}
