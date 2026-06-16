import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey } from '@/storage/database/supabase-client';

interface RankingItem {
  story_id: string;
  story_name: string;
  play_count: number;
  total_duration: number;
}

export async function getStoryRanking(): Promise<RankingItem[]> {
  const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
  const supabaseKey = getSupabaseServiceRoleKey() || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: records, error } = await supabase
    .from('story_records')
    .select('story_id, story_name, duration')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  if (!records || records.length === 0) {
    return [];
  }

  const rankingMap = new Map<string, RankingItem>();

  records.forEach((record: { story_id: string; story_name: string; duration: string }) => {
    const storyId = record.story_id;
    const duration = parseInt(record.duration) || 0;

    if (rankingMap.has(storyId)) {
      const item = rankingMap.get(storyId)!;
      item.play_count += 1;
      item.total_duration += duration;
      return;
    }

    rankingMap.set(storyId, {
      story_id: storyId,
      story_name: record.story_name,
      play_count: 1,
      total_duration: duration,
    });
  });

  return Array.from(rankingMap.values())
    .sort((a, b) => b.play_count - a.play_count)
    .slice(0, 50);
}
