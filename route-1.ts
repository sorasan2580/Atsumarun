import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  const { group, name, dates } = body || {};
  if (!group || !name) {
    return NextResponse.json({ ok: false, error: 'group and name are required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('entries')
    .upsert(
      { group_id: group, name, dates: dates || [], updated_at: new Date().toISOString() },
      { onConflict: 'group_id,name' }
    );

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
