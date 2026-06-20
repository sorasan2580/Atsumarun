import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

const GROUP_ID_RE = /^[a-zA-Z0-9_-]{1,32}$/;

export async function GET(req: NextRequest) {
  const group = req.nextUrl.searchParams.get('group') || '';
  if (!group || !GROUP_ID_RE.test(group)) {
    return NextResponse.json({ ok: false, error: 'invalid group' }, { status: 400 });
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
