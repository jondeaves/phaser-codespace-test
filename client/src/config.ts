import Phaser from "phaser";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#33A5E7",
  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  plugins: {
    scene: [
      {
        key: "rexUI",
        plugin: RexUIPlugin,
        mapping: "rexUI",
      },
    ],
  },
};

export default config;
