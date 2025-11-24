-- LINEフィットネスBOT - 初期データベーススキーマ
-- 15テーブル定義 + インデックス + 外部キー制約

-- ============================================================================
-- 1. usersテーブル (ユーザー基本情報)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_line_user_id VARCHAR(64) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  age INTEGER,
  gender VARCHAR(16),
  height_cm NUMERIC(5,2),
  initial_weight_kg NUMERIC(5,2),
  email VARCHAR(255),
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_users_external_line_user_id ON users(external_line_user_id);
CREATE INDEX idx_users_last_active ON users(last_active);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;

COMMENT ON TABLE users IS 'ユーザーの基本情報を管理するテーブル';
COMMENT ON COLUMN users.external_line_user_id IS 'LINE Platform提供のユーザーID';
COMMENT ON COLUMN users.initial_weight_kg IS '登録時の体重（継続的な体重管理はphysical_statsテーブルで行う）';

-- ============================================================================
-- 2. goalsテーブル (目標)
-- ============================================================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal_type VARCHAR(32) NOT NULL,
  description TEXT NOT NULL,
  motivation TEXT,
  target_metrics JSONB NOT NULL,
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_target_date ON goals(target_date);

COMMENT ON TABLE goals IS 'ユーザーの健康・フィットネス目標を管理するテーブル';
COMMENT ON COLUMN goals.goal_type IS '目標タイプ (weight_loss/muscle_gain/endurance等)';
COMMENT ON COLUMN goals.status IS '状態 (active/achieved/abandoned)';

-- ============================================================================
-- 3. training_plansテーブル (トレーニング計画)
-- ============================================================================
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  plan_type VARCHAR(32) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  schedule_settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_training_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_training_plans_goal FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL
);

CREATE INDEX idx_training_plans_user_id ON training_plans(user_id);
CREATE INDEX idx_training_plans_goal_id ON training_plans(goal_id);
CREATE INDEX idx_training_plans_status ON training_plans(status);
CREATE INDEX idx_training_plans_date_range ON training_plans(start_date, end_date);

COMMENT ON TABLE training_plans IS '目標達成のためのトレーニングプランを管理するテーブル';
COMMENT ON COLUMN training_plans.status IS '状態 (active/completed/abandoned)';

-- ============================================================================
-- 4. workout_sessionsテーブル (トレーニングセッション)
-- ============================================================================
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time VARCHAR(16),
  duration_minutes INTEGER NOT NULL,
  session_type VARCHAR(32) NOT NULL,
  exercises JSONB NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_workout_sessions_plan FOREIGN KEY (plan_id) REFERENCES training_plans(id) ON DELETE CASCADE
);

CREATE INDEX idx_workout_sessions_plan_id ON workout_sessions(plan_id);
CREATE INDEX idx_workout_sessions_date ON workout_sessions(scheduled_date);
CREATE INDEX idx_workout_sessions_status ON workout_sessions(status);

COMMENT ON TABLE workout_sessions IS '計画された個別トレーニングセッションを管理するテーブル';
COMMENT ON COLUMN workout_sessions.status IS '状態 (scheduled/completed/skipped/cancelled)';

-- ============================================================================
-- 5. workout_recordsテーブル (トレーニング記録)
-- ============================================================================
CREATE TABLE IF NOT EXISTS workout_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  record_date DATE NOT NULL,
  record_time TIME,
  workout_type VARCHAR(32) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  exercises_completed JSONB NOT NULL,
  intensity_level INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_workout_records_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_workout_records_session FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE SET NULL,
  CONSTRAINT chk_intensity_level CHECK (intensity_level >= 1 AND intensity_level <= 10)
);

CREATE INDEX idx_workout_records_user_id ON workout_records(user_id);
CREATE INDEX idx_workout_records_session_id ON workout_records(session_id);
CREATE INDEX idx_workout_records_date ON workout_records(record_date);
CREATE INDEX idx_workout_records_type ON workout_records(workout_type);

COMMENT ON TABLE workout_records IS '実施されたトレーニングの記録を管理するテーブル';
COMMENT ON COLUMN workout_records.intensity_level IS '主観的強度レベル (1-10)';

-- ============================================================================
-- 6. physical_statsテーブル (身体指標)
-- ============================================================================
CREATE TABLE IF NOT EXISTS physical_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  record_date DATE NOT NULL,
  weight_kg NUMERIC(5,2),
  body_fat_percentage NUMERIC(4,2),
  muscle_mass_kg NUMERIC(5,2),
  other_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_physical_stats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_physical_stats_user_id ON physical_stats(user_id);
CREATE INDEX idx_physical_stats_date ON physical_stats(record_date);
CREATE UNIQUE INDEX idx_physical_stats_user_date ON physical_stats(user_id, record_date);

COMMENT ON TABLE physical_stats IS '体重・体脂肪率などの身体測定値を管理するテーブル';

-- ============================================================================
-- 7. consultationsテーブル (健康相談)
-- ============================================================================
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category VARCHAR(32) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  context_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_consultations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_consultations_user_id ON consultations(user_id);
CREATE INDEX idx_consultations_category ON consultations(category);
CREATE INDEX idx_consultations_created_at ON consultations(created_at);

COMMENT ON TABLE consultations IS '健康・フィットネスに関する質問と回答を管理するテーブル';
COMMENT ON COLUMN consultations.category IS '相談カテゴリ (training/nutrition/health等)';

-- ============================================================================
-- 8. achievementsテーブル (アチーブメント定義)
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(32) NOT NULL,
  icon_url VARCHAR(255),
  requirements JSONB NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_achievements_code ON achievements(code);
