import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { Captions, Cut, EndCard, Iris, RedWipe, Sfx, Stage, ez } from "../brand/kit";
import { LogoTile, Stamp } from "../brand/parts";
import { B, FONT, isDark, Tone } from "../brand/tokens";
import { COVER_F, withCover } from "../brand/cover";
import { af, captions, LEAD_F, ORDER, SceneId, TOTAL_F, WIN, wf } from "./timeline";

/* «Claude Code безкоштовно назавжди» — Ron TV. 16:9 1280×720, рендер --scale=1.5 → 1080p. */
export const CF_F = TOTAL_F;
export const CF_TOTAL_F = TOTAL_F + COVER_F;

const W = 1280, H = 720;
const TONE: Record<SceneId, Tone> = { hook: "paper", problem: "night", secret: "paper", install: "night", openrouter: "paper", router: "blush", key: "night", logout: "paper", test: "blush", cta: "paper" };

const sp = (at: number, f: number, damping = 13, stiffness = 170) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });

/* ── базові цеглинки ── */
const Card: React.FC<{ at: number; x: number; y: number; w: number; h?: number; dark?: boolean; red?: boolean; pad?: number; children: React.ReactNode; style?: React.CSSProperties }> =
  ({ at, x, y, w, h, dark, red, pad = 22, children, style }) => {
    const f = useCurrentFrame(); const p = sp(at, f, 14, 160);
    if (f < at) return null;
    return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", padding: pad, borderRadius: 20,
      background: dark ? "#141418" : B.white, border: red ? `3px solid ${B.red}` : dark ? "1px solid rgba(255,255,255,.09)" : "none",
      boxShadow: "0 26px 50px -26px rgba(0,0,0,.5)", fontFamily: FONT.sans, color: dark ? B.white : B.ink,
      transform: `translateY(${(1 - p) * 46}px) scale(${0.96 + 0.04 * p})`, opacity: Math.min(1, p * 1.5), ...style }}>{children}</div>;
  };
