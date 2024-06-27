//
// This file contains the one and only screen for the application.
// This is the meat of the program.
//
// Copyright 2024 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let loading_counter = 0;


class Display extends Screen {
  // Set up the screen
  initialize(game_width, game_height) {
    this.state = null;

    this.layers = {};
    let layers = this.layers;

    layers["banner"] = new PIXI.Container();
    this.addChild(layers["banner"]);

    layers["elements"] = new PIXI.Container();
    this.addChild(layers["elements"]);

    this.core_font = {fontFamily: "BitOperator", fontSize: 24, fontWeight: 200, fill: 0x000000, letterSpacing: 1, align: "left"};

    // make the layout
    let top_banner = makeBlank(layers["banner"], game_width, 60, 0, 0);
    top_banner.tint = 0xb1b2b5;

    let bottom_banner = makeBlank(layers["banner"], game_width, 20, 0, 460);
    bottom_banner.tint = 0xb1b2b5;

    this.title = makeText("Follow Through", this.core_font, layers["banner"], 341, 29, 0, 0.5);

    this.trash = makeSprite("trash", layers["banner"], 841, 31, 0, 0.5, true);
    this.trash.scale = (0.35, 0.35);

    this.data = {
      0: {
        title:"Sword Fighting",
        decay: 1,
        health: 4,
        color: 3,
      },
      2: {
        title:"Chinese Practice",
        decay: 1,
        health: 5,
        color: 2,
      },
      3: {
        title:"Drawing Practice",
        decay: 1,
        health: 7,
        color: 0,
      },

      // Fat Abs
      // Shoulder
    }


    this.elements = []
    for (i = 0; i < 8; i++) {
      let x = Math.floor(i/4);
      let y = i % 4 * 100 + 60;
      this.elements[i] = new PIXI.Container();
      this.elements[i].position.set(x * 450, y);
      layers["elements"].addChild(this.elements[i])
      let element_background = makeBlank(this.elements[i], 450, 100, 0, 0);
      layers["elements"][i] = element_background;
      if ((i+x) % 2 == 0) {
        element_background.tint = 0xf0f0f0;
      } else {
        element_background.tint = 0xfefefe;
      }

      if (i in this.data) {
        let text = makeText(this.data[i].title, this.core_font, this.elements[i], 18, 23, 0, 0.5);
        for (let j = 0; j < 7; j++) {
          console.log(this.data[i].health);
          let sprite_name = (this.data[i].health > j) ? "button_" + this.data[i].color : "button_e" 
          console.log(sprite_name)
          let health_button = makeSprite(sprite_name, this.elements[i], 18 + 50 * j, 45, 0, 0, true);
          health_button.scale = (0.35, 0.35)
        }

      }
      

    }
  }


  // Regular update method
  update(diff) {
    let fractional = diff / (1000/30.0);

    // this.title.text += "a"
  }
}

