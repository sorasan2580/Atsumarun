import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(req: NextRequest) {
  const group = req.nextUrl.searchParams.get('group') || '';
  if (!group) {
    return NextResponse.json({ ok: false, error: 'group is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('entries')
    .select('name, dates')
    .eq('group_id', group);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, members: data });
}
