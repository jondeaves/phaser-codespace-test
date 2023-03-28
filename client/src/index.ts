import Phaser from "phaser";
import config from "./config";
import IntroScene from "./scenes/Intro";
import GameScene from "./scenes/Game";

new Phaser.Game(
  Object.assign(config, {
    // scene: [IntroScene, GameScene],
    scene: [GameScene, IntroScene],
  })
);
