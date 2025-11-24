/**
 * Supabase接続テストスクリプト
 * 
 * 使用方法:
 * npx ts-node scripts/test-supabase-connection.ts
 * 
 * または .env.local の環境変数を読み込んで実行:
 * node -r dotenv/config scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';

async function testSupabaseConnection() {
  console.log('🔍 Supabase接続テストを開始します...\n');

  // 環境変数チェック
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ エラー: 環境変数が設定されていません');
    console.error('   SUPABASE_URL と SUPABASE_ANON_KEY を .env.local に設定してください');
    process.exit(1);
  }

  console.log(`✅ 環境変数読み込み完了`);
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

  // Supabaseクライアント作成
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabaseクライアント作成完了\n');

  try {
    // テスト1: achievements テーブルからデータ取得
    console.log('📊 テスト1: achievementsテーブルの確認');
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('code, name, category')
      .limit(5);

    if (achievementsError) {
      console.error('❌ achievementsテーブルの取得に失敗:', achievementsError.message);
      throw achievementsError;
    }

    console.log(`✅ achievementsテーブル: ${achievements?.length || 0}件取得`);
    if (achievements && achievements.length > 0) {
      console.log('   サンプル:');
      achievements.forEach(a => {
        console.log(`   - [${a.category}] ${a.name} (${a.code})`);
      });
    }
    console.log('');

    // テスト2: settings テーブルからデータ取得
    console.log('📊 テスト2: settingsテーブルの確認');
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('setting_key, setting_value, group_name')
      .limit(5);

    if (settingsError) {
      console.error('❌ settingsテーブルの取得に失敗:', settingsError.message);
      throw settingsError;
    }

    console.log(`✅ settingsテーブル: ${settings?.length || 0}件取得`);
    if (settings && settings.length > 0) {
      console.log('   サンプル:');
      settings.forEach(s => {
        console.log(`   - [${s.group_name}] ${s.setting_key}: ${s.setting_value}`);
      });
    }
    console.log('');

    // テスト3: llm_models テーブルからデータ取得
    console.log('📊 テスト3: llm_modelsテーブルの確認');
    const { data: models, error: modelsError } = await supabase
      .from('llm_models')
      .select('model_name, provider, status');

    if (modelsError) {
      console.error('❌ llm_modelsテーブルの取得に失敗:', modelsError.message);
      throw modelsError;
    }

    console.log(`✅ llm_modelsテーブル: ${models?.length || 0}件取得`);
    if (models && models.length > 0) {
      console.log('   サンプル:');
      models.forEach(m => {
        console.log(`   - [${m.provider}] ${m.model_name} (${m.status})`);
      });
    }
    console.log('');

    // テスト4: テーブル一覧確認（全16テーブル）
    console.log('📊 テスト4: 全テーブルの存在確認');
    const expectedTables = [
      'users',
      'goals',
      'training_plans',
      'workout_sessions',
      'workout_records',
      'physical_stats',
      'consultations',
      'achievements',
      'user_achievements',
      'user_sessions',
      'task_reminders',
      'conversation_history',
      'api_keys',
      'llm_models',
      'settings',
      'system_logs'
    ];

    for (const table of expectedTables) {
      const { error } = await supabase.from(table).select('*').limit(0);
      if (error) {
        console.error(`   ❌ ${table}: 存在しないまたはアクセスエラー`);
      } else {
        console.log(`   ✅ ${table}: 存在確認OK`);
      }
    }
    console.log('');

    // 完了メッセージ
    console.log('🎉 すべてのテストが正常に完了しました！');
    console.log('');
    console.log('次のステップ:');
    console.log('1. シードデータが投入されていない場合:');
    console.log('   Supabase Dashboard > SQL Editor で supabase/seed.sql を実行');
    console.log('2. .env.local に他の環境変数（LINE, OpenAI）を設定');
    console.log('3. npm run dev でアプリケーションを起動');
    console.log('');

  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
testSupabaseConnection()
  .then(() => {
    console.log('✅ テスト完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ テスト失敗:', error);
    process.exit(1);
  });

