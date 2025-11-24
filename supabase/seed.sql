-- LINEフィットネスBOT - 初期シードデータ
-- achievements, llm_models, settings の初期データを投入

-- ============================================================================
-- 1. achievementsテーブル - 初期アチーブメント定義
-- ============================================================================

INSERT INTO achievements (code, name, description, category, icon_url, requirements, xp_reward) VALUES
  -- マイルストーン系
  ('first_workout', 'ファーストステップ', '初めてのトレーニングを記録しました！', 'milestone', '/icons/first_workout.png', '{"workout_count": 1}', 50),
  ('week_1_complete', '1週間達成', '1週間継続してトレーニングを実施しました', 'milestone', '/icons/week_1.png', '{"active_days": 7}', 100),
  ('month_1_complete', '1ヶ月達成', '1ヶ月継続してトレーニングを実施しました', 'milestone', '/icons/month_1.png', '{"active_days": 30}', 500),
  ('goal_first_achieved', '初目標達成', '初めて目標を達成しました！', 'milestone', '/icons/goal_achieved.png', '{"goals_achieved": 1}', 300),
  
  -- ストリーク系
  ('streak_3days', '3日連続', '3日間連続でトレーニングを記録', 'streak', '/icons/streak_3.png', '{"consecutive_days": 3}', 50),
  ('streak_7days', '7日間ストリーク', '7日間連続でトレーニングを記録', 'streak', '/icons/streak_7.png', '{"consecutive_days": 7}', 100),
  ('streak_14days', '2週間ストリーク', '2週間連続でトレーニングを記録', 'streak', '/icons/streak_14.png', '{"consecutive_days": 14}', 200),
  ('streak_30days', '30日間ストリーク', '30日間連続でトレーニングを記録', 'streak', '/icons/streak_30.png', '{"consecutive_days": 30}', 500),
  ('streak_100days', '100日間ストリーク', '100日間連続でトレーニングを記録', 'streak', '/icons/streak_100.png', '{"consecutive_days": 100}', 2000),
  
  -- 筋トレ系
  ('strength_beginner', '筋トレ入門', '筋力トレーニングを10回実施', 'strength', '/icons/strength_beginner.png', '{"strength_workout_count": 10}', 100),
  ('strength_intermediate', '筋トレ中級', '筋力トレーニングを50回実施', 'strength', '/icons/strength_intermediate.png', '{"strength_workout_count": 50}', 300),
  ('strength_advanced', '筋トレ上級', '筋力トレーニングを100回実施', 'strength', '/icons/strength_advanced.png', '{"strength_workout_count": 100}', 800),
  ('strength_master', '筋トレマスター', '筋力トレーニングを300回実施', 'strength', '/icons/strength_master.png', '{"strength_workout_count": 300}', 2000),
  
  -- 有酸素運動系
  ('cardio_beginner', '有酸素入門', '有酸素運動を10回実施', 'cardio', '/icons/cardio_beginner.png', '{"cardio_workout_count": 10}', 100),
  ('cardio_intermediate', '有酸素中級', '有酸素運動を50回実施', 'cardio', '/icons/cardio_intermediate.png', '{"cardio_workout_count": 50}', 300),
  ('cardio_advanced', '有酸素上級', '有酸素運動を100回実施', 'cardio', '/icons/cardio_advanced.png', '{"cardio_workout_count": 100}', 800),
  ('cardio_master', '有酸素マスター', '有酸素運動を300回実施', 'cardio', '/icons/cardio_master.png', '{"cardio_workout_count": 300}', 2000),
  
  -- 時間系
  ('total_time_10h', '累計10時間', 'トレーニング累計時間10時間達成', 'time', '/icons/time_10h.png', '{"total_minutes": 600}', 200),
  ('total_time_50h', '累計50時間', 'トレーニング累計時間50時間達成', 'time', '/icons/time_50h.png', '{"total_minutes": 3000}', 500),
  ('total_time_100h', '累計100時間', 'トレーニング累計時間100時間達成', 'time', '/icons/time_100h.png', '{"total_minutes": 6000}', 1000),
  
  -- 体重管理系
  ('weight_loss_3kg', '減量3kg達成', '体重を3kg減らしました', 'weight', '/icons/weight_loss_3kg.png', '{"weight_loss_kg": 3}', 300),
  ('weight_loss_5kg', '減量5kg達成', '体重を5kg減らしました', 'weight', '/icons/weight_loss_5kg.png', '{"weight_loss_kg": 5}', 500),
  ('weight_loss_10kg', '減量10kg達成', '体重を10kg減らしました', 'weight', '/icons/weight_loss_10kg.png', '{"weight_loss_kg": 10}', 1000),
  ('weight_maintain_30days', '体重維持30日', '30日間目標体重を維持しました', 'weight', '/icons/weight_maintain.png', '{"maintain_days": 30}', 400),
  
  -- 記録系
  ('record_physical_stats_10', '身体測定10回', '身体測定を10回記録しました', 'record', '/icons/stats_10.png', '{"physical_stats_count": 10}', 100),
  ('record_physical_stats_50', '身体測定50回', '身体測定を50回記録しました', 'record', '/icons/stats_50.png', '{"physical_stats_count": 50}', 300),
  ('record_physical_stats_100', '身体測定100回', '身体測定を100回記録しました', 'record', '/icons/stats_100.png', '{"physical_stats_count": 100}', 600),
  
  -- 相談系
  ('consultation_first', '初相談', '初めて健康相談を利用しました', 'consultation', '/icons/consultation_first.png', '{"consultation_count": 1}', 50),
  ('consultation_10', '相談10回', '健康相談を10回利用しました', 'consultation', '/icons/consultation_10.png', '{"consultation_count": 10}', 200),
  
  -- 早起き系
  ('early_bird_10', '早起き10回', '朝6時前にトレーニングを10回実施', 'early_bird', '/icons/early_bird.png', '{"early_workout_count": 10}', 200),
  
  -- 完璧主義系
  ('perfect_week', '完璧な1週間', '計画したトレーニングを1週間完璧に実施', 'perfection', '/icons/perfect_week.png', '{"perfect_week_count": 1}', 300);

