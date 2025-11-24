-- LINEフィットネスBOT - 行レベルセキュリティ (RLS) ポリシー設定
-- user_idベースのアクセス制御を実装

-- ============================================================================
-- RLS有効化
-- ============================================================================

-- 1. users テーブル
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. goals テーブル
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- 3. training_plans テーブル
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

-- 4. workout_sessions テーブル
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- 5. workout_records テーブル
ALTER TABLE workout_records ENABLE ROW LEVEL SECURITY;

-- 6. physical_stats テーブル
ALTER TABLE physical_stats ENABLE ROW LEVEL SECURITY;

-- 7. consultations テーブル
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- 8. achievements テーブル (全ユーザー読み取り可能)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 9. user_achievements テーブル
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- 10. user_sessions テーブル
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 11. task_reminders テーブル
ALTER TABLE task_reminders ENABLE ROW LEVEL SECURITY;

-- 12. conversation_history テーブル
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- 13. api_keys テーブル (管理者のみ)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- 14. llm_models テーブル (管理者のみ)
ALTER TABLE llm_models ENABLE ROW LEVEL SECURITY;

-- 15. settings テーブル (管理者のみ)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 16. system_logs テーブル (管理者のみ)
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLSポリシー定義
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. users テーブル
-- ----------------------------------------------------------------------------
-- ユーザーは自分のデータを全て操作可能
CREATE POLICY "users_own_data_policy"
  ON users
  FOR ALL
  USING (id = auth.uid());

-- 管理者は全ユーザー閲覧可能
CREATE POLICY "admins_can_read_users"
  ON users
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- ----------------------------------------------------------------------------
-- 2. goals テーブル
-- ----------------------------------------------------------------------------
CREATE POLICY "users_manage_own_goals"
  ON goals
  FOR ALL
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 3. training_plans テーブル
-- ----------------------------------------------------------------------------
CREATE POLICY "users_manage_own_training_plans"
  ON training_plans
  FOR ALL
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4. workout_sessions テーブル
-- ----------------------------------------------------------------------------
-- ユーザーは自分のプランに紐づくセッションのみアクセス可能
CREATE POLICY "users_manage_own_workout_sessions"
  ON workout_sessions
  FOR ALL
  USING (
    plan_id IN (
      SELECT id FROM training_plans WHERE user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 5. workout_records テーブル
-- ----------------------------------------------------------------------------
CREATE POLICY "users_manage_own_workout_records"
  ON workout_records
  FOR ALL
  USING (user_id = auth.uid());

-- トレーナーは担当クライアントのデータ閲覧可能
CREATE POLICY "trainers_can_read_client_workout_records"
  ON workout_records
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'trainer' 
    AND (auth.jwt() -> 'client_ids')::jsonb ? user_id::text
  );

-- ----------------------------------------------------------------------------
-- 6. physical_stats テーブル
-- ----------------------------------------------------------------------------
CREATE POLICY "users_manage_own_physical_stats"
  ON physical_stats
  FOR ALL
  USING (user_id = auth.uid());

-- トレーナーは担当クライアントのデータ閲覧可能
CREATE POLICY "trainers_can_read_client_physical_stats"
  ON physical_stats
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'trainer' 
    AND (auth.jwt() -> 'client_ids')::jsonb ? user_id::text
  );

-- ----------------------------------------------------------------------------
-- 7. consultations テーブル
-- ----------------------------------------------------------------------------
CREATE POLICY "users_manage_own_consultations"
  ON consultations
  FOR ALL
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 8. achievements テーブル
-- ----------------------------------------------------------------------------
-- 全ユーザーが閲覧可能（獲得可能なアチーブメント一覧）
CREATE POLICY "public_readable_achievements"
  ON achievements
  FOR SELECT
  USING (true);

-- 管理者のみ変更可能
CREATE POLICY "admins_can_manage_achievements"
  ON achievements
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ----------------------------------------------------------------------------
-- 9. user_achievements テーブル
-- ----------------------------------------------------------------------------
CREATE POLICY "users_manage_own_user_achievements"
  ON user_achievements
  FOR ALL
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 10. user_sessions テーブル
-- ----------------------------------------------------------------------------
CREATE POLICY "users_manage_own_sessions"
  ON user_sessions
  FOR ALL
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 11. task_reminders テーブル
-- ----------------------------------------------------------------------------
CREATE POLICY "users_manage_own_task_reminders"
  ON task_reminders
  FOR ALL
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 12. conversation_history テーブル
-- ----------------------------------------------------------------------------
CREATE POLICY "users_manage_own_conversation_history"
  ON conversation_history
  FOR ALL
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 13. api_keys テーブル
-- ----------------------------------------------------------------------------
-- 管理者のみアクセス可能
CREATE POLICY "admin_only_api_keys"
  ON api_keys
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ----------------------------------------------------------------------------
-- 14. llm_models テーブル
-- ----------------------------------------------------------------------------
-- 管理者のみアクセス可能
CREATE POLICY "admin_only_llm_models"
  ON llm_models
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ----------------------------------------------------------------------------
-- 15. settings テーブル
-- ----------------------------------------------------------------------------
-- 管理者のみアクセス可能
CREATE POLICY "admin_only_settings"
  ON settings
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ----------------------------------------------------------------------------
-- 16. system_logs テーブル
-- ----------------------------------------------------------------------------
-- 管理者のみアクセス可能
CREATE POLICY "admin_only_system_logs"
  ON system_logs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- サービスロール用のバイパス設定
-- ============================================================================
-- 注意: アプリケーションコードからはサービスロールでRLSをバイパスしないこと
-- サービスロールはマイグレーションやバッチ処理などのシステム操作のみに使用
-- 通常のユーザーリクエストは必ずauth.uid()を使用したRLSポリシーを通すこと

COMMENT ON TABLE users IS 'RLS有効: ユーザーは自分のデータのみアクセス可能';
COMMENT ON TABLE goals IS 'RLS有効: ユーザーは自分の目標のみアクセス可能';
COMMENT ON TABLE training_plans IS 'RLS有効: ユーザーは自分のプランのみアクセス可能';
COMMENT ON TABLE workout_sessions IS 'RLS有効: ユーザーは自分のプランのセッションのみアクセス可能';
COMMENT ON TABLE workout_records IS 'RLS有効: ユーザーは自分の記録のみアクセス可能、トレーナーは担当クライアント閲覧可';
COMMENT ON TABLE physical_stats IS 'RLS有効: ユーザーは自分の身体指標のみアクセス可能、トレーナーは担当クライアント閲覧可';
COMMENT ON TABLE consultations IS 'RLS有効: ユーザーは自分の相談のみアクセス可能';
COMMENT ON TABLE achievements IS 'RLS有効: 全ユーザー閲覧可能、管理者のみ変更可';
COMMENT ON TABLE user_achievements IS 'RLS有効: ユーザーは自分のアチーブメントのみアクセス可能';
COMMENT ON TABLE user_sessions IS 'RLS有効: ユーザーは自分のセッションのみアクセス可能';
COMMENT ON TABLE task_reminders IS 'RLS有効: ユーザーは自分のリマインダーのみアクセス可能';
COMMENT ON TABLE conversation_history IS 'RLS有効: ユーザーは自分の会話履歴のみアクセス可能';
COMMENT ON TABLE api_keys IS 'RLS有効: 管理者のみアクセス可能';
COMMENT ON TABLE llm_models IS 'RLS有効: 管理者のみアクセス可能';
COMMENT ON TABLE settings IS 'RLS有効: 管理者のみアクセス可能';
COMMENT ON TABLE system_logs IS 'RLS有効: 管理者のみアクセス可能';

