// Sudov.im
// Version 0.0.7

// TODO Standardize mobs to objects
// TODO Proper collision detection
// TODO Basic pathing
// TODO Debug path drawing
// TODO Add more arguments for unit statistics
// TODO Better modularize or restructure functions
// TODO Start separating code up
// TODO More intuitive clicking interface
// - TODO Left click: select
// - TODO Right click: action
// - TODO Middle click hold: pan
// TODO Enemy targeting and selection

// Draw functions
var canvasWidth = 800;
var canvasHeight = 500;

var canvas = document.getElementById('test');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
var ctx = canvas.getContext('2d');

function clear() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function rect(x, y, w, h) {
  //ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.closePath();
  ctx.fill();
}


// Draw test units
var unit = new Unit();
var unitImage = unit.image;
function Unit() {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
      ctx.canvas.width = 20;
      ctx.canvas.height = 20;
  this.image = canvas;
  this.width = ctx.canvas.width;
  this.height = ctx.canvas.height;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.rect(0, 0, 20, 20);
  ctx.closePath();
  ctx.fill();
}

var unitselect = new Unitselect();
var unitselectImage = unitselect.image;
function Unitselect() {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
      ctx.canvas.width = 20;
      ctx.canvas.height = 20;
  this.image = canvas;
  this.width = ctx.canvas.width;
  this.height = ctx.canvas.height;
  ctx.fillStyle = '#3F3';
  ctx.beginPath();
  ctx.rect(0, 0, 20, 20);
  ctx.closePath();
  ctx.fill();
}

// Draw click
var clickVisual = new ClickVisual();
var clickVisualImage = clickVisual.image;
function ClickVisual() {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
      ctx.canvas.width = 40;
      ctx.canvas.height = 40;
  this.image = canvas;
  this.width = ctx.canvas.width;
  this.height = ctx.canvas.height;
  ctx.fillStyle = '#AAA';
  ctx.beginPath();
  ctx.arc(20,20,15,Math.PI*2, 0, true);
  ctx.closePath();
  ctx.fill();
}

// Draw a line to indicate direction
function unitPath(unit) {
  var sinx = Math.sin(unit.direction);
  var cosy = Math.cos(unit.direction);
  ctx.beginPath();
  ctx.moveTo(unit.x,unit.y);
  ctx.lineTo(unit.x + sinx * 25,unit.y + cosy * 25);
  ctx.stroke();
}

// Bottom text
function debugtext(left,right,line) {
  ctx.textAlign = 'right';
  ctx.font = '22pt Calibri';
  ctx.fillStyle = '#000';
  ctx.fillText (right, canvas.width, canvas.height - line);
  ctx.textAlign = 'left';
  ctx.fillText (left, 0, canvas.height - line);
}

function helptext(left,line) {
  ctx.textAlign = 'left';
  ctx.font = '14pt Calibri';
  ctx.fillStyle = '#000';
  ctx.fillText (left, 0, canvas.height - line);
}



// Unit functions
var movecommand = {x:-10,y:-10};

var player = {name:"player",x:100,y:150,speed:3,direction:0,size:15,health:500,weapon:{damage:45,speed:3,interval:0}};
var mob1 = {name:"mob1",x:600,y:300,speed:1,direction:0,size:15,health:400,weapon:{damage:15,speed:2,interval:0}};
var mob2 = {name:"mob2",x:500,y:400,speed:1,direction:0,size:15,health:200,weapon:{damage:15,speed:1,interval:0}};
var money = 0;

function moveinput(x,y){
  movecommand.x = x;
  movecommand.y = y;
}

function collisionradius(unit,target) {
  var dx = unit.x - target.x;
  var dy = unit.y - target.y;
  return (Math.sqrt(dx * dx + dy * dy))
}


function moveunit(unit) {
  unit.x += Math.sin(unit.direction) * unit.speed;
  unit.y += Math.cos(unit.direction) * unit.speed;
}

// Move the specified unit to the target
function rotateunit(unit,target){

  // This will probably be moved out later
  if (movecommand.x < 0) {return};
    if ((Math.abs(unit.x-target.x) > 15) || (Math.abs(unit.y-target.y) > 15)) {
      moveunit(unit);
  } else {
    return
  }
  var rotation = unit.direction - Math.atan2(target.x-unit.x,target.y-unit.y);


  if (rotation > Math.PI) {
    rotation -= Math.PI*2
  } else if (rotation < Math.PI * -1) {
    rotation += Math.PI*2
  }

  if (unit.direction > Math.PI) {
    unit.direction -= Math.PI*2
  } else if (unit.direction < Math.PI * -1) {
    unit.direction += Math.PI*2
  }

  if (rotation > 0.2) {
    unit.direction -= 0.2;
  }
  else if (rotation < -0.2) {
    unit.direction += 0.2;
  }
}



