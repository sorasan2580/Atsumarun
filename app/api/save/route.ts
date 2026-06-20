import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

const GROUP_ID_RE = /^[a-zA-Z0-9_-]{1,32}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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
  if (typeof group !== 'string' || !GROUP_ID_RE.test(group)) {
    return NextResponse.json({ ok: false, error: 'invalid group' }, { status: 400 });
  }
  if (typeof name !== 'string' || name.length === 0 || name.length > 20) {
    return NextResponse.json({ ok: false, error: 'invalid name' }, { status: 400 });
  }
  if (dates !== undefined) {
    if (!Array.isArray(dates) || dates.length > 200) {
      return NextResponse.json({ ok: false, error: 'invalid dates' }, { status: 400 });
    }
    for (const d of dates) {
      if (typeof d !== 'string' || !DATE_RE.test(d)) {
        return NextResponse.json({ ok: false, error: 'invalid date format' }, { status: 400 });
      }
    }
  }

  // 1グループあたりの登録人数が異常に多くなるのを防ぐ(すでに存在する名前の更新は許可)
  const { count, error: countError } = await supabase
    .from('entries')
    .select('name', { count: 'exact', head: true })
    .eq('group_id', group);

  if (!countError && (count ?? 0) >= 100) {
    const { data: existing } = await supabase
      .from('entries')
      .select('name')
      .eq('group_id', group)
      .eq('name', name)
      .maybeSingle();
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'too many members in this group' }, { status: 429 });
    }
  }

  const safeName = name.trim().slice(0, 20);
  const safeDates = (dates || []).slice(0, 200);

  const { error } = await supabase
    .from('entries')
    .upsert(
      { group_id: group, name: safeName, dates: safeDates, updated_at: new Date().toISOString() },
      { onConflict: 'group_id,name' }
    );

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

