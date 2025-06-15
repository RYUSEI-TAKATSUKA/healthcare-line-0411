# テーブル間リレーションシップ

このドキュメントでは、LINEフィットネスBOTのデータベーステーブル間の関連性をER図で表現します。

## 全体リレーションシップ図

```mermaid
erDiagram
    users ||--o{ goals : has
    users ||--o{ training_plans : creates
    users ||--o{ workout_records : records
    users ||--o{ physical_stats : tracks
    users ||--o{ consultations : requests
    users ||--o{ user_achievements : earns
    users ||--o{ task_reminders : sets
    users ||--o{ conversation_history : generates
    users ||--o{ system_logs : generates

    goals ||--o{ training_plans : generates
    training_plans ||--o{ workout_sessions : schedules
    workout_sessions ||--o{ workout_records : completed_as
    workout_sessions ||--o{ task_reminders : reminds
    achievements ||--o{ user_achievements : unlocked_by

    api_keys ||--o{ llm_models : provides_access
```

## 機能グループ別リレーションシップ

### 1. ユーザー・目標・トレーニング計画

```mermaid
erDiagram
    users ||--o{ goals : has
    users ||--o{ training_plans : creates
    goals ||--o{ training_plans : generates
    
    users {
        uuid id PK
        varchar external_line_user_id UK
        varchar display_name
        integer age
        varchar gender
        numeric height_cm
        numeric initial_weight_kg
    }
    
    goals {
        uuid id PK
        uuid user_id FK
        varchar goal_type
        text description
        jsonb target_metrics
        date start_date
        date target_date
        numeric progress_percentage
        varchar status
    }
    
    training_plans {
        uuid id PK
        uuid user_id FK
        uuid goal_id FK
        varchar name
        varchar plan_type
        date start_date
        date end_date
        varchar status
        jsonb schedule_settings
    }
```

### 2. トレーニング実行と記録

```mermaid
erDiagram
    training_plans ||--o{ workout_sessions : schedules
    workout_sessions ||--o{ workout_records : completed_as
    workout_sessions ||--o{ task_reminders : reminds
    users ||--o{ workout_records : records
    users ||--o{ physical_stats : tracks
    
    workout_sessions {
        uuid id PK
        uuid plan_id FK
        varchar name
        date scheduled_date
        varchar scheduled_time
        integer duration_minutes
        varchar session_type
        jsonb exercises
        varchar status
    }
    
    workout_records {
        uuid id PK
        uuid user_id FK
        uuid session_id FK
        date record_date
        time record_time
        varchar workout_type
        integer duration_minutes
        jsonb exercises_completed
        integer intensity_level
    }
    
    task_reminders {
        uuid id PK
        uuid user_id FK
        uuid session_id FK
        timestamp reminder_time
        varchar reminder_type
        boolean is_sent
    }
    
    physical_stats {
        uuid id PK
        uuid user_id FK
        date record_date
        numeric weight_kg
        numeric body_fat_percentage
        numeric muscle_mass_kg
        jsonb other_metrics
    }
```

### 3. コミュニケーションと相談

```mermaid
erDiagram
    users ||--o{ consultations : requests
    users ||--o{ conversation_history : generates
    
    consultations {
        uuid id PK
        uuid user_id FK
        varchar category
        text question
        text answer
        jsonb context_data
    }
    
    conversation_history {
        uuid id PK
        uuid user_id FK
        varchar message_type
        text user_message
        text bot_message
        jsonb context_data
    }
```

### 4. アチーブメントとシステム

```mermaid
erDiagram
    users ||--o{ user_achievements : earns
    achievements ||--o{ user_achievements : unlocked_by
    api_keys ||--o{ llm_models : provides_access
    
    achievements {
        uuid id PK
        varchar code UK
        varchar name
        text description
        varchar category
        varchar icon_url
        jsonb requirements
        integer xp_reward
    }
    
    user_achievements {
        uuid id PK
        uuid user_id FK
        uuid achievement_id FK
        timestamp earned_at
        integer progress_percentage
    }
    
    api_keys {
        uuid id PK
        varchar service
        varchar key_name
        varchar key_value
        varchar status
        timestamp expires_at
    }
    
    llm_models {
        uuid id PK
        varchar model_name UK
        varchar provider
        uuid api_key_id FK
        integer max_tokens
        integer context_window
        jsonb parameters
        varchar status
    }
    
    settings {
        uuid id PK
        varchar setting_key UK
        text setting_value
        varchar data_type
        varchar group_name
    }
    
    system_logs {
        uuid id PK
        varchar log_level
        text message
        jsonb context
        uuid user_id FK
        varchar ip_address
    }
```

## 注意点

1. すべての外部キー制約は、親テーブルの削除時の挙動が定義されています（ON DELETE CASCADE または ON DELETE SET NULL）
2. 一部のテーブルは、1対多関係で複数のテーブルと関連付けられています
3. ユーザーテーブルはシステムの中心に位置し、多くのテーブルから参照されています
4. JSONB型カラムは複雑な構造データを保存するために使用されています

---

> **更新履歴**
> - 2024-04-11: 初版作成 