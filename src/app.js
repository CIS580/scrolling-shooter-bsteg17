"use strict";

var GAME_STOP_TIME = 3000;

/* Classes and Libraries */
const Game = require('./game');
const Vector = require('./vector');
const Camera = require('./camera');
const Player = require('./player');
const Enemy = require('./enemy');
const BulletPool = require('./bullet_pool');
const Background = require('./background');
const Level = require('./level');


/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var gameStop = false;
var gameStopTimer = 0;
var input = {
  up: false,
  down: false,
  left: false,
  right: false,
  shoot: false
}
var camera = new Camera(canvas);
var backgrounds = [new Background("space.png", 1), new Background("planets.png", 3), new Background("asteroids.png", 7)];
var missiles = [];
var player = new Player(camera);
var enemies = [];
var levels = [new Level(0), new Level(1), new Level(2)];

/**
 * @function onkeydown
 * Handles keydown events
 */
window.onkeydown = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = true;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = true;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = true;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = true;
      event.preventDefault();
      break;
    case " ":
      input.shoot = true;
      event.preventDefault();
      break;
  }
}

/**
 * @function onkeyup
 * Handles keydown events
 */
window.onkeyup = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = false;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = false;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = false;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = false;
      event.preventDefault();
      break;
    case " ":
      input.shoot = false;
      event.preventDefault();
      break;
  }
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  if(gameStop) {
    if(gameStopTimer <= GAME_STOP_TIME) {
      gameStopTimer += elapsedTime;
    } else {
      gameStopTimer = 0;
      gameStop = false;
    }
    return;
  }

  // update the player
  player.update(elapsedTime, input);

  // update the enemy 
  enemies.forEach(function(e){ e.update(elapsedTime, enemies); });
  
  // update the background
  backgrounds.forEach(function(bg){ bg.update(); });
  
  // update the camera
  camera.update(player.position);

  // Update missiles
  var markedForRemoval = [];
  missiles.forEach(function(missile, i){
    missile.update(elapsedTime);
    if(Math.abs(missile.position.x - camera.x) > camera.width * 2)
      markedForRemoval.unshift(i);
  });
  // Remove missiles that have gone off-screen
  markedForRemoval.forEach(function(index){
    missiles.splice(index, 1);
  });
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  if(gameStop) {
    renderGameStop(elapsedTime, ctx);
    return;
  }
    
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 1024, 786);

  // TODO: Render background
  backgrounds.forEach(function(bg){ bg.render(); });

  // Transform the coordinate system using
  // the camera position BEFORE rendering
  // objects in the world - that way they
  // can be rendered in WORLD cooridnates
  // but appear in SCREEN coordinates
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  renderWorld(elapsedTime, ctx);
  ctx.restore();

  // Render the GUI without transforming the
  // coordinate system
  renderGUI(elapsedTime, ctx);
}

function renderGameStop(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillText("Level complete. Next level commencing.", 100, 100);
}

/**
  * @function renderWorld
  * Renders the entities in the game world
  * IN WORLD COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function renderWorld(elapsedTime, ctx) {

    // Render the missiles
    missiles.forEach(function(missile) {
      missile.render(elapsedTime, ctx);
    });

    // Render the player
    player.render(elapsedTime, ctx);
    enemies.forEach(function(e){ e.render(elapsedTime, ctx); });
}

/**
  * @function renderGUI
  * Renders the game's GUI IN SCREEN COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx
  */
function renderGUI(elapsedTime, ctx) {
  //draw black gui background for visibility 
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, 30);
  //'Health:' text
  ctx.fillStyle = "white";
  ctx.font = "Georgia 20px oblique";
  ctx.fillText("Health:", 0, 10);
  //draw health bar
  ctx.fillStyle = "red";
  ctx.fillRect(35, 2, ((canvas.width - 40) / 100) * player.health, 10);
  //'Cooldown:' text
  ctx.fillStyle = "white";
  ctx.font = "Georgia 20px oblique";
  ctx.fillText("Cooldown:", 0, 22);
  //draw weapon cooldown bar
  if (player.weapon.cooldownElapsed < player.weapon.weaponCooldown) {
    ctx.fillStyle = "blue";
    ctx.fillRect(50, 15, (canvas.width - 55) * (player.weapon.cooldownElapsed / player.weapon.weaponCooldown), 10);
  } else {
    ctx.fillStyle = "green";
    ctx.fillRect(50, 15, (canvas.width - 55), 10);
  }
}
