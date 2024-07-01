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

    layers["add_box"] = new PIXI.Container();
    this.addChild(layers["add_box"]);

    this.core_font = {fontFamily: "BitOperator", fontSize: 24, fontWeight: 200, fill: 0x000000, letterSpacing: 1, align: "left"};
    this.tiny_font = {fontFamily: "BitOperator", fontSize: 12, fontWeight: 200, fill: 0x000000, letterSpacing: 1, align: "left"};
    this.grey_font = {fontFamily: "BitOperator", fontSize: 24, fontWeight: 200, fill: 0xb1b2b5, letterSpacing: 1, align: "left"};
    

    // make the layout
    let top_banner = makeBlank(layers["banner"], game_width, 60, 0, 0);
    top_banner.tint = 0xb1b2b5;

    let bottom_banner = makeBlank(layers["banner"], game_width, 20, 0, 460);
    bottom_banner.tint = 0xb1b2b5;

    this.title = makeText("Follow Through", this.core_font, layers["banner"], 341, 29, 0, 0.5);

    this.trash_visible = false;
    // big trash button
    this.trash = makeSquishButton("trash", layers["banner"],
        841 + 22.5, 31, true, "pop",
        () => {
          this.trash_visible = this.trash_visible == false ? true : false;

          for (let c = 0; c < 8; c++) {
            if (c in this.data) {
              this.elements[c].element_trash.visible = this.trash_visible == true ? true : false
            }
          }
        },
        ()=> {return this.stateGuard()}
    );
    this.trash.scale = (0.35, 0.35);

    this.edit_visible = false;
    // big edit button
    this.edit = makeSquishButton("gear", layers["banner"],
        791 + 22.5, 31, true, "pop",
        () => {
          this.edit_visible = this.edit_visible == false ? true : false;

          // for (let c = 0; c < 8; c++) {
          //   if (c in this.data) {
          //     this.elements[c].element_edit.visible = this.edit_visible == true ? true : false
          //   }
          // }
        },
        ()=> {return this.stateGuard()}
    );
    this.edit.scale = (0.35, 0.35);

    this.data = {
      0: {
        title:"Sword Fighting",
        decay: 3,
        timestamp: this.getFlatDate(),
        health: 4,
        color: 3,
      },
      1: {
        title:"Ab Work",
        decay: 1,
        timestamp: this.getFlatDate(),
        health: 2,
        color: 4,
      },
      2: {
        title:"Chinese Practice",
        decay: 1,
        timestamp: this.getFlatDate(),
        health: 5,
        color: 2,
      },
      3: {
        title:"Drawing Practice",
        decay: 1,
        timestamp: this.getFlatDate(),
        health: 3,
        color: 0,
      },
      4: {
        title:"Shoulder Therapy",
        decay: 1,
        timestamp: this.getFlatDate(),
        health: 3,
        color: 7,
      },
    }
    // this.loadData();

    this.initializeElements();
    this.initializeAddBox();

    this.state = "main";
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

      let num = i;

      // element add box button (the whole element is a button)
      element_background.eventMode = 'static';
      element_background.on('pointerup', ()=> {
        if (this.stateGuard() == false) return;
        console.log(num);
        console.log(this.data);
        if ((num in this.data) == false && layers["add_box"].visible == false) {
          this.prepareAddMode(num);
          this.state = "add";
          soundEffect("pop");
          layers["add_box"].visible = true;
        }
      });

      this.health_bars[i] = new PIXI.Container();
      this.elements[i].addChild(this.health_bars[i])
      this.updateHealthBars(i);
    }
  }


  initializeAddBox() {
    let layers = this.layers;


    layers["add_box"].visible = false;

    let soft_cover = makeBlank(layers["add_box"], 900, 480, 0, 0);
    soft_cover.tint = 0xffffff;
    soft_cover.alpha = 0.5;

    let add_box_shadow = makeBlank(layers["add_box"], 650, 300, 130, 80);
    add_box_shadow.tint = 0xa5a5a5;
    let add_box_shadow_2 = makeBlank(layers["add_box"], 654, 304, 118, 68);
    add_box_shadow_2.tint = 0x000000;

    let add_box = makeBlank(layers["add_box"], 650, 300, 120, 70);
    add_box.tint = 0xffffff;

    this.add_box_name = makeText("Name: ", this.core_font, layers["add_box"], 150, 110, 0, 0.5);
    this.add_box_grey = makeText("(just start typing)", this.grey_font, layers["add_box"], 250, 110, 0, 0.5);
    
    let add_box_decay = makeText("Decay Time in Days: ", this.core_font, layers["add_box"], 150, 170, 0, 0.5);
    let add_box_color = makeText("Color: ", this.core_font, layers["add_box"], 150, 230, 0, 0.5);

    // add box x_mark
    let x_mark = makeSquishButton("x_mark", layers["add_box"],
        740, 95, true, "pop",
        ()=> {
          layers["add_box"].visible = false;
          this.state = "main";
        },
        ()=> {return this.stateGuard("add")}
    );
    x_mark.scale.set(0.5, 0.5);

    // add box check_mark
    this.check_mark = makeSquishButton("check_mark", layers["add_box"],
        743, 345, true, "pop",
        ()=> {
          console.log("here");


          this.data[this.add_box_element_number] = {
            title:this.new_data.title,
            decay: this.new_data.decay,
            timestamp: this.getFlatDate(),
            health: this.new_data.health,
            color: this.new_data.color,
          }
          this.initializeElements();

          layers["add_box"].visible = false;
          this.state = "main";
        },
        ()=> {return this.stateGuard("add")}
    );
    this.check_mark.scale.set(0.5, 0.5);

    // add box decay down
    let decay_down = makeSquishButton("left_button", layers["add_box"],
        480, 173, true, "pop",
        ()=> {
          // console.log("here");
          // layers["add_box"].visible = false;
          // this.state = "main";
          this.new_data.decay -= 1;
          if (this.new_data.decay < 1) this.new_data.decay = 1;
          this.add_box_decay.text = this.new_data.decay;
        },
        ()=> {return this.stateGuard("add")}
    );
    decay_down.scale.set(0.5, 0.5);

    this.add_box_decay = makeText("0", this.core_font, layers["add_box"], 508, 170, 0.5, 0.5);

    // add box decay up
    let decay_up = makeSquishButton("right_button", layers["add_box"],
        540, 173, true, "pop",
        ()=> {
          // console.log("here");
          // layers["add_box"].visible = false;
          // this.state = "main";
          this.new_data.decay += 1;
          // if (this.new_data.decay < 1) this.new_data.decay = 1;
          this.add_box_decay.text = this.new_data.decay;
        },
        ()=> {return this.stateGuard("add")}
    );
    decay_up.scale.set(0.5, 0.5);

    this.add_box_colors_x = 175;
    this.add_box_colors_y = 280;

    this.add_box_color_selection_box = makeBlank(layers["add_box"], 54, 54, this.add_box_colors_x, this.add_box_colors_y);
    this.add_box_color_selection_box.anchor.set(0.5, 0.5);
    this.add_box_color_selection_box.tint = 0xd0d0d0;

    // this.add_box_colors = [];
    for (let i = 0; i < 8; i++) {
          // element health down button
        let num = i;
        let b = makeSquishButton(
          "button_" + i, layers["add_box"],
          this.add_box_colors_x + 60 * i, this.add_box_colors_y, true, "pop",
          ()=> {
            this.new_data.color = num;
            this.add_box_color_selection_box.x = this.add_box_colors_x + 60 * num;
          },
          ()=> {return this.stateGuard("add")});
        b.scale.set(0.35, 0.35);
        this.add

    }
  }


  updateHealthBars(i) {
    this.health_bars[i].removeChildren();
    this.health_bars[i].buttons = [];
    let data = this.data;
    this.elements[i].element_trash = null;
    if (i in data) {

      let num = i;
      // element trash button
      let element_trash = makeSquishButton("trash", this.elements[i],
          400 + 22.5, 31, true, "pop",
          ()=> {
            console.log(this.data);
            console.log(num);
            delete this.data[num];
            console.log("New data");
            console.log(this.data);
            this.initializeElements();
          },
          ()=> {return this.stateGuard()}
      );
      element_trash.scale = (0.35, 0.35);
      // element_trash.visible = false;
      element_trash.visible = this.trash_visible == true ? true : false
      this.elements[i].element_trash = element_trash;

      let text = makeText(data[i].title, this.core_font, this.health_bars[i], 18, 23, 0, 0.5);
      let decay_text = makeText("0/" + data[i].decay, this.tiny_font, this.health_bars[i], 418, 85, 0, 0.5);
      this.elements[i].decay_text = decay_text;
      for (let j = 0; j < 7; j++) {
        let sprite_name = (data[i].health > j) ? "button_" + data[i].color : "button_e" 
        let health_button = null;
        if (data[i].health == j + 1) {
          // element health down button
          health_button = makeSquishButton(
            sprite_name, this.health_bars[i],
            18 + 50 * j + 22.5, 45 + 22.5, true, "button",
            ()=> {
              data[i].timestamp = this.getFlatDate();
              data[i].health -= 1;
              this.updateHealthBars(i);
            },
            ()=> {return this.stateGuard()});
        } else if (data[i].health == j) {
          // element health up button
          health_button = makeSquishButton(
            sprite_name, this.health_bars[i],
            18 + 50 * j + 22.5, 45 + 22.5, true, "button",
            ()=> {
              data[i].timestamp = this.getFlatDate();
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
            },
            ()=> {return this.stateGuard()}
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


  stateGuard(check_state="main") {
    return this.state == check_state;
  }


  prepareAddMode(number = -1, old_data=null) {
    if (old_data != null) {
      this.new_data = {
        title:old_data.title,
        decay: old_data.decay,
        timestamp: old_data.timestamp,
        health: old_data.health,
        color: old_data.color,
      }
    } else {
      this.new_data = {
        title:"",
        decay: 1,
        timestamp: null,
        health: 0,
        color: dice(8)-1,
      };
    }
    this.add_box_name.text = "Name: " + this.new_data.title;
    this.add_box_element_number = number;
    this.add_box_decay.text = this.new_data.decay;
    this.add_box_color_selection_box.position.set(this.add_box_colors_x + 60 * this.new_data.color, this.add_box_colors_y);
    this.add_box_grey.visible = (this.new_data.title.length == 0);
    this.check_mark.visible = (this.new_data.title.length > 0);
  }


  keyDown(ev) {
    let key = ev.key;

    if (this.stateGuard("add")) {
      for (i in lower_array) {
        if (key === lower_array[i]) {
          this.addType(lower_array[i]);
        }
      }
      for (i in letter_array) {
        if (key === letter_array[i]) {
          this.addType(letter_array[i]);
        }
      }
      if (key === " ") this.addType(" ");
      if (key === "Backspace" || key === "Delete") this.deleteType();
    }
  }


  addType(letter) {
    this.new_data.title += letter;
    this.add_box_name.text = "Name: " + this.new_data.title;
    this.add_box_grey.visible = (this.new_data.title.length == 0);
    this.check_mark.visible = (this.new_data.title.length > 0);
  }


  deleteType() {
    console.log("yo")
    if (this.new_data.title.length > 0) this.new_data.title = this.new_data.title.slice(0,-1);
    this.add_box_name.text = "Name: " + this.new_data.title;
    this.add_box_grey.visible = (this.new_data.title.length == 0);
    this.check_mark.visible = (this.new_data.title.length > 0);
  }


  getFlatDate() {
    return new Date(new Date().setHours(0,0,0,0));
  }


  // Regular update method
  update(diff) {
    let fractional = diff / (1000/30.0);

    let current_date = this.getFlatDate();
    for (let i = 0; i < 8; i++) {
      if (i in this.data) {
        let old_date = this.data[i].timestamp;
        let days = (current_date - old_date) / one_day;
        this.elements[i].decay_text.text = days + "/" + this.data[i].decay; 
        if (days >= this.data[i].decay) {
          let number = Math.floor(days / this.data[i].decay);
          this.data[i].health -= number;
          if (this.data[i].health < 0) this.data[i].health = 0;
          this.data[i].timestamp = current_date;
          this.updateHealthBars(i);
          this.elements[i].decay_text.text = "0/" + this.data[i].decay;
        }
      }
    }
  }
}

