import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(req: NextRequest) {
  const group = req.nextUrl.searchParams.get('group') || '';
  if (!group) {
    return NextResponse.json({ ok: false, error: 'group is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('groups')
    .select('mode, candidate_dates')
    .eq('group_id', group)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ ok: true, exists: false });
  }

  return NextResponse.json({
    ok: true,
    exists: true,
    mode: data.mode,
    candidateDates: data.candidate_dates || [],
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  const { group, mode, candidateDates } = body || {};
  if (!group || !mode) {
    return NextResponse.json({ ok: false, error: 'group and mode are required' }, { status: 400 });
  }

  // 既に存在する場合は作成しない(先着の主催者の設定を優先)
  const { data: existing } = await supabase
    .from('groups')
    .select('group_id')
    .eq('group_id', group)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, alreadyExisted: true });
  }

  const { error } = await supabase
    .from('groups')
    .insert({ group_id: group, mode, candidate_dates: candidateDates || [] });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