const In: React.FC<{ at: number; children: React.ReactNode; y?: number; style?: React.CSSProperties }> = ({ at, children, y = 14, style }) => {
  const f = useCurrentFrame(); const p = ez(f, at, at + 6, [0, 1]);
  if (f < at) return null;
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * y}px)`, ...style }}>{children}</div>;
};
const Title: React.FC<{ at: number; children: React.ReactNode; dark?: boolean; size?: number; x?: number; y?: number; w?: number }> = ({ at, children, dark, size = 52, x = 96, y = 122, w = 900 }) => {
  const f = useCurrentFrame(); const p = ez(f, at, at + 9, [0, 1]);
  return <div style={{ position: "absolute", left: x, top: y, width: w, fontFamily: FONT.sans, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: "-0.05em",
    color: dark ? B.white : B.ink, opacity: p, transform: `translateY(${(1 - p) * 18}px)`, filter: 1 - p > 0.004 ? `blur(${(1 - p) * 8}px)` : undefined }}>{children}</div>;
};
const Icn: React.FC<{ src: string; size?: number; style?: React.CSSProperties }> = ({ src, size = 60, style }) =>
  <Img src={staticFile(src)} style={{ width: size, height: size, objectFit: "contain", flex: "none", ...style }} />;
const Pill: React.FC<{ at: number; children: React.ReactNode; x: number; y: number; red?: boolean; dark?: boolean }> = ({ at, children, x, y, red, dark }) => {
  const f = useCurrentFrame(); const p = sp(at, f, 12, 180);
  if (f < at) return null;
  return <div style={{ position: "absolute", left: x, top: y, display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 20px", borderRadius: 999, whiteSpace: "nowrap",
    background: red ? B.red : dark ? "rgba(255,255,255,.1)" : B.white, color: red || dark ? B.white : B.ink, border: dark ? "1px solid rgba(255,255,255,.2)" : undefined,
    boxShadow: red || dark ? undefined : "0 12px 24px -12px rgba(0,0,0,.45)", fontFamily: FONT.sans, fontWeight: 800, fontSize: 22,
    transform: `translateY(${(1 - p) * 18}px) scale(${0.84 + 0.16 * p})`, opacity: Math.min(1, p * 1.4) }}>{children}</div>;
};
const Sub: React.FC<{ dark?: boolean; children: React.ReactNode; size?: number }> = ({ dark, children, size = 19 }) =>
  <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 500, fontSize: size, color: dark ? "rgba(255,255,255,.66)" : B.gray, marginTop: 6 }}>{children}</div>;
const Typed: React.FC<{ at: number; text: string; cps?: number; caret?: boolean }> = ({ at, text, cps = 2.4, caret = true }) => {
  const f = useCurrentFrame(); const n = Math.max(0, Math.min(text.length, Math.floor((f - at) * cps)));
  return <>{text.slice(0, n)}{caret && n < text.length && <span style={{ color: B.red, opacity: Math.floor(f / 8) % 2 }}>|</span>}</>;
};

/* ── термінал ── */
const Term: React.FC<{ at: number; x: number; y: number; w: number; h?: number; title?: string; children: React.ReactNode }> = ({ at, x, y, w, h = 220, title = "термінал", children }) => (
  <Card at={at} x={x} y={y} w={w} h={h} dark pad={0} style={{ overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.09)" }}>
      {[B.red, "#F5C542", "#4CC66B"].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 12, background: c }} />)}
      <span style={{ marginLeft: 8, fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.55)" }}>{title}</span>
    </div>
    <div style={{ padding: "16px 18px", fontFamily: FONT.sans, fontSize: 22, fontWeight: 600, lineHeight: 1.6 }}>{children}</div>
  </Card>
);
const Prompt: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: "#4CC66B", fontWeight: 900, marginRight: 10 }}>$</span>;

const Line: React.FC<{ at: number; icon: string; title: string; sub?: string; dark?: boolean; red?: boolean }> = ({ at, icon, title, sub, dark, red }) => (
  <In at={at} style={{ display: "flex", alignItems: "center", gap: 14, padding: "9px 0" }}>
    <div style={{ width: 46, height: 46, borderRadius: 12, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: red ? B.red : dark ? "rgba(255,255,255,.08)" : "#F3F1EC" }}>
      <Icn src={icon} size={26} style={{ filter: dark && !red ? "invert(1)" : undefined }} />
    </div>
    <div><div style={{ fontWeight: 800, fontSize: 24, letterSpacing: "-0.02em" }}>{title}</div>{sub && <div style={{ fontSize: 18, color: dark ? "rgba(255,255,255,.6)" : B.gray, marginTop: 2 }}>{sub}</div>}</div>
  </In>
);

/* ── сцена ── */
const Scene: React.FC<{ id: SceneId; children?: React.ReactNode; push?: number; arc?: number | false; caps?: boolean }> = ({ id, children, push, arc = false, caps = true }) => (
  <Sequence from={WIN[id].s} durationInFrames={WIN[id].d}>
    <Stage tone={TONE[id]} dur={WIN[id].d} push={push} arc={arc}>{children}</Stage>
    {caps && <Captions items={captions(id)} tone={TONE[id]} top={574} size={42} />}
  </Sequence>
);
const Step: React.FC<{ n: number; total: number; at: number; dark?: boolean }> = ({ n, total, at, dark }) => (
  <In at={at} y={8} style={{ position: "absolute", right: 96, top: 62, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT.sans }}>
    <span style={{ padding: "5px 12px", borderRadius: 999, background: B.red, color: B.white, fontWeight: 900, fontSize: 17 }}>КРОК {n}/{total}</span>
    <span style={{ fontWeight: 700, fontSize: 16, color: dark ? "rgba(255,255,255,.6)" : "rgba(0,0,0,.5)" }}>Claude Code · безкоштовно</span>
  </In>
);

export const CfVideo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: B.paper }}>
      {/* ── ХУК ── */}
      <Scene id="hook" arc={0}>
        <LogoTile id="claude" at={wf("hook", "користуватися")} x={1030} y={300} size={200} />
        <div style={{ position: "absolute", left: 96, top: 150, width: 660, fontFamily: FONT.sans }}>
          <In at={wf("hook", "користуватися")}><div style={{ fontWeight: 800, fontSize: 24, letterSpacing: 3, color: B.gray, marginBottom: 12 }}>CLAUDE CODE</div></In>
          <Title at={wf("hook", "ціна")} size={96} x={96} y={192} w={700} dark={false}>
            безкоштовно<br /><span style={{ color: B.red }}>назавжди</span>
          </Title>
          <Pill at={wf("hook", "спосіб")} x={96} y={428} red><Icn src="assets/fl-check_mark_button.png" size={24} style={{ filter: "brightness(0) invert(1)" }} />офіційний спосіб</Pill>
        </div>
        <Cut src="assets/fl-money_with_wings.png" at={wf("hook", "лякає")} x={1010} y={520} w={150} seed={2} />
        <Cut src="assets/fl-free_button.png" at={wf("hook", "безкоштовний")} x={1140} y={150} w={120} seed={1} rot={9} />
      </Scene>

      {/* ── ПРОБЛЕМА ── */}
      <Scene id="problem">
        <Title at={wf("problem", "зрозумій")} dark>Чому <span style={{ color: B.red }}>дорого</span>?</Title>
        <Card at={wf("problem", "оболонка")} x={96} y={248} w={470} h={240} dark>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><Icn src="assets/fl-desktop_computer.png" size={44} style={{ filter: "invert(1)" }} /><div style={{ fontWeight: 900, fontSize: 30, letterSpacing: "-0.03em" }}>ОБОЛОНКА</div></div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Claude Code CLI</div>
          <Sub dark>стоїть на твоєму компʼютері</Sub>
          <Pill at={wf("problem", "двигун")} x={118} y={430} dark><span style={{ color: B.red }}>●</span> безкоштовна</Pill>
        </Card>
        <div style={{ position: "absolute", left: 588, top: 336, fontFamily: FONT.sans, fontWeight: 900, fontSize: 44, color: B.red, opacity: ez(f, wf("problem", "двигун"), wf("problem", "двигун") + 6, [0, 1]) }}>+</div>
        <Card at={wf("problem", "двигун")} x={714} y={248} w={470} h={240} red>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><Icn src="assets/fl-brain.png" size={44} /><div style={{ fontWeight: 900, fontSize: 30, letterSpacing: "-0.03em" }}>ДВИГУН</div></div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>модель на серверах</div>
          <Sub>штучний мозок, який думає</Sub>
          <Pill at={wf("problem", "платиш")} x={736} y={430} red><Icn src="assets/fl-heavy_dollar_sign.png" size={24} style={{ filter: "brightness(0) invert(1)" }} />платиш за токени</Pill>
        </Card>
      </Scene>

      {/* ── СЕКРЕТ ── */}
      <Scene id="secret" arc={0}>
        <Title at={wf("secret", "секрет")}>Секрет: <span style={{ color: B.red }}>замінити двигун</span></Title>
        <div style={{ position: "absolute", left: 96, top: 262, width: 1088, display: "flex", alignItems: "center", justifyContent: "center", gap: 34, fontFamily: FONT.sans }}>
          <In at={wf("secret", "оболонка")} style={{ textAlign: "center" }}>
            <div style={{ width: 150, height: 150, borderRadius: 24, background: B.white, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 44px -20px rgba(0,0,0,.4)" }}><Icn src="pack/brand/claude-color.svg" size={96} /></div>
            <div style={{ fontWeight: 800, fontSize: 20, marginTop: 10, color: B.ink }}>Claude Code</div>
          </In>
          <span style={{ fontWeight: 900, fontSize: 46, color: B.gray }}>+</span>
          <In at={wf("secret", "замінити")} style={{ textAlign: "center" }}>
            <div style={{ width: 150, height: 150, borderRadius: 24, background: "#111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 44px -20px rgba(0,0,0,.4)", color: B.white, fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em" }}>Open<wbr />Router</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginTop: 10, color: B.ink }}>вільний двигун</div>
          </In>
          <span style={{ fontWeight: 900, fontSize: 46, color: B.gray }}>=</span>
          <In at={wf("secret", "нульовим")} style={{ textAlign: "center" }}>
            <div style={{ width: 150, height: 150, borderRadius: 24, background: B.red, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 44px -20px rgba(0,0,0,.5)", color: B.white, fontWeight: 900, fontSize: 60 }}>0 ₴</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginTop: 10, color: B.ink }}>рахунок</div>
          </In>
        </div>
        <Pill at={wf("secret", "офіційно")} x={478} y={472} red>легально і офіційно</Pill>
      </Scene>

      {/* ── КРОК 1: ВСТАНОВЛЕННЯ ── */}
      <Scene id="install">
        <Step n={1} total={4} at={wf("install", "перший")} dark />
        <Title at={wf("install", "перший")} dark size={46}>Крок 1 · <span style={{ color: B.red }}>встановлюємо</span> Claude Code</Title>
        <Term at={wf("install", "термінал")} x={96} y={216} w={700} h={230} title="PowerShell">
          <div><Prompt>npm install -g @anthropic-ai/claude-code</Prompt></div>
          <div style={{ color: "#8BE28B", marginTop: 8, display: "flex", gap: 10 }}><Icn src="assets/fl-check_mark_button.png" size={22} style={{ filter: "brightness(0) invert(1)" }} />Встановлено глобально</div>
        </Term>
        <Card at={wf("install", "однією")} x={836} y={216} w={348} h={230} dark>
          <Line dark at={wf("install", "термінал")} icon="assets/fl-keyboard.png" title="Відкрий термінал" />
          <Line dark at={wf("install", "командою")} icon="assets/fl-gear.png" title="Одна команда" sub="через npm" />
          <Line dark at={wf("install", "глобально")} icon="assets/fl-globe_with_meridians.png" title="Глобально" sub="для всіх проєктів" red />
        </Card>
        <Cut src="assets/fl-desktop_computer.png" at={wf("install", "компютері")} x={1160} y={520} w={110} seed={2} />
      </Scene>

      {/* ── КРОК 2: OPENROUTER ── */}
      <Scene id="openrouter" arc={0}>
        <Step n={2} total={4} at={wf("openrouter", "другий")} />
        <Title at={wf("openrouter", "другий")} size={46}>Крок 2 · <span style={{ color: B.red }}>новий двигун</span> — OpenRouter</Title>
        <Card at={wf("openrouter", "сервіс")} x={96} y={236} w={560} h={244}>
          <div style={{ fontWeight: 900, fontSize: 28, marginBottom: 10 }}>Один сервіс — сотні моделей</div>
          <Line at={wf("openrouter", "моделей")} icon="assets/fl-card_index_dividers.png" title="Сотні моделей" sub="в одному місці" />
          <Line at={wf("openrouter", "безкоштовні")} icon="assets/fl-free_button.png" title="Багато — безкоштовні" sub="позначені як free" red />
          <Sub>де брати: openrouter.ai → Models → фільтр free</Sub>
        </Card>
        <Card at={wf("openrouter", "ключ")} x={696} y={236} w={488} h={244} dark>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><Icn src="assets/fl-key.png" size={40} style={{ filter: "invert(1)" }} /><div style={{ fontWeight: 900, fontSize: 26 }}>Отримуєш свій ключ</div></div>
          <Line dark at={wf("openrouter", "реєструєшся")} icon="assets/fl-identification_card.png" title="Реєстрація" sub="без картки" />
          <Line dark at={wf("openrouter", "ключах")} icon="assets/fl-locked_with_key.png" title="Розділ Keys → Create" />
          <Line dark at={wf("openrouter", "ключ")} icon="assets/fl-clipboard.png" title="Копіюєш ключ" sub="починається з sk or" red />
        </Card>
      </Scene>

      {/* ── СЕКРЕТНА ФІШКА ── */}
      <Scene id="router">
        <Title at={wf("router", "фішка")} size={48}>Секретна фішка: <span style={{ color: B.red }}>без таймаутів</span></Title>
        <Card at={wf("router", "фішка")} x={96} y={236} w={560} h={250} red>
          <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 32, letterSpacing: "-0.03em" }}>Free Models Router</div>
          <div style={{ marginTop: 14, display: "inline-block", padding: "10px 18px", borderRadius: 10, background: "#111", color: "#7CFC9A", fontFamily: FONT.sans, fontWeight: 700, fontSize: 26 }}>openrouter/free</div>
          <Sub>сам обирає вільну модель під запит</Sub>
        </Card>
        <Card at={wf("router", "маршрутизатор")} x={696} y={236} w={488} h={250} dark>
          <Line dark at={wf("router", "зависають")} icon="assets/fl-stopwatch.png" title="Модель зависла?" />
          <Line dark at={wf("router", "маршрутизатор")} icon="assets/fl-repeat_button.png" title="Роутер перемикається" sub="на льоту" />
          <Line dark at={wf("router", "зникають")} icon="assets/fl-check_mark_button.png" title="Помилка Timeout зникає" red />
        </Card>
        <Stamp text="FREE" at={wf("router", "фішка")} x={1130} y={150} />
      </Scene>

      {/* ── КРОК 3: НАЛАШТУВАННЯ ── */}
      <Scene id="key">
        <Step n={3} total={4} at={wf("key", "третій")} dark />
        <Title at={wf("key", "третій")} dark size={46}>Крок 3 · <span style={{ color: B.red }}>три змінні</span> середовища</Title>
        <Term at={wf("key", "змінні")} x={96} y={230} w={722} h={252} title="Antigravity · settings.json">
          <div><span style={{ color: "#F5C542", fontWeight: 800 }}>ANTHROPIC_BASE_URL</span> = <span style={{ color: "#7FC7FF" }}>https://openrouter.ai/api</span></div>
          <div><span style={{ color: "#F5C542", fontWeight: 800 }}>ANTHROPIC_AUTH_TOKEN</span> = <span style={{ color: "#7FC7FF" }}>sk-or-…</span></div>
          <div><span style={{ color: "#F5C542", fontWeight: 800 }}>ANTHROPIC_API_KEY</span> = <span style={{ color: "#7FC7FF" }}>" "</span> <span style={{ color: "rgba(255,255,255,.5)", fontSize: 17 }}>(порожній)</span></div>
        </Term>
        <Card at={wf("key", "редакторі")} x={856} y={230} w={328} h={252} dark>
          <Line dark at={wf("key", "адреса")} icon="assets/fl-link.png" title="Адреса сервісу" />
          <Line dark at={wf("key", "ключ")} icon="assets/fl-key.png" title="Твій ключ" />
          <Line dark at={wf("key", "порожній")} icon="assets/fl-cross_mark.png" title="Старий ключ — порожній" red />
          <Sub dark>правити прямо в редакторі Antigravity</Sub>
        </Card>
        <Pill at={wf("key", "готово")} x={96} y={510} red><Icn src="assets/fl-check_mark_button.png" size={24} style={{ filter: "brightness(0) invert(1)" }} />Зберіг · перезапустив · готово</Pill>
      </Scene>

      {/* ── КРОК 4: LOGOUT ── */}
      <Scene id="logout" arc={0}>
        <Step n={4} total={4} at={wf("logout", "четвертий")} />
        <Title at={wf("logout", "четвертий")} size={46}>Крок 4 · <span style={{ color: B.red }}>вийти</span> з платного акаунта</Title>
        <Term at={wf("logout", "команда")} x={96} y={236} w={640} h={200} title="термінал">
          <div><Prompt>claude logout</Prompt></div>
          <div style={{ color: "rgba(255,255,255,.6)", marginTop: 8 }}>✓ Ви вийшли з акаунта Anthropic</div>
        </Term>
        <Card at={wf("logout", "вийти")} x={776} y={236} w={408} h={200} dark>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Icn src="assets/fl-locked.png" size={40} style={{ filter: "invert(1)" }} /><div style={{ fontWeight: 800, fontSize: 25 }}>Стара підписка забута</div></div>
          <Sub dark>тепер програма не згадає твій платний акаунт</Sub>
        </Card>
      </Scene>

      {/* ── ФІНАЛЬНИЙ ТЕСТ ── */}
      <Scene id="test" arc={0}>
        <Title at={wf("test", "тест")} size={48}>Фінальний тест: <span style={{ color: B.red }}>працює</span></Title>
        <Card at={wf("test", "запускаємо")} x={96} y={236} w={640} h={250} dark>
          <div style={{ alignSelf: "flex-end", marginLeft: 150, padding: "12px 16px", borderRadius: 16, background: B.red, color: B.white, fontWeight: 700, fontSize: 22, lineHeight: 1.3 }}>Зроби мені лендінг для кавʼярні</div>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <Icn src="assets/fl-robot.png" size={34} style={{ filter: "invert(1)" }} />
            <div style={{ padding: "12px 16px", borderRadius: 16, background: "rgba(255,255,255,.08)", fontWeight: 600, fontSize: 22 }}>Пишу код… <Typed at={wf("test", "пише")} text="готово за 40 секунд" cps={2.2} /></div>
          </div>
          <Pill at={wf("test", "безкоштовно")} x={118} y={430} dark><span style={{ color: "#7CFC9A" }}>●</span> 0 ₴ · без збоїв</Pill>
        </Card>
        <Cut src="assets/fl-check_mark_button.png" at={wf("test", "збоїв")} x={900} y={330} w={170} seed={1} />
        <Cut src="assets/fl-rocket.png" at={wf("test", "думає")} x={1090} y={500} w={140} seed={2} rot={10} />
      </Scene>

      {/* ── ФІНАЛ ── */}
      <Scene id="cta" caps={false} arc={0} push={0.02}>
        <EndCard at={LEAD_F} line="усі команди — в описі під роликом" />
      </Scene>

      {ORDER.map((id) => <Sequence key={id} from={WIN[id].s + LEAD_F} layout="none"><Audio src={staticFile(`audio02/${id}.mp3`)} /></Sequence>)}
      {ORDER.slice(1).map((id) => isDark(TONE[id]) ? <Iris key={id} at={WIN[id].s} x={1100} y={330} /> : <RedWipe key={id} at={WIN[id].s} x={1100} y={330} />)}
      <Sounds />
    </AbsoluteFill>
  );
};

const Sounds: React.FC = () => (
  <>
    <Sfx k="i17" at={af("hook", "ціна")} vol={0.25} />
    <Sfx k="w03" at={WIN.hook.s} vol={0.24} />
    {ORDER.slice(1).map((id) => <Sfx key={id} k={isDark(TONE[id]) ? "k48" : "w04"} at={WIN[id].s} vol={0.26} />)}
    <Sfx k="p30" at={af("problem", "оболонка")} vol={0.2} /><Sfx k="p30" at={af("problem", "двигун")} vol={0.2} />
    <Sfx k="i18" at={af("problem", "платиш")} vol={0.4} />
    <Sfx k="d42" at={af("secret", "нульовим")} vol={0.3} />
    <Sfx k="p28" at={af("install", "термінал")} vol={0.24} /><Sfx k="c21" at={af("install", "термінал", 0, 6)} vol={0.2} max={70} />
    <Sfx k="d39" at={af("install", "глобально")} vol={0.3} />
    <Sfx k="p28" at={af("openrouter", "сервіс")} vol={0.24} /><Sfx k="p30" at={af("openrouter", "безкоштовні")} vol={0.22} />
    <Sfx k="i18" at={af("openrouter", "ключ")} vol={0.38} />
    <Sfx k="g38" at={af("router", "фішка")} vol={0.34} /><Sfx k="p28" at={af("router", "маршрутизатор")} vol={0.24} /><Sfx k="d44" at={af("router", "зникають")} vol={0.3} />
    <Sfx k="c23" at={af("key", "змінні")} vol={0.4} /><Sfx k="p30" at={af("key", "адреса")} vol={0.2} /><Sfx k="p30" at={af("key", "ключ")} vol={0.2} /><Sfx k="p30" at={af("key", "порожній")} vol={0.2} />
    <Sfx k="d42" at={af("key", "готово")} vol={0.32} />
    <Sfx k="p28" at={af("logout", "команда")} vol={0.24} /><Sfx k="c22" at={af("logout", "логаут", 0, 4)} vol={0.4} />
    <Sfx k="p32" at={af("test", "запускаємо")} vol={0.26} /><Sfx k="d39" at={af("test", "збоїв")} vol={0.34} />
    <Sfx k="p28" at={WIN.cta.s + LEAD_F} vol={0.24} /><Sfx k="d40" at={af("cta", "підпишись")} vol={0.3} />
  </>
);

/* Обкладинка (COVER_F кадрів) + ролик. 16:9. */
export const CfComposition = withCover(CfVideo, {
  top: "CLAUDE CODE", bottom: "0 ГРИВЕНЬ", tone: "night", pose: "idea", obj: "pack/brand/claude-color.svg", objBg: "#FFFFFF", badge: "БЕЗКОШТОВНО",
});
