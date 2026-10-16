import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Avatar, Cut, EndCard, Iris, PinCard, RedWipe, Sfx, Stage, Words } from "./kit";
import { H, W } from "./tokens";

/* Демо фірмового стилю (docs/DESIGN-SYSTEM.md) — без голосу, лише SFX. Перевір, що все працює: npm run demo */
export const BRAND_F = 450;

// межі сцен (глобальні кадри)
const S = { hook: 0, pain: 60, why: 114, rule: 174, noise: 270, end: 320 };
const len = (a: number, b: number) => b - a;

export const BrandDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {/* 1. ХУК — світла сцена, ти в кадрі */}
    <Sequence from={S.hook} durationInFrames={len(S.hook, S.pain)}>
      <Stage tone="paper" dur={len(S.hook, S.pain)} arc={0}>
        <Words tone="paper" top={190} start={4} lines={["Ти вже маєш", "*ідеї* і", "*нейромережі*"]} />
        <Avatar pose="idea" at={34} tone="paper" h={500} />
      </Stage>
    </Sequence>

    {/* 2. БІЛЬ — темна сцена */}
    <Sequence from={S.pain} durationInFrames={len(S.pain, S.why)}>
      <Stage tone="night" dur={len(S.pain, S.why)}>
        <Cut src="pack/cut/confused-person.png" at={2} x={W / 2} y={350} w={420} />
        <Words tone="night" top={580} start={6} lines={["_Але_ твої ролики", "досі *стоять*?"]} />
      </Stage>
    </Sequence>

    {/* 3. ЧОМУ — рожевий слід червоного кола */}
    <Sequence from={S.why} durationInFrames={len(S.why, S.rule)}>
      <Stage tone="blush" dur={len(S.why, S.rule)}>
        <Cut src="pack/logo/instagram-colorful-3d-tile.jpg" at={2} x={W / 2} y={360} w={230} blend="multiply" rot={-6} />
        <Words tone="blush" top={560} start={6} lines={["Алгоритм", "~не нагороджує~", "*зусилля*"]} />
      </Stage>
    </Sequence>

    {/* 4. РІШЕННЯ — картка зі шпилькою */}
    <Sequence from={S.rule} durationInFrames={len(S.rule, S.noise)}>
      <Stage tone="paper" dur={len(S.rule, S.noise)} arc={1}>
        <Words tone="paper" top={200} start={4} lines={["Він рахує", "*утримання*"]} />
        <PinCard at={30} title="Утримання" items={["хук у перші 2 секунди", "графіка на кожне слово", "заклик у кінці"]} />
      </Stage>
    </Sequence>

    {/* 5. ПАНЧ — темна */}
    <Sequence from={S.noise} durationInFrames={len(S.noise, S.end)}>
      <Stage tone="night" dur={len(S.noise, S.end)}>
        <Words tone="night" top={500} start={6} lines={["Усе інше", "*шум*."]} />
      </Stage>
    </Sequence>

    {/* 6. ФІНАЛ — однакова картка CTA */}
    <Sequence from={S.end} durationInFrames={BRAND_F - S.end}>
      <Stage tone="paper" dur={BRAND_F - S.end} push={0.03} arc={0}>
        <EndCard at={6} code="ФІШКА" />
      </Stage>
    </Sequence>

    {/* переходи */}
    <Iris at={S.pain} />
    <RedWipe at={S.why} y={H * 0.3} />
    <Iris at={S.noise} />
    <RedWipe at={S.end} x={W * 0.5} y={H * 0.5} />

    {/* звук: пік кожного семплу — рівно на подію */}
    <Sfx k="i17" at={4} vol={0.22} />
    <Sfx k="w08" at={9} vol={0.14} /><Sfx k="p30" at={14} vol={0.14} />
    <Sfx k="p28" at={19} vol={0.3} /><Sfx k="i18" at={29} vol={0.55} />
    <Sfx k="w02" at={36} vol={0.22} />
    <Sfx k="k48" at={S.pain} vol={0.35} />
    <Sfx k="p27" at={S.pain + 4} vol={0.2} />
    <Sfx k="w08" at={S.pain + 6} vol={0.14} /><Sfx k="p30" at={S.pain + 16} vol={0.14} />
    <Sfx k="g33" at={S.pain + 26} vol={0.28} />
    <Sfx k="w03" at={S.why} vol={0.3} />
    <Sfx k="p27" at={S.why + 4} vol={0.2} />
    <Sfx k="i18" at={S.why + 21} vol={0.55} />
    <Sfx k="w04" at={S.rule} vol={0.25} />
    <Sfx k="p28" at={S.rule + 14} vol={0.3} />
    <Sfx k="w06" at={S.rule + 30} vol={0.6} />
    <Sfx k="c24" at={S.rule + 40} vol={0.4} /><Sfx k="c24" at={S.rule + 49} vol={0.4} /><Sfx k="c24" at={S.rule + 58} vol={0.4} />
    <Sfx k="k48" at={S.noise} vol={0.35} />
    <Sfx k="g38" at={S.noise + 16} vol={0.3} />
    <Sfx k="w05" at={S.end} vol={0.3} />
    <Sfx k="p28" at={S.end + 6} vol={0.25} />
    <Sfx k="p27" at={S.end + 20} vol={0.22} />
    <Sfx k="d40" at={S.end + 28} vol={0.3} />
  </AbsoluteFill>
);
