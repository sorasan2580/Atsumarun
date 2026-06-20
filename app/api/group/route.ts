import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

const GROUP_ID_RE = /^[a-zA-Z0-9_-]{1,32}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  const group = req.nextUrl.searchParams.get('group') || '';
  if (!group || !GROUP_ID_RE.test(group)) {
    return NextResponse.json({ ok: false, error: 'invalid group' }, { status: 400 });
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
  if (typeof group !== 'string' || !GROUP_ID_RE.test(group)) {
    return NextResponse.json({ ok: false, error: 'invalid group' }, { status: 400 });
  }
  if (mode !== 'calendar' && mode !== 'candidate') {
    return NextResponse.json({ ok: false, error: 'invalid mode' }, { status: 400 });
  }
  if (mode === 'candidate') {
    if (!Array.isArray(candidateDates) || candidateDates.length < 2 || candidateDates.length > 5) {
      return NextResponse.json({ ok: false, error: 'candidateDates must have 2-5 dates' }, { status: 400 });
    }
    for (const d of candidateDates) {
      if (typeof d !== 'string' || !DATE_RE.test(d)) {
        return NextResponse.json({ ok: false, error: 'invalid date format' }, { status: 400 });
      }
    }
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
    .insert({ group_id: group, mode, candidate_dates: mode === 'candidate' ? candidateDates : [] });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