-- ============================================================================
-- 2. settingsテーブル - システム設定のデフォルト値
-- ============================================================================

INSERT INTO settings (setting_key, setting_value, data_type, description, group_name) VALUES
  -- システム全般
  ('system_name', 'LINEフィットネスBOT', 'string', 'システム名称', 'general'),
  ('system_version', '1.0.0', 'string', 'システムバージョン', 'general'),
  ('maintenance_mode', 'false', 'boolean', 'メンテナンスモード（true/false）', 'general'),
  
  -- セッション設定
  ('session_timeout_minutes', '30', 'integer', 'セッションタイムアウト時間（分）', 'session'),
  ('session_cleanup_interval_hours', '24', 'integer', 'セッションクリーンアップ間隔（時間）', 'session'),
  
  -- LLM設定
  ('default_llm_provider', 'openai', 'string', 'デフォルトLLMプロバイダー', 'llm'),
  ('default_llm_model', 'gpt-4o-mini', 'string', 'デフォルトLLMモデル', 'llm'),
  ('llm_temperature', '0.7', 'string', 'LLM温度パラメータ', 'llm'),
  ('llm_max_tokens', '2000', 'integer', 'LLM最大トークン数', 'llm'),
  ('llm_timeout_seconds', '30', 'integer', 'LLMタイムアウト秒数', 'llm'),
  
  -- リマインダー設定
  ('reminder_enabled', 'true', 'boolean', 'リマインダー機能有効化', 'reminder'),
  ('reminder_default_time', '09:00', 'string', 'リマインダーデフォルト時刻', 'reminder'),
  ('reminder_before_minutes', '60', 'integer', 'セッション前リマインド時間（分）', 'reminder'),
  
  -- 通知設定
  ('notification_enabled', 'true', 'boolean', '通知機能有効化', 'notification'),
  ('notification_achievement_enabled', 'true', 'boolean', 'アチーブメント通知', 'notification'),
  ('notification_goal_progress_enabled', 'true', 'boolean', '目標進捗通知', 'notification'),
  
  -- データ保持設定
  ('conversation_history_retention_days', '180', 'integer', '会話履歴保持日数', 'data_retention'),
  ('system_log_retention_days', '90', 'integer', 'システムログ保持日数', 'data_retention'),
  
  -- フィットネス設定
  ('default_workout_duration_minutes', '30', 'integer', 'デフォルトトレーニング時間（分）', 'fitness'),
  ('min_rest_day_per_week', '1', 'integer', '週あたり最小休息日数', 'fitness'),
  ('max_workout_per_week', '6', 'integer', '週あたり最大トレーニング日数', 'fitness'),
  
  -- 目標設定
  ('goal_min_duration_weeks', '4', 'integer', '目標最小期間（週）', 'goal'),
  ('goal_max_duration_weeks', '52', 'integer', '目標最大期間（週）', 'goal'),
  ('goal_progress_update_frequency_days', '7', 'integer', '目標進捗更新頻度（日）', 'goal'),
  
  -- アチーブメント設定
  ('achievement_notification_enabled', 'true', 'boolean', 'アチーブメント獲得通知', 'achievement'),
  ('achievement_display_icon', 'true', 'boolean', 'アチーブメントアイコン表示', 'achievement'),
  
  -- API制限
  ('api_rate_limit_per_minute', '60', 'integer', 'API呼び出し制限（分あたり）', 'api'),
  ('api_rate_limit_per_hour', '1000', 'integer', 'API呼び出し制限（時間あたり）', 'api');

-- ============================================================================
-- 3. llm_modelsテーブル - 利用可能なLLMモデル定義
-- ============================================================================

INSERT INTO llm_models (model_name, provider, max_tokens, context_window, parameters, status) VALUES
  -- OpenAI モデル
  ('gpt-4o-mini', 'openai', 16384, 128000, '{"temperature": 0.7, "top_p": 1.0}', 'active'),
  ('gpt-4o', 'openai', 16384, 128000, '{"temperature": 0.7, "top_p": 1.0}', 'active'),
  ('gpt-4-turbo', 'openai', 4096, 128000, '{"temperature": 0.7, "top_p": 1.0}', 'active'),
  
  -- Anthropic モデル
  ('claude-3-5-sonnet-20241022', 'anthropic', 8192, 200000, '{"temperature": 0.7, "top_p": 1.0}', 'active'),
  ('claude-3-opus-20240229', 'anthropic', 4096, 200000, '{"temperature": 0.7, "top_p": 1.0}', 'active'),
  
  -- Google モデル
  ('gemini-1.5-pro', 'google', 8192, 1048576, '{"temperature": 0.7, "top_p": 1.0}', 'active'),
  ('gemini-1.5-flash', 'google', 8192, 1048576, '{"temperature": 0.7, "top_p": 1.0}', 'active');

-- ============================================================================
-- インデックス再構築（念のため）
-- ============================================================================

REINDEX TABLE achievements;
REINDEX TABLE settings;
REINDEX TABLE llm_models;

-- ============================================================================
-- シードデータ投入完了メッセージ
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'シードデータの投入が完了しました:';
  RAISE NOTICE '  - achievements: 30件のアチーブメント定義';
  RAISE NOTICE '  - settings: 28件のシステム設定';
  RAISE NOTICE '  - llm_models: 7件のLLMモデル定義';
END $$;

