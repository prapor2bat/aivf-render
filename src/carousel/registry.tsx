import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { CarouselDef, DUR, FPS, Slide, SH, SW } from "./kit";
import { KLING4_CAR } from "./cars/demo";

/* Реєстр каруселей: нова карусель = файл у cars/ + рядок тут.
   Композиції: Car-<id>-01…NN (слайди 1080×1350, відео DUR кадрів) і CarPano-<id> (уся панорама — для перевірки стиків). */
export const CAROUSELS: CarouselDef[] = [KLING4_CAR];

const Pano: React.FC<{ car: CarouselDef }> = ({ car }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {Array.from({ length: car.n }, (_, i) => <div key={i} style={{ position: "absolute", left: i * SW, top: 0, width: SW, height: SH, overflow: "hidden" }}><Slide car={car} i={i} /></div>)}
    {Array.from({ length: car.n - 1 }, (_, i) => <div key={"s" + i} style={{ position: "absolute", left: (i + 1) * SW - 1, top: 0, width: 2, height: 24, background: "#FF00FF" }} />)}
  </AbsoluteFill>
);

export const CarouselCompositions: React.FC = () => <>
  {CAROUSELS.flatMap((car) => [
    ...Array.from({ length: car.n }, (_, i) => <Composition key={`${car.id}-${i}`} id={`Car-${car.id}-${String(i + 1).padStart(2, "0")}`} component={() => <Slide car={car} i={i} />} durationInFrames={DUR} fps={FPS} width={SW} height={SH} />),
    <Composition key={`${car.id}-pano`} id={`CarPano-${car.id}`} component={() => <Pano car={car} />} durationInFrames={DUR} fps={FPS} width={SW * car.n} height={SH} />,
  ])}
</>;
