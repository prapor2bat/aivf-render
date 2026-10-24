import React from "react";
import { Composition } from "remotion";
import projectJson from "../../data/stickman/project.json";
import transcriptJson from "../../data/stickman/transcript.json";
import type { Word } from "./overlay/Overlays";
import type { Project } from "./types";
import { StickmanVideo } from "./Video";

const project = projectJson as unknown as Project;
const words = ((transcriptJson as { words?: Word[] }).words ?? []) as Word[];

const Main: React.FC = () => <StickmanVideo project={project} words={words} />;

export const STICKMAN_F = Math.max(1, Math.ceil(project.duration * project.fps));

export const StickmanComposition: React.FC = () => (
  <Composition
    id="Stickman"
    component={Main}
    durationInFrames={STICKMAN_F}
    fps={project.fps}
    width={project.width}
    height={project.height}
  />
);