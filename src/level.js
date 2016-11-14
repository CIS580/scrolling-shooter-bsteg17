"use strict";

var Enemy = require('./enemy.js');

var ALL_WAVES = [
  [
    [new Enemy()],
    [],
    []
  ],
  [
    [],
    [],
    []
  ],
  [
    [],
    [],
    []
  ]
];

module.exports = exports = Level;

/**
 * @constructor Level
 */
function Level(i) {
  this.waveNumber = 0;
  this.waves = ALL_WAVES[i];
}

Level.prototype.nextWave = function() {
  if(this.waveNumber >= this.waves.length) {
    return false; 
  }
  this.waveNumber++;
  return this.waves[this.waveNumber];
}
