//
// This file contains the root "game" class for Follow Through. This is the starting point.
//
// Copyright 2023 Alpha Zoo LLC.
// Written by Matthew Carlin
//

'use strict';

var log_performance = true;
var performance_result = null;

var first_screen = "fight";

var subgames = ["fight", "add", "bestiary", "me"];

var pixi = null;
var game = null;

function initialize() {
  game = new Game();  
}

class Game {
  constructor() {
    this.tracking = {};

    this.basicInit();

    this.keymap = {};

    // Useful place to load config, such as the map
    //this.content_config_length = Object.keys(content_config).length;

    document.addEventListener("keydown", (ev) => {this.handleKeyDown(ev)}, false);
    document.addEventListener("keyup", (ev) => {this.handleKeyUp(ev)}, false);
    document.addEventListener("mousemove", (ev) => {this.handleMouseMove(ev)}, false);
    document.addEventListener("mousedown", (ev) => {this.handleMouseDown(ev)}, false);
    document.addEventListener("mouseup", (ev) => {this.handleMouseUp(ev)}, false);

    window.onfocus = (ev) => {
      if (this.keymap != null) {
        this.keymap["ArrowDown"] = null;
        this.keymap["ArrowUp"] = null;
        this.keymap["ArrowLeft"] = null;
        this.keymap["ArrowRight"] = null;
      }
    };
    window.onblur = (ev) => {
      if (this.keymap != null) {
        this.keymap["ArrowDown"] = null;
        this.keymap["ArrowUp"] = null;
        this.keymap["ArrowLeft"] = null;
        this.keymap["ArrowRight"] = null;
      }
    };
  }


  basicInit() {
    this.width = 1600;
    this.height = 900;

    // Create the pixi application
    pixi = new PIXI.Application(this.width, this.height, {antialias: true});
    const initPromise = pixi.init({ background: '#b1b2b5', resizeTo: window });
    
    initPromise.then((thing) => {
      document.body.appendChild(pixi.canvas);

      // document.getElementById("mainDiv").appendChild(pixi.view);
      this.renderer = pixi.renderer;
      pixi.renderer.backgroundColor = 0xFFFFFF;
      pixi.renderer.resize(this.width,this.height);
      pixi.renderer.backgroundColor = 0xb1b2b5;

      // Set up rendering and tweening loop
      let ticker = PIXI.Ticker.shared;
      ticker.autoStart = false;
      ticker.stop();

      let fps_counter = 0;
      let last_frame = 0;
      let last_performance_update = 0;

      let animate = now => {
        
        fps_counter += 1;
        let diff = now - last_frame;
        last_frame = now

        if (!this.paused == true) {
          this.trackStart("tween");
          TWEEN.update(now);
          this.trackStop("tween");

          this.trackStart("update");
          this.update(diff);
          this.trackStop("update");

          this.trackStart("animate");
          ticker.update(now);
          pixi.renderer.render(pixi.stage);
          this.trackStop("animate");

          if (now - last_performance_update > 3000 && log_performance) {
            //There were 3000 milliseconds, so divide fps_counter by 3
            // console.log("FPS: " + fps_counter / 3);
            // this.trackPrint(["update", "tween", "animate"]);
            fps_counter = 0;
            last_performance_update = now;
          }
        }
        requestAnimationFrame(animate);
      }
      animate(0);

      this.preloadAnimations(() => {
        this.initializeScreens();
      });
    })

    
  }


  //
  // Tracking functions, useful for testing the timing of things.
  //
  trackStart(label) {
    if (!(label in this.tracking)) {
      this.tracking[label] = {
        start: 0,
        total: 0
      }
    }
    this.tracking[label].start = Date.now();
  }


  trackStop(label) {
    if (this.tracking[label].start == -1) {
      console.log("ERROR! Tracking for " + label + " stopped without having started.")
    }
    this.tracking[label].total += Date.now() - this.tracking[label].start;
    this.tracking[label].start = -1
  }


  trackPrint(labels) {
    var sum_of_totals = 0;
    for (var label of labels) {
      sum_of_totals += this.tracking[label].total;
    }
    for (var label of labels) {
      var fraction = this.tracking[label].total / sum_of_totals;
      console.log(label + ": " + Math.round(fraction * 100).toFixed(2) + "%");
    }
  }


