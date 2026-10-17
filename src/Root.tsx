import React from "react";
import { Composition } from "remotion";
import { BrandDemo, BRAND_F } from "./brand/Demo";
import { Avatar10, AVATAR10_F } from "./avatar10/Video";
import { AvatarInsert, AVATAR_INSERT_F } from "./avatar-insert/Video";
import { CoverDemoV, CoverDemoW } from "./brand/CoverDemo";
import { MarkerDemo } from "./brand/MarkerDemo";
import { CharacterDemo, CHARACTER_DEMO_F } from "./story/CharacterDemo";
import { CarouselCompositions } from "./carousel/registry";
import { KRYPTO_TOTAL_F, KryptoComposition } from "./krypto/Video";
import { CF_TOTAL_F, CfComposition } from "./claudefree/Video";
import { Pk1Video, PK1_F } from "./pokhidna1/Video";
import { CyberComposition, CYBER_F } from "./cyber/Video";
import { MoneyComposition, MONEY_F } from "./money/Video";
import { Pk5Video, PK5_F } from "./pokhidna5/Video";
import { NewsVideo, NEWS_F } from "./news/Video";
import { ScreencastVideo, SCREENCAST_F } from "./screencast/Video";
import { MockAI, MOCKAI_F } from "./screencast/MockAI";
import { CoverSpec, withCover } from "./brand/cover";

/* Обкладинка серії «Математика простими словами» → епізод 1. */
export const MATH1_COVER: CoverSpec = { top: "ЩО ТАКЕ", bottom: "ПОХІДНА", pose: "point-right", obj: "assets/fl-abacus.png", badge: "МАТЕМАТИКА ПРОСТИМИ СЛОВАМИ", tone: "night" };
/* Обкладинка → епізод 5: похідна складеної функції. */
export const MATH5_COVER: CoverSpec = { top: "СКЛАДЕНА", bottom: "ФУНКЦІЯ", pose: "idea", obj: "assets/fl-gear.png", badge: "ПОХІДНА · ЕПІЗОД 5", tone: "night" };

/* Реєстр композицій. Кожен новий ролик — окремий модуль у src/<назва>/ і рядок тут.
   Вертикаль 9:16: width 720 height 1280 · Горизонталь 16:9 (YouTube): width 1280 height 720.
   Рендер у 1080p: npx remotion render <Id> out/<name>.mp4 --scale=1.5 --crf=18 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Brand" component={BrandDemo} durationInFrames={BRAND_F} fps={30} width={720} height={1280} />
    <Composition id="Avatar10" component={Avatar10} durationInFrames={AVATAR10_F} fps={30} width={720} height={1280} />
    <Composition id="AvatarInsert" component={AvatarInsert} durationInFrames={AVATAR_INSERT_F} fps={25} width={720} height={1280} />
    <Composition id="CoverV" component={CoverDemoV} durationInFrames={8} fps={30} width={720} height={1280} defaultProps={{ guide: false }} />
    <Composition id="CoverW" component={CoverDemoW} durationInFrames={8} fps={30} width={1280} height={720} />
    <Composition id="Marker" component={MarkerDemo} durationInFrames={90} fps={30} width={1280} height={720} />
    {/* нове у v3: мультик-персонажі (src/story) і анімовані каруселі Instagram (src/carousel, рендер: npm run carousel -- demo… див. docs/CAROUSEL.md) */}
    <Composition id="CharacterDemo" component={CharacterDemo} durationInFrames={CHARACTER_DEMO_F} fps={30} width={720} height={1280} />
    <Composition id="Krypto" component={KryptoComposition} durationInFrames={KRYPTO_TOTAL_F} fps={30} width={720} height={1280} />
    <Composition id="ClaudeFree" component={CfComposition} durationInFrames={CF_TOTAL_F} fps={30} width={1280} height={720} />
    <Composition id="Math1" component={withCover(Pk1Video, MATH1_COVER)} durationInFrames={PK1_F} fps={30} width={1280} height={720} />
    <Composition id="Math5" component={withCover(Pk5Video, MATH5_COVER)} durationInFrames={PK5_F} fps={30} width={1280} height={720} />
    <Composition id="Cyber" component={CyberComposition} durationInFrames={CYBER_F} fps={30} width={720} height={1280} />
    <Composition id="Money" component={MoneyComposition} durationInFrames={MONEY_F} fps={30} width={720} height={1280} />
    {/* формат «Новини та фактами»: стокове b-roll (Pixabay) під озвучку — див. docs/BROLL.md.
        News — вертикаль 9:16 (шортс), NewsWide — горизонталь 16:9, 8–10 хв (docs/NEWS-CHANNEL.md). */}
    <Composition id="News" component={NewsVideo} durationInFrames={NEWS_F} fps={30} width={720} height={1280} />
    <Composition id="NewsWide" component={NewsVideo} durationInFrames={NEWS_F} fps={30} width={1280} height={720} />
    {/* формат «скрінкаст»: запис екрана під озвучку — наїзди, підсвітка, розмиття, субтитри (docs/SCREENCAST.md).
        Дані: studio/src/screencast/screencast.json (recording, shots, blurs, captions, cover). */}
    <Composition id="Screencast" component={ScreencastVideo} durationInFrames={SCREENCAST_F} fps={30} width={1280} height={720} />
    {/* демо-запис екрана (мок ШІ-чату) для формату «Скрінкаст» — рендер у studio/public/screencast/ai-screen.mp4 */}
    <Composition id="MockAI" component={MockAI} durationInFrames={MOCKAI_F} fps={30} width={1920} height={1080} />
    <CarouselCompositions />
  </>
);
