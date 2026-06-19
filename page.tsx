'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';

type Member = { name: string; dates: string[] };

const DOW = ['日', '月', '火', '水', '木', '金', '土'];

function pad(n: number) { return n < 10 ? '0' + n : '' + n; }
function ymd(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

function colorForRatio(ratio: number) {
  if (ratio <= 0) return { bg: '#dceee2', fg: '#3f7a5c' };
  const minIntensity = 0.45;
  const t = minIntensity + (1 - minIntensity) * ratio;
  const base = [246, 217, 196], full = [217, 98, 43];
  const mix = base.map((c, i) => Math.round(c + (full[i] - c) * t));
  return { bg: `rgb(${mix.join(',')})`, fg: t > 0.6 ? '#fff' : 'var(--ink)' };
}

export default function Home() {
  const [groupId, setGroupId] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [ng, setNg] = useState<Set<string>>(new Set());
  const [members, setMembers] = useState<Member[]>([]);
  const [toast, setToast] = useState<string>('');
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1600);
  }, []);

  // groupId + shareUrl setup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let g = params.get('group') || '';
    if (!g) {
      g = Math.random().toString(36).slice(2, 8);
      const url = new URL(window.location.href);
      url.searchParams.set('group', g);
      window.history.replaceState(null, '', url.toString());
    }
    setGroupId(g);
    const full = new URL(window.location.href);
    full.searchParams.set('group', g);
    setShareUrl(full.toString());

    const savedName = localStorage.getItem('atsumarun_name_' + g) || '';
    if (savedName) setName(savedName);
  }, []);

  const apiList = useCallback(async (group: string): Promise<Member[]> => {
    const res = await fetch(`/api/list?group=${encodeURIComponent(group)}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'failed');
    return data.members;
  }, []);

  const apiSave = useCallback(async (group: string, name: string, dates: string[]) => {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group, name, dates }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'failed');
  }, []);

  const refresh = useCallback(async () => {
    if (!groupId) return;
    try {
      const m = await apiList(groupId);
      setMembers(m);
    } catch {
      showToast('読み込みに失敗しました');
    }
  }, [groupId, apiList, showToast]);

  // load my entry + refresh whenever groupId/name change
  useEffect(() => {
    if (!groupId) return;
    (async () => {
      if (name) {
        try {
          const m = await apiList(groupId);
          setMembers(m);
          const mine = m.find((x) => x.name === name);
          setNg(new Set(mine ? mine.dates : []));
        } catch {
          showToast('読み込みに失敗しました');
        }
      } else {
        refresh();
      }
    })();
  }, [groupId, name]); // eslint-disable-line react-hooks/exhaustive-deps

  // poll every 10s
  useEffect(() => {
    if (!groupId) return;
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, [groupId, refresh]);

  function handleSetName() {
    const v = nameInput.trim();
    if (!v) { showToast('名前を入力してください'); return; }
    setName(v);
    setNameInput('');
    localStorage.setItem('atsumarun_name_' + groupId, v);
  }

  function changeName() {
    setName('');
    localStorage.removeItem('atsumarun_name_' + groupId);
  }

  async function toggleDay(dateStr: string) {
    if (!name) { showToast('先に名前を入力してください'); return; }
    const next = new Set(ng);
    if (next.has(dateStr)) next.delete(dateStr); else next.add(dateStr);
    setNg(next);
    try {
      await apiSave(groupId, name, Array.from(next));
      refresh();
    } catch {
      showToast('保存に失敗しました。通信を確認してください');
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('コピーしました');
    } catch {
      showToast('長押しして手動でコピーしてください');
    }
  }

  function prevMonth() {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }
  function nextMonth() {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const dayCells = useMemo(() => {
    const cells: { d: number; dateStr: string; dow: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ d, dateStr: ymd(viewYear, viewMonth, d), dow: new Date(viewYear, viewMonth, d).getDay() });
    }
    return cells;
  }, [viewYear, viewMonth, daysInMonth]);

  const ngCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) for (const d of m.dates || []) counts[d] = (counts[d] || 0) + 1;
    return counts;
  }, [members]);

  const total = members.length;

  const summaryEntries = useMemo(() => {
    return Object.entries(ngCounts).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [ngCounts]);

  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">Group Availability</div>
        <h1>あつまるん</h1>
        <p>行けない日をタップで登録。みんなの分が自動で集まります。</p>
      </header>

      <div className="card">
        <h2><span className="num">1</span>名前を入力</h2>
        {name ? (
          <div className="whoami">
            名前：<b>{name}</b>
            <button onClick={changeName}>変更</button>
          </div>
        ) : null}
        <input
          type="text"
          placeholder="例：たっしー"
          maxLength={12}
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button className="btn" onClick={handleSetName}>この名前で進める</button>
      </div>

      <div className="card">
        <h2><span className="num">2</span>行けない日をタップ</h2>
        <div className="cal-head">
          <button onClick={prevMonth}>‹</button>
          <div className="mo">{viewYear}年 {viewMonth + 1}月</div>
          <button onClick={nextMonth}>›</button>
        </div>
        <div className="grid" style={{ marginBottom: 5 }}>
          {DOW.map((d, i) => (
            <div key={d} className="dow" style={{ color: i === 0 ? '#c14b4b' : i === 6 ? '#3b6fb0' : 'var(--muted)' }}>{d}</div>
          ))}
        </div>
        <div className="grid">
          {Array.from({ length: firstDow }).map((_, i) => <div key={'e' + i} className="day empty" />)}
          {dayCells.map(({ d, dateStr, dow }) => (
            <div
              key={dateStr}
              className={['day', dow === 0 ? 'sun' : '', dow === 6 ? 'sat' : '', ng.has(dateStr) ? 'ng' : ''].filter(Boolean).join(' ')}
              onClick={() => toggleDay(dateStr)}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="legend">
          <span><span className="sw" style={{ background: 'var(--accent)' }} />自分が✕</span>
          <span><span className="sw" style={{ background: '#fff', border: '1.5px solid var(--line)' }} />未回答</span>
        </div>
      </div>

      <div className="card">
        <h2><span className="num">3</span>みんなの状況</h2>
        <div className="cal-head">
          <button onClick={prevMonth}>‹</button>
          <div className="mo">{viewYear}年 {viewMonth + 1}月</div>
          <button onClick={nextMonth}>›</button>
        </div>
        <div className="grid" style={{ marginBottom: 5 }}>
          {DOW.map((d, i) => (
            <div key={'b' + d} className="dow" style={{ color: i === 0 ? '#c14b4b' : i === 6 ? '#3b6fb0' : 'var(--muted)' }}>{d}</div>
          ))}
        </div>
        <div className="grid">
          {Array.from({ length: firstDow }).map((_, i) => <div key={'be' + i} className="day empty" />)}
          {dayCells.map(({ d, dateStr }) => {
            const count = ngCounts[dateStr] || 0;
            const ratio = total > 0 ? count / total : 0;
            const { bg, fg } = total > 0 ? colorForRatio(ratio) : { bg: '#fff', fg: 'var(--ink)' };
            return (
              <div key={'b' + dateStr} className="day" style={{ background: bg, color: fg, borderColor: bg }}>
                {d}
              </div>
            );
          })}
        </div>
        <div className="legend" style={{ marginBottom: 14 }}>
          <span><span className="sw" style={{ background: 'var(--good-soft)' }} />全員OK</span>
          <span><span className="sw" style={{ background: 'var(--accent)' }} />全員NG</span>
        </div>

        {total === 0 ? (
          <div className="empty-state">まだ誰も登録していません</div>
        ) : summaryEntries.length === 0 ? (
          <div className="empty-state">登録メンバー：{total}人　まだ予定の入力はありません</div>
        ) : (
          <>
            {summaryEntries.map(([date, count]) => {
              const widthPct = Math.min(100, Math.round((count / total) * 100));
              const d = new Date(date);
              const label = `${d.getMonth() + 1}/${d.getDate()}(${DOW[d.getDay()]})`;
              return (
                <div className="summary-row" key={date}>
                  <div className="date">{label}</div>
                  <div className="bar-bg"><div className="bar" style={{ width: widthPct + '%' }} /></div>
                  <div className="who">{count}/{total}</div>
                </div>
              );
            })}
            <div className="empty-state" style={{ paddingTop: 10 }}>
              登録メンバー：{total}人（{members.map((m) => m.name).join('、')}）
            </div>
          </>
        )}
      </div>

      <div className="card" id="shareCard">
        <h2><span className="num">★</span>このページの共有リンク</h2>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px' }}>
          このリンクをLINEグループに貼ってください。同じリンクを開いた人だけが同じ予定表を見られます。
        </p>
        <input type="text" readOnly value={shareUrl} style={{ fontSize: 11.5, color: 'var(--muted)' }} />
        <button className="btn" onClick={copyLink}>リンクをコピー</button>
      </div>

      {toast ? <div className="toast show">{toast}</div> : null}
    </div>
  );
}
