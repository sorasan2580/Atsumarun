export const metadata = { title: 'プライバシーポリシー | あつまるん' };

export default function PrivacyPage() {
  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">Legal</div>
        <h1>プライバシーポリシー</h1>
      </header>

      <div className="card">
        <h2><span className="num">1</span>収集する情報</h2>
        <p>本サービスでは、以下の情報を取得します。</p>
        <ul>
          <li>利用者が入力した名前（ニックネーム等、任意の文字列）</li>
          <li>利用者が登録した予定（日付の○✕情報）</li>
          <li>グループを識別するためのグループID（自動生成される文字列）</li>
        </ul>
        <p>
          氏名・電話番号・メールアドレスなど、個人を直接特定できる情報の入力を求めることはありません。ただし、利用者が自由入力欄に自身の本名やその他の個人情報を入力した場合、その内容は保存されます。本名等の入力は推奨しません。
        </p>
      </div>

      <div className="card">
        <h2><span className="num">2</span>情報の利用目的</h2>
        <ul>
          <li>同じグループ内の利用者間で、予定の調整状況を共有するため</li>
          <li>本サービスの維持・改善のための分析（個人を特定しない統計的な利用に限ります）</li>
        </ul>
      </div>

      <div className="card">
        <h2><span className="num">3</span>情報の保存・管理</h2>
        <ul>
          <li>入力された情報は、データベースサービス「Supabase」を通じて保存されます。</li>
          <li>同じ共有リンクを知っている人は誰でも、登録された名前と予定を閲覧できます。リンクの共有範囲には十分ご注意ください。</li>
          <li>端末に保存される情報（自分の名前など）は、ブラウザのローカルストレージ機能を利用しています。</li>
        </ul>
      </div>

      <div className="card">
        <h2><span className="num">4</span>第三者への提供</h2>
        <p>法令に基づく場合を除き、取得した情報を本人の同意なく第三者に提供することはありません。</p>
      </div>

      <div className="card">
        <h2><span className="num">5</span>情報の削除</h2>
        <p>登録した予定や名前の削除をご希望の場合は、下記お問い合わせ先までご連絡ください。</p>
      </div>

      <div className="card">
        <h2><span className="num">6</span>免責事項</h2>
        <p>
          本サービスは無償で提供されており、内容の正確性・安全性・継続性について保証するものではありません。本サービスの利用により生じた損害について、運営者は責任を負いません。
        </p>
      </div>

      <div className="card">
        <h2><span className="num">7</span>ポリシーの変更</h2>
        <p>
          本ポリシーの内容は、利用者への事前の通知なく変更されることがあります。変更後の内容は、本ページに掲載した時点から効力を持ちます。
        </p>
      </div>

      <div className="card">
        <h2><span className="num">8</span>お問い合わせ</h2>
        <p>本サービスに関するお問い合わせは、以下までご連絡ください。</p>
        <p>（atsumarun.support@gmail.com）</p>
      </div>

      <p className="empty-state">最終更新日：2026年6月20日</p>
    </div>
  );
}
