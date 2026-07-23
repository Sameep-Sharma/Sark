import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient('https://dqphfrnylolsmhvxvlml.supabase.co', 'sb_publishable_6EK-rwPdKiBGMD4jbNNZzQ_9GPIvJT1');
  const results = {};

  const { data: d1, error: e1 } = await supabase.from('team_members').select('*').limit(1);
  results.table = e1 ? e1.message : "OK";

  const { data: d2, error: e2 } = await supabase.storage.getBucket('team-avatars');
  results.avatarBucket = e2 ? e2.message : "OK";

  const { data: d3, error: e3 } = await supabase.storage.getBucket('team-banners');
  results.bannerBucket = e3 ? e3.message : "OK";

  return NextResponse.json(results);
}