CREATE INDEX idx_achievements_category ON achievements(category);

COMMENT ON TABLE achievements IS '達成可能な称号・バッジの定義を管理するテーブル';
COMMENT ON COLUMN achievements.category IS 'カテゴリ (streak/strength/cardio/nutrition等)';

-- ============================================================================
-- 9. user_achievementsテーブル (ユーザーアチーブメント)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  progress_percentage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_achievements_achievement FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  CONSTRAINT chk_progress_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE UNIQUE INDEX idx_user_achievements_user_achievement ON user_achievements(user_id, achievement_id);

COMMENT ON TABLE user_achievements IS 'ユーザーが獲得した称号・バッジを管理するテーブル';

-- ============================================================================
-- 10. user_sessionsテーブル (ユーザーセッション)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  user_id UUID PRIMARY KEY,
  current_flow VARCHAR(50),
  current_step VARCHAR(50),
  temp_data JSONB,
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_updated ON user_sessions(updated_at);

COMMENT ON TABLE user_sessions IS 'SessionManagerが使用する、ユーザーごとの会話状態を管理するテーブル';
COMMENT ON COLUMN user_sessions.current_flow IS '実行中のフローID (例: goal_setting)';
COMMENT ON COLUMN user_sessions.temp_data IS 'フロー実行中の一時データ';

-- ============================================================================
-- 11. task_remindersテーブル (タスクリマインダー)
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_type VARCHAR(32) NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_reminders_session FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_task_reminders_user_id ON task_reminders(user_id);
CREATE INDEX idx_task_reminders_session_id ON task_reminders(session_id);
CREATE INDEX idx_task_reminders_time ON task_reminders(reminder_time);
CREATE INDEX idx_task_reminders_sent ON task_reminders(is_sent);

COMMENT ON TABLE task_reminders IS 'トレーニングリマインド設定を管理するテーブル';
COMMENT ON COLUMN task_reminders.reminder_type IS '種別 (before_session/missed_session等)';

-- ============================================================================
-- 12. conversation_historyテーブル (会話履歴)
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message_type VARCHAR(20) NOT NULL,
  user_message TEXT,
  bot_message TEXT,
  context_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_conversation_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_conversation_history_user_id ON conversation_history(user_id);
CREATE INDEX idx_conversation_history_created_at ON conversation_history(created_at);
CREATE INDEX idx_conversation_history_message_type ON conversation_history(message_type);

COMMENT ON TABLE conversation_history IS 'LLMとの対話履歴を保存するテーブル';
COMMENT ON COLUMN conversation_history.message_type IS 'メッセージ種別 (user/bot/system)';

-- ============================================================================
-- 13. api_keysテーブル (APIキー)
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(50) NOT NULL,
  key_name VARCHAR(100) NOT NULL,
  key_value VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_api_keys_service_name ON api_keys(service, key_name);
CREATE INDEX idx_api_keys_status ON api_keys(status);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);

COMMENT ON TABLE api_keys IS '外部API連携用のキー情報を管理するテーブル';
COMMENT ON COLUMN api_keys.key_value IS '暗号化されたAPIキー値';
COMMENT ON COLUMN api_keys.status IS '状態 (active/inactive/revoked)';

-- ============================================================================
-- 14. llm_modelsテーブル (LLMモデル)
-- ============================================================================
CREATE TABLE IF NOT EXISTS llm_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name VARCHAR(100) NOT NULL UNIQUE,
  provider VARCHAR(50) NOT NULL,
  api_key_id UUID,
  max_tokens INTEGER NOT NULL DEFAULT 4096,
  context_window INTEGER NOT NULL DEFAULT 8000,
  parameters JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_llm_models_api_key FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_llm_models_name ON llm_models(model_name);
CREATE INDEX idx_llm_models_provider ON llm_models(provider);
CREATE INDEX idx_llm_models_status ON llm_models(status);

COMMENT ON TABLE llm_models IS '利用可能なLLMモデル情報を管理するテーブル';
COMMENT ON COLUMN llm_models.provider IS 'モデルプロバイダー (OpenAI/Azure/Anthropic等)';
COMMENT ON COLUMN llm_models.status IS 'モデルの状態 (active/inactive/deprecated)';

-- ============================================================================
-- 15. settingsテーブル (システム設定)
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  data_type VARCHAR(20) NOT NULL DEFAULT 'string',
  description TEXT,
  group_name VARCHAR(50) NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_settings_key ON settings(setting_key);
CREATE INDEX idx_settings_group ON settings(group_name);

COMMENT ON TABLE settings IS 'システム設定情報を管理するテーブル';
COMMENT ON COLUMN settings.data_type IS '設定値のデータ型 (string/integer/boolean/json)';

-- ============================================================================
-- 16. system_logsテーブル (システムログ)
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_level VARCHAR(20) NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  context JSONB,
  user_id UUID,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_system_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_system_logs_level ON system_logs(log_level);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE UNIQUE INDEX idx_system_logs_created_level ON system_logs(created_at, log_level) WHERE log_level IN ('error', 'critical');

COMMENT ON TABLE system_logs IS 'システムログ情報を管理するテーブル';
COMMENT ON COLUMN system_logs.log_level IS 'ログレベル (debug/info/warning/error/critical)';

-- ============================================================================
-- トリガー: updated_at自動更新
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにupdated_atトリガーを設定
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON training_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_llm_models_updated_at BEFORE UPDATE ON llm_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

