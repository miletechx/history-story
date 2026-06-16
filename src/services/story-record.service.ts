import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey } from '@/storage/database/supabase-client';

function getServiceSupabaseClient() {
  const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
  const supabaseKey = getSupabaseServiceRoleKey() || '';
  return createClient(supabaseUrl, supabaseKey);
}

export async function getUserStoryRecords(userId: string) {
  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from('story_records')
    .select('*')
    .eq('user_id', parseInt(userId))
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return data;
}

export async function createStoryRecord(userId: string, body: { story_name: string; story_id: string; duration: number | string }) {
  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from('story_records')
    .insert({
      user_id: parseInt(userId),
      story_name: body.story_name,
      story_id: body.story_id,
      duration: body.duration,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
