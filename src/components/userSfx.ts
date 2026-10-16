// Стартовий пак звуків (50 wav, Mixkit) — public/sfx/u/<cat>/*.wav, wav 44.1k.
// peak = секунда найгучнішого моменту від початку файлу; end = де звук стихає (-40 dB від піку).
// Ставити звук треба так, щоб ПІК збігся з подією на екрані: from = кадр події − peak·fps → hit().
// db = пік файлу; тихі (db < -6) давати гучніше за решту.
export type UserSfx = { src: string; peak: number; end: number; db: number; use: string };

const u = (src: string, peak: number, end: number, db: number, use: string): UserSfx => ({ src: `sfx/u/${src}.wav`, peak, end, db, use });

export const USFX = {
  // ── WHOOSH: переходи, вльоти, зміна сцени
  w01: u("whoosh/01-cinematic-whoosh-fast-transition", 1.07, 1.29, -0.5, "великий кінематографічний перехід між блоками; довгий розгін 0.5с"),
  w02: u("whoosh/02-fast-small-sweep-transition", 0.33, 0.53, -0.1, "малий свайп: картка/слово в'їжджає збоку"),
  w03: u("whoosh/03-air-zoom-vacuum", 0.45, 0.54, -1.0, "наїзд/зум камери, всмоктування в обʼєкт"),
  w04: u("whoosh/04-fast-whoosh-transition", 0.72, 0.75, -1.1, "швидкий кат між сценами"),
  w05: u("whoosh/05-vacuum-swoosh-transition", 1.57, 1.97, -0.6, "довгий густий свуш під коло-шторку / iris на 1.5с"),
  w06: u("whoosh/06-technology-transition-slide", 0.12, 0.50, -6.7, "тех-слайд UI-панелі (тихий — гучніше)"),
  w07: u("whoosh/07-short-transition-sweep", 0.49, 0.53, -2.8, "короткий sweep під появу рядка"),
  w08: u("whoosh/08-fast-transitions-swoosh", 0.11, 0.24, -3.9, "мікро-свуш на кожне слово/чип — найчастіший"),
  w09: u("whoosh/09-fast-sci-fi-transition-sweep", 0.34, 0.60, -3.4, "sci-fi свуш: AI/нейромережа, цифрові переходи"),
  w10: u("whoosh/10-quick-metal-transition-sweep", 0.61, 1.36, -1.5, "металевий свуш з хвостом: логотип/3D-плитка обертається"),
  // ── IMPACT: сильна доля, приземлення, акцентне слово, хук
  i11: u("impact/11-cinematic-whoosh-deep-impact", 0.64, 1.72, -0.4, "свуш+бас: головна цифра/слово хука падає"),
  i12: u("impact/12-movie-trailer-epic-impact", 0.98, 2.93, -0.7, "трейлерний удар: розкриття головного факту"),
  i13: u("impact/13-big-cinematic-impact", 2.18, 5.24, -0.4, "дуже великий удар з довгим розгоном — 1 раз на ролик max"),
  i14: u("impact/14-movie-impact-intro-presentation", 1.17, 4.91, -0.8, "інтро-удар: перший кадр / лого бренду"),
  i15: u("impact/15-reverse-cinematic-impact-trailer", 0.12, 9.97, -0.1, "удар одразу + довгий хвіст: різати dur ~1.5-2с"),
  i16: u("impact/16-movie-logo-intro-impact", 4.44, 7.88, -1.0, "логотип-інтро з 4с розгоном: фінальний CTA/лого"),
  i17: u("impact/17-quick-zoom-impact", 0.51, 0.66, -1.0, "crash-zoom на обʼєкт / цифру"),
  i18: u("impact/18-exciting-fast-hit", 0.23, 0.36, -7.5, "легкий швидкий хіт на ключове слово (тихий — гучніше)"),
  // ── CLICKS: курсор, UI, набір тексту
  c19: u("clicks/19-fast-double-click-on-mouse", 0.20, 0.30, -3.9, "подвійний клік курсора"),
  c20: u("clicks/20-select-click", 0.06, 0.27, -4.0, "вибір пункту меню/кнопки"),
  c21: u("clicks/21-typing-on-a-laptop-keyboard", 0.0, 19.6, -1.8, "друк промта: різати dur під довжину набору"),
  c22: u("clicks/22-mouse-click-close", 0.13, 0.14, -1.0, "чіткий клік мишею (закрити/натиснути)"),
  c23: u("clicks/23-cool-interface-click-tone", 0.0, 0.04, -6.1, "мікро-тон UI: тогл, чекбокс, поява іконки"),
  c24: u("clicks/24-typewriter-soft-click", 0.10, 0.15, -5.8, "друкарська машинка — по одному на слово субтитру"),
  c25: u("clicks/25-modern-click-box-check", 0.10, 0.17, -10.0, "галочка в чекбоксі (дуже тихий — гучніше)"),
  c26: u("clicks/26-clear-mouse-clicks", 0.0, 0.22, -1.0, "серія кліків"),
  // ── POP: поява стікерів, емодзі, карток, бейджів
  p27: u("pop/27-long-pop", 0.03, 0.22, -2.0, "поп стікера/емодзі з пружиною"),
  p28: u("pop/28-hard-pop-click", 0.04, 0.08, -1.0, "жорсткий поп: бейдж/цифра ляскає"),
  p29: u("pop/29-message-pop-alert", 0.06, 0.08, -3.2, "повідомлення/чат-бабл"),
  p30: u("pop/30-explainer-video-pops-whoosh-light-pop", 0.02, 0.15, -2.0, "легкий поп — дефолт на кожне слово/іконку"),
  p31: u("pop/31-bubble-pop-up-alert-notification", 0.04, 0.31, -5.0, "бульбашка-сповіщення, лайк, коментар"),
  p32: u("pop/32-dry-pop-up-notification-alert", 0.13, 0.25, -5.0, "сухий поп: пуш-нотифікація / картка"),
  // ── GLITCH: AI, помилка, «зламалось», перемикання реальностей
  g33: u("glitch/33-small-electric-glitch", 0.33, 0.49, -0.3, "малий електро-глітч на слово"),
  g34: u("glitch/34-glitch-static", 0.37, 0.56, -0.3, "статика: екран-перешкода, фейк"),
  g35: u("glitch/35-glitch-sci-fi-rewind-transition", 0.36, 3.51, -5.3, "перемотка назад / «а тепер правда» (різати dur)"),
  g36: u("glitch/36-intro-text-glitch", 1.32, 3.55, -1.0, "глітч-поява заголовка"),
  g37: u("glitch/37-virtual-quick-glitch", 1.32, 1.55, -1.0, "цифровий перехід між сценами"),
  g38: u("glitch/38-digital-glitch-break", 0.01, 0.56, -1.2, "злам: помилка, червоний хрест, «міф»"),
  // ── DING: правильно/неправильно, успіх, сповіщення
  d39: u("ding/39-correct-answer-tone", 0.02, 0.56, -2.0, "✅ правильно / факт підтверджено"),
  d40: u("ding/40-bell-notification", 0.47, 2.44, -3.0, "дзвіночок: нагадування, CTA «підпишись» 🔔"),
  d41: u("ding/41-positive-notification", 0.18, 1.74, -3.6, "позитивний результат, готово"),
  d42: u("ding/42-confirmation-tone", 0.19, 0.71, -0.6, "підтвердження дії, «збережено»"),
  d43: u("ding/43-wrong-answer-fail-notification", 0.14, 1.51, -0.4, "❌ неправильно / міф / помилка"),
  d44: u("ding/44-digital-quick-tone", 0.12, 0.66, -0.6, "цифровий тон: поява лічильника, статусу"),
  // ── CAMERA: знімок, фото, фокус, діафрагма
  k45: u("camera/45-camera-shutter-click", 0.19, 0.25, -5.8, "затвор: стоп-кадр, скрін"),
  k46: u("camera/46-camera-shutter-hard-click", 0.14, 0.53, -0.7, "жорсткий затвор + спалах білим"),
  k47: u("camera/47-camera-digital-shutter", 0.30, 0.33, -0.8, "цифровий затвор: скріншот екрана"),
  k48: u("camera/48-camera-lens-shutter", 0.02, 0.26, -0.8, "iris/діафрагма: чорне коло закриває кадр"),
  k49: u("camera/49-camera-lens-autofocus", 9.26, 9.45, -0.1, "автофокус (починається з 3.6с!) — брати зріз"),
  k50: u("camera/50-camera-closing-lens", 0.09, 0.45, -0.6, "закриття обʼєктива: фінал сцени, iris-out"),
} as const;

export type UsfxKey = keyof typeof USFX;

/** Кадр старту, щоб пік звуку припав рівно на кадр події. */
export const hit = (key: UsfxKey, eventFrame: number, fps = 30) =>
  Math.max(0, Math.round(eventFrame - USFX[key].peak * fps));

/** Довжина у кадрах до згасання — для durationInFrames у <Sequence>. */
export const tail = (key: UsfxKey, fps = 30) => Math.ceil((USFX[key].end - 0) * fps) + 3;
