type RichMenuAlias = 'default' | 'goal-setting' | 'workout' | 'mypage';

interface RichMenuConfig {
  alias: RichMenuAlias;
  description: string;
}

export class RichMenuManager {
  private readonly menus: Record<RichMenuAlias, RichMenuConfig>;

  constructor() {
    this.menus = {
      default: {
        alias: 'default',
        description: 'メインメニュー',
      },
      'goal-setting': {
        alias: 'goal-setting',
        description: '目標設定メニュー',
      },
      workout: {
        alias: 'workout',
        description: 'トレーニングメニュー',
      },
      mypage: {
        alias: 'mypage',
        description: 'マイページメニュー',
      },
    };
  }

  resolve(flow: string | null): RichMenuConfig {
    if (!flow) return this.menus.default;
    if (flow.includes('goal')) return this.menus['goal-setting'];
    if (flow.includes('workout')) return this.menus.workout;
    if (flow.includes('mypage')) return this.menus.mypage;
    return this.menus.default;
  }
}
