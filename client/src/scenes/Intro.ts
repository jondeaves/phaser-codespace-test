import Phaser from "phaser";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import { Buttons } from "phaser3-rex-plugins/templates/ui/ui-components.js";

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

export default class IntroScene extends Phaser.Scene {
  rexUI!: RexUIPlugin;
  username: string = "";

  constructor() {
    super("IntroScene");

    this.username = localStorage.getItem("username") || "";
  }

  preload() {}

  create() {
    this.input.keyboard.on("keyup", (event: any) => {
      const allowedCharacters = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
      ];

      if (
        allowedCharacters.indexOf(event.key) !== -1 &&
        this.username.length < 18
      ) {
        this.username = `${this.username}${event.key}`.replace(/[^a-z]/gi, "");
      } else if (event.key === "Backspace" && this.username.length > 0) {
        this.username = this.username.substring(0, this.username.length - 1);
      } else if (event.key === "Enter") {
        this.submitLogin();
      }

      usernameInput.setText(this.username);
    });

    // this.rexUI.add
    //   .sizer({
    //     x: 400,
    //     y: 300,
    //     width: 300,
    //     height: 50,
    //     orientation: 1,
    //   })
    //   .addBackground(
    //     this.rexUI.add.roundRectangle(0, 0, 100, {
    //       color: COLOR_DARK,
    //       strokeColor: COLOR_LIGHT,
    //       radius: 20,
    //     })
    //   )
    //   .add(
    //     this.rexUI.add

    //   );

    this.createTextBox(200, 140, {
      wrapWidth: 400,
      fixedWidth: 360,
      fixedHeight: 30,
      showBackground: false,
    }).start("Type username", 0);

    const usernameInput = this.createTextBox(200, 200, {
      wrapWidth: 400,
      fixedWidth: 360,
      fixedHeight: 30,
    }).start(this.username, 0);

    var buttons = new Buttons(this, {
      x: 400,
      y: 360,
      width: 300,
      height: 50,
      orientation: "x",

      buttons: [this.createButton("LOGIN")],

      align: "center",
    })
      .on(
        "button.click",
        (button: any, index: any, pointer: any, event: any) => {
          // buttons.setButtonEnable(false);
          // setTimeout(() => {
          //   buttons.setButtonEnable(true);
          // }, 1000);

          this.submitLogin();
        }
      )
      .layout();

    this.add.existing(buttons);
  }

  private submitLogin() {
    if (this.username.length < 3) {
      return;
    }

    localStorage.setItem("username", this.username);
    this.scene.start("GameScene");
  }

  private createButton(text: string) {
    return this.rexUI.add.label({
      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x7b5e57),
      text: this.add.text(0, 0, text, {
        align: "center",
        fontSize: "24px",
        fixedWidth: 300,
      }),
      space: {
        left: 0,
        right: 0,
      },
    });
  }

  private createTextBox(x: number, y: number, config: any) {
    const GetValue = Phaser.Utils.Objects.GetValue;
    const scene = this;

    var wrapWidth = GetValue(config, "wrapWidth", 0);
    var fixedWidth = GetValue(config, "fixedWidth", 0);
    var fixedHeight = GetValue(config, "fixedHeight", 0);
    var showBackground =
      GetValue(config, "showBackground", 1) === 1 ? true : false;
    var textBox = this.rexUI.add
      .textBox({
        x: x,
        y: y,

        background: showBackground
          ? scene.rexUI.add
              .roundRectangle(0, 0, 2, 2, 20, COLOR_PRIMARY)
              .setStrokeStyle(2, COLOR_LIGHT)
          : undefined,

        text: this.rexUI.add.BBCodeText(0, 0, "", {
          align: "center",
          fixedWidth: fixedWidth,
          fixedHeight: fixedHeight,

          fontSize: "32px",
          wrap: {
            mode: "word",
            width: wrapWidth,
          },
          maxLines: 3,
        }),

        space: {
          left: 16,
          right: 16,
          top: 16,
          bottom: 16,
        },
      })
      .setOrigin(0)
      .layout();

    return textBox;
  }
}
