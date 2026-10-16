import { makeTimeline } from "../brand/timeline";
import meta from "./audio_meta.json";

/* «Claude Code безкоштовно назавжди» — Ron TV. YouTube-урок 16:9 (1280×720 → --scale=1.5 → 1080p). */
export const ORDER = ["hook", "problem", "secret", "install", "openrouter", "router", "key", "logout", "test", "cta"] as const;
export type SceneId = typeof ORDER[number];

export const T = makeTimeline(meta as any, ORDER, {
  extra: { hook: 18, problem: 22, secret: 20, install: 24, openrouter: 24, router: 24, key: 24, logout: 22, test: 24, cta: 96 },
  swap: [
    [["клод", "код"], ["Claude", "Code"]],
    [["клод", "логаут"], ["claude", "logout"]],
    [["ен", "пі", "ем"], ["npm"]],
    [["оупенроутер"], ["OpenRouter"]],
    [["антігрейвіті"], ["Antigravity"]],
    [["таймауту"], ["Timeout"]],
    [["клода"], ["Claude"]],
    [["клод"], ["Claude"]],
    [["логаут"], ["logout"]],
  ],
  keys: {
    hook: ["користуватися", "ціна", "безкоштовний"],
    problem: ["оболонка", "двигун", "серверах", "платиш"],
    secret: ["секрет", "замінити", "нульовим", "офіційно"],
    install: ["перший", "термінал", "глобально"],
    openrouter: ["другий", "сервіс", "моделей", "ключ"],
    router: ["фішка", "маршрутизатор", "серверами", "зникають"],
    key: ["третій", "змінні", "редакторі", "готово"],
    logout: ["четвертий", "вийти", "акаунта", "підписку"],
    test: ["тест", "думає", "код", "безкоштовно"],
    cta: ["описі", "підпишись", "коментарях"],
  },
});

export const { WIN, LEAD_F, wf, af, TOTAL_F } = T;
export const captions = T.captions;