// Selection functions
var clicktype = "selection";
var showhelp = 0;

function selectaction(x,y) {
  if (x > 720 && y < 30) {
    clicktype = "building"
  } else if (x < player.x + 30 && x > player.x - 30 && y < player.y + 30 && y > player.y - 30) {
    clicktype = "unit";
  } else if (x < 60 && y < 30) {
    helpText();
  }
}

function helpText() {
  if (showhelp == 1) {
    showhelp = 0
  } else {
    showhelp = 1
  }
}


var buildings = {}
function placebuilding(x,y) {
  buildings.building1 = {name:"building1",x:x,y:y};
  clicktype = "selection";
}


function combat(unit,target) {
  if (unit.weapon.interval > 0) {
    unit.weapon.interval -= 0.02
  } else {
    unit.weapon.interval = unit.weapon.speed;
    target.health -= unit.weapon.damage;
  }
}

// Main loop
function main() {
  clear();

  ctx.drawImage(clickVisualImage, movecommand.x - 10, movecommand.y - 10, 20, 20);

  if (buildings.building1) {
  ctx.drawImage(unitImage, buildings.building1.x - 15, buildings.building1.y - 30, 30, 60);
  }

  function drawunit(unit) {
    if (clicktype == "unit" && unit.name == "player") {
      ctx.drawImage(unitselectImage, unit.x - 12, unit.y - 12, 24, 24);
    }
    ctx.drawImage(unitImage, unit.x - 10, unit.y - 10, 20, 20);
    unitPath(unit);
  }

  if (player.health > 0) {
    drawunit(player);
    rotateunit(player,movecommand);
    if (collisionradius(player,mob1) < 30 && mob1.health > 0) {
      combat(player,mob1)
    } else if (collisionradius(player,mob2) < 30 && mob2.health > 0) {
      combat(player,mob2)
    }
  } else {
    player.health = "dead"
  }

  // mob1 agro radius
  if (mob1.health > 0) {
    drawunit(mob1);
    if (collisionradius(mob1,player) < 250) {
      if (collisionradius(mob1,mob2) < 25 && collisionradius(mob1,player) < 30) {
        mob1.x += (mob1.x-mob2.x) / 30;
        mob1.y += (mob1.y-mob2.y) / 30;
      } else {
        rotateunit(mob1,player);
      }
      if (collisionradius(mob1,player) < 30 && player.health > 0) {
        combat(mob1,player);
      }
    }
  } else {
    mob1.health = "dead";
  }

  if (mob2.health > 0) {
    drawunit(mob2);
    if (collisionradius(mob2,player) < 250) {
      if (collisionradius(mob2,mob1) < 25 && collisionradius(mob1,player) < 30) {
        mob2.x += (mob2.x-mob1.x) / 30;
        mob2.y += (mob2.y-mob1.y) / 30;
      } else {
        rotateunit(mob2,player);
      }
      if (collisionradius(mob2,player) < 30 && player.health > 0) {
        combat(mob2,player);
      }
    }
  } else {
    mob2.health = "dead";
  }

  if (buildings.building1 !== undefined && collisionradius(player,buildings.building1) < 50) {
    money += 0.125
  }

  if (showhelp == 1) {
    helptext("Click the top left unit to select it or click 'Build' to place a building",canvas.height - 40);
    helptext("Right click to cancel the selection",canvas.height - 55);
    helptext("Other units will follow if they are in range",canvas.height - 70);
    helptext("Units will automatically attack if they are next to each other",canvas.height - 85);
    helptext("Hint: Only take on one at a time",canvas.height - 100);
    helptext("(Test) Standing next to a building generates money, which is currently useless",canvas.height - 115);
  }

  debugtext("Help","Build",canvas.height - 20);
  debugtext("Money: " + Math.floor(money),clicktype, 24);
  debugtext("Enemy1: " + mob1.health + ", Enemy2: " + mob2.health, "Player health: " + player.health, 2);
}


// Initialization
function init() {
  intervalId = setInterval(main, 20);
  return intervalId;
}

window.onload = function () {
  init();
};



// Input
document.addEventListener("DOMContentLoaded", initinput, false);

function initinput() {
  canvas.addEventListener("mousedown", getPosition, false);
}

function getPosition(event) {
  var x = new Number();
  var y = new Number();
  var canvas = document.getElementById("test");
  if (event.x != undefined && event.y != undefined) {
    x = event.x;
    y = event.y;
  } else {
    x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;

  // Detect which mouse button is clicked
  if (event.which == 3) {
    clicktype = "selection"
  } else if (event.which == 1) {
    if (clicktype == "selection") {
      selectaction(x,y)
    } else if (clicktype == "unit") {
      moveinput(x,y);
    } else if (clicktype == "building") {
      placebuilding(x,y);
    }
  }

}



