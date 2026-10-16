import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");
// На GitHub Actions 2 ядра; локально — скільки є.
Config.setConcurrency(process.env.CI ? 2 : 4);