  preloadAnimations(and_then) {
    let Assets = PIXI.Assets;

    // Pastel Buttons for Follow Through come from
    // https://villaniouscat.itch.io/pastelpixelbuttons/
    Assets.add({ alias: "fireworks_blue", src: "Art/fireworks_blue.json"});
    Assets.add({ alias: "fireworks_orange", src: "Art/fireworks_orange.json"});
    Assets.add({ alias: "m01", src: "Art/Monsters/m01.json"});
    Assets.add({ alias: "m02", src: "Art/Monsters/m02.json"});
    Assets.add({ alias: "m03", src: "Art/Monsters/m03.json"});
    Assets.add({ alias: "m04", src: "Art/Monsters/m04.json"});
    Assets.add({ alias: "m05", src: "Art/Monsters/m05.json"});
    Assets.add({ alias: "m06", src: "Art/Monsters/m06.json"});
    Assets.add({ alias: "m07", src: "Art/Monsters/m07.json"});
    Assets.add({ alias: "m08", src: "Art/Monsters/m08.json"});
    Assets.add({ alias: "h01", src: "Art/Heroes/h01.json"});
    Assets.add({ alias: "h02", src: "Art/Heroes/h02.json"});
    Assets.add({ alias: "h03", src: "Art/Heroes/h03.json"});
    Assets.add({ alias: "forest_background", src: "Art/forest_background.png" });
    Assets.add({ alias: "button_0", src: "Art/button_0.png" });
    Assets.add({ alias: "button_1", src: "Art/button_1.png" });
    Assets.add({ alias: "button_2", src: "Art/button_2.png" });
    Assets.add({ alias: "button_3", src: "Art/button_3.png" });
    Assets.add({ alias: "button_4", src: "Art/button_4.png" });
    Assets.add({ alias: "button_5", src: "Art/button_5.png" });
    Assets.add({ alias: "button_6", src: "Art/button_6.png" });
    Assets.add({ alias: "button_7", src: "Art/button_7.png" });
    Assets.add({ alias: "button_e", src: "Art/button_e.png" });
    Assets.add({ alias: "paper_1", src: "Art/paper_1.png" });
    Assets.add({ alias: "paper_2", src: "Art/paper_2.png" });
    Assets.add({ alias: "trash", src: "Art/trash.png" });
    Assets.add({ alias: "gear", src: "Art/gear.png" });
    Assets.add({ alias: "x_mark", src: "Art/x_mark.png" });
    Assets.add({ alias: "check_mark", src: "Art/check_mark.png" });
    Assets.add({ alias: "left_button", src: "Art/left_button.png" });
    Assets.add({ alias: "right_button", src: "Art/right_button.png" });
    Assets.add({ alias: "BitOperator.ttf", src:"BitOperator.ttf", data: { scaleMode: PIXI.SCALE_MODES.NEAREST }});
    const assetsPromise = Assets.load(
      ["fireworks_blue", "fireworks_orange",
       "button_0","button_1","button_2","button_3",
       "button_4","button_5","button_6","button_7",
       "paper_1", "paper_2",
       "button_e","trash","gear", "x_mark",
       "left_button", "right_button",
       "check_mark", "BitOperator.ttf",
       "forest_background",
       "h01", "h02", "h03",
       "m01", "m02", "m03", "m04", "m05", "m06", "m07", "m08"]
    );
    assetsPromise.then((assets) => {
      console.log("the assets");
      console.log(Assets.get("fireworks_orange"));
      and_then();
    });
  }


  handleMouseMove(ev) {
    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].mouseMove != null) {
      this.screens[this.current_screen].mouseMove(ev);
    }
  }


  handleMouseDown(ev) {
    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].mouseDown != null) {
      this.screens[this.current_screen].mouseDown(ev);
    }
  }


  handleMouseUp(ev) {
    console.log("le clicks")
    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].mouseUp != null) {
      this.screens[this.current_screen].mouseUp(ev);
    }
  }


  handleKeyUp(ev) {
    ev.preventDefault();

    this.keymap[ev.key] = null;

    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].keyUp != null) {
      this.screens[this.current_screen].keyUp(ev);
    }
  }


  handleKeyDown(ev) {
    if (ev.key === "Tab") {
      ev.preventDefault();
    }

    this.keymap[ev.key] = true;

    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].keyDown != null) {
      this.screens[this.current_screen].keyDown(ev);
    }
  }


  update(diff) {
    if (this.screens != null && this.current_screen != null) {
      this.screens[this.current_screen].update(diff);
    }
  }
}
