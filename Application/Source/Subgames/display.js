//
// This file contains the one and only screen for the application.
// This is the meat of the program.
//
// Copyright 2024 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let loading_counter = 0;

const one_day = 1000 * 60 * 60 * 24;

function resetFollowThrough() {
  console.log(game.screens["display"].data);
  game.screens["display"].data = {};
  game.screens["display"].initializeElements();
}


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

    this.trash_visible = false;
    this.trash = makeSquishButton("trash", layers["banner"],
        841 + 22.5, 31, true, "button",
        () => {
          this.trash_visible = this.trash_visible == false ? true : false;

          for (let c = 0; c < 8; c++) {
            if (c in this.data) {
              this.elements[c].element_trash.visible = this.trash_visible == true ? true : false
            }
          }
        }
    );
    this.trash.scale = (0.35, 0.35);

    this.data = {
      0: {
        title:"Sword Fighting",
        decay: 1,
        timestamp: Date.now(),
        health: 4,
        color: 3,
      },
      1: {
        title:"Ab Work",
        decay: 1,
        timestamp: Date.now(),
        health: 2,
        color: 4,
      },
      2: {
        title:"Chinese Practice",
        decay: 1,
        timestamp: Date.now(),
        health: 5,
        color: 2,
      },
      3: {
        title:"Drawing Practice",
        decay: 1,
        timestamp: Date.now(),
        health: 3,
        color: 0,
      },
      4: {
        title:"Shoulder Therapy",
        decay: 1,
        timestamp: Date.now(),
        health: 3,
        color: 7,
      },
    }
    // this.loadData();

    this.initializeElements();
  }


  saveData() {
    localStorage.setItem("follow_through_data", JSON.stringify(this.data));
    let x = localStorage.getItem("follow_through_data", "{}");
  }

  loadData() {
    let x = localStorage.getItem("follow_through_data");
    this.data = JSON.parse(localStorage.getItem("follow_through_data"));
  }


  initializeElements() {
    let layers = this.layers;
    layers["elements"].removeChildren();
    this.elements = []
    this.health_bars = []
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
      this.health_bars[i] = new PIXI.Container();
      this.elements[i].addChild(this.health_bars[i])
      this.updateHealthBars(i);
    }
  }


  updateHealthBars(i) {
    this.health_bars[i].removeChildren();
    this.health_bars[i].buttons = [];
    let data = this.data;
    this.elements[i].element_trash = null;
    if (i in data) {

      let num = i;
      let element_trash = makeSquishButton("trash", this.elements[i],
          400 + 22.5, 31, true, "button",
          ()=> {
            console.log(this.data);
            console.log(num);
            delete this.data[num];
            console.log("New data");
            console.log(this.data);
            this.initializeElements();
          }
      );
      element_trash.scale = (0.35, 0.35);
      // element_trash.visible = false;
      element_trash.visible = this.trash_visible == true ? true : false
      this.elements[i].element_trash = element_trash;

      let text = makeText(data[i].title, this.core_font, this.health_bars[i], 18, 23, 0, 0.5);
      for (let j = 0; j < 7; j++) {
        let sprite_name = (data[i].health > j) ? "button_" + data[i].color : "button_e" 
        let health_button = null;
        if (data[i].health == j) {
          health_button = makeSquishButton(
            sprite_name, this.health_bars[i],
            18 + 50 * j + 22.5, 45 + 22.5, true, "button",
            ()=> {
              data[i].health += 1;
              this.updateHealthBars(i);

              if (data[i].health == 7) {
                delay(()=> {
                  soundEffect("fill_" + dice(3));
                }, 100);
                for (let m = 0; m < 7; m++) {
                  delay(()=> {
                    let b = this.health_bars[i].buttons[m];
                    b.old_scale_x = b.scale.x;
                    b.old_scale_y = b.scale.y;
                    b.scale.set(1.1 * b.old_scale_x, 0.9 * b.old_scale_y);
                  }, 100 + 50 * m);
                  delay(()=> {
                    let b = this.health_bars[i].buttons[m];
                    b.scale.set(b.old_scale_x, b.old_scale_y);
                  }, 200 + 50 * m);
                }

                let fireworks = true;
                for (let n = 0; n < 8; n++) {
                  if (n in data && data[n].health != 7) {
                    fireworks = false;
                  }
                }
                if (fireworks) {
                  delay(()=> {
                    soundEffect("completion");
                  }, 200);
                  for(let p = 0; p < 10 + dice(10); p++) {
                    delay(()=> {
                      soundEffect("explosion_" + dice(2), 0.1);
                      makeFireworks(this, "orange", dice(game.width), dice(game.height), 1, 1);
                    }, 300 + 200 * p + dice(200));
                  }
                }
              }
            }
          );
        } else {
          health_button = makeSprite(sprite_name, this.health_bars[i], 18 + 50 * j + 22.5, 45 + 22.5, 0.5, 0.5, true)
        }
        this.health_bars[i].buttons[j] = health_button;
        health_button.scale = (0.35, 0.35)
      }
    }

    this.saveData();
  }


  getDate() {
    return new Date(new Date().setHours(0,0,0,0));
  }


  // Regular update method
  update(diff) {
    let fractional = diff / (1000/30.0);


    let current_date = this.getDate();
    for (let i = 0; i < 8; i++) {
      if (i in this.data) {
        let old_date = this.data[i].timestamp;

      }
    }



    // this.title.text += "a"
  }
}

