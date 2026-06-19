# あつまるん セットアップ手順

## 1. SupabaseのURLとキーを確認
Supabaseの管理画面 → Settings → API で以下をコピー
- Project URL
- anon public key

## 2. ローカルで動作確認(任意・パソコンがある場合)
1. このフォルダ一式をパソコンに置く
2. `.env.local.example` を `.env.local` にリネームし、SupabaseのURL/keyを貼る
3. ターミナルで以下を実行
   ```
   npm install
   npm run dev
   ```
4. `http://localhost:3000` を開いて動作確認

## 3. GitHubにアップロード
1. github.com で新しいリポジトリを作成(例: atsumarun)
2. このフォルダの中身をすべてアップロード(`.env.local` はアップロードしない)

## 4. Vercelにデプロイ
1. vercel.com にGitHubアカウントでログイン
2. 「Add New Project」→ さきほどのリポジトリを選択
3. 「Environment Variables」に以下を追加
   - `SUPABASE_URL` : SupabaseのProject URL
   - `SUPABASE_ANON_KEY` : Supabaseのanon public key
4. 「Deploy」をクリック
5. 数十秒で `https://atsumarun-xxxx.vercel.app` のようなURLが発行される

## 5. 独自ドメインの接続
1. Vercelのプロジェクト → Settings → Domains
2. `atsumarun.jp` を追加
3. 表示されるDNS設定(AレコードやCNAME)を、ドメインを購入したサイト(ムームードメインなど)の管理画面に登録
4. 反映まで数分〜数時間待つ

これで `https://atsumarun.jp` で公開されます。
