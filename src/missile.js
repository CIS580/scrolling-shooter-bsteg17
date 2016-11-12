"use strict";

/* Classes and Libraries */
const Vector = require('./vector');

/**
 * @module Missile
 * A class representing a player's helicopter
 */
module.exports = exports = Missile;

/**
 * @constructor Missile
 * Creates a missile 
 * @param {BulletPool} bullets the bullet pool
 */
function Missile(position) {
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Missile.prototype.update = function(elapsedTime, input) {

}

Missile.prototype.render = function(elapasedTime, ctx) {
}

