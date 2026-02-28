export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <SettingsClient
      userId={user.id}
      email={user.email}
      settings={settings ?? { user_id: user.id, daily_goal: 30, new_cards_per_day: 20 }}
    />
  );
}
