/*
 * HTML5 lightcycles
 * copyright (c) 2013 Jason Straughan - JDStraughan.com
 * MIT License - http://opensource.org/licenses/MIT
 */
canvas = document.getElementById("the-game");
context = canvas.getContext("2d");
started = false;

enemy = {
  type: 'program',
  width: 10,
  height: 10,
  color: '#FF5500',
  history: [],
  score: 0,
  current_direction: null
};

player = {
  type: 'user',
  width: 10,
  height: 10,
  color: '#55AAFF',
  history: [],
  score: 0,
  current_direction: null
};

keys = {
  up: [38, 87],
  down: [40, 83],
  left: [37, 65],
  right: [39, 68],
  start_game: [13, 32]
};

pointer = {
  x: 0,
  y: 0
}

lastKey = null;

game = {
  
  over: true,
  started: false,
  
  start: function() {
    cycle.resetPlayer();
    cycle.resetEnemy();
    game.over = false;
    player.current_direction = "left";
    game.resetCanvas();
  },

  drawScore: function() {
    context.fillStyle = '#FFF';
    context.font = (canvas.height / 15) + 'px sans-serif';
    context.textAlign = 'center';
    context.fillText('ENEMY: ' + enemy.score, canvas.width/3, canvas.height/4); 
    context.fillText('PLAYER: ' + player.score, canvas.width/1.5, canvas.height/4);
  },

  newGame: function(cycle) {
    context.fillStyle = '#FFF';
    context.font = (canvas.height / 15) + 'px sans-serif';
    context.textAlign = 'center';
    context.fillText('NEW GAME', canvas.width/2, canvas.height/2);
    context.fillStyle = '#AAA';
    context.fillText('move the cursor inside the circle to start', canvas.width/2, canvas.height-20);
  },
  
  stop: function(cycle) {
    game.over = true;
    context.fillStyle = '#FFF';
    context.font = (canvas.height / 15) + 'px sans-serif';
    context.textAlign = 'center';
    winner = cycle.type == 'program' ? 'USER' : 'PROGRAM';
    context.fillText('GAME OVER - ' + winner + ' WINS', canvas.width/2, canvas.height/2);
    if (winner === "USER"){
      player.score += 1
    } else {
      enemy.score += 1
    }
    context.fillText('press spacebar to continue', canvas.width/2, canvas.height/2 + (cycle.height * 3)); 
    game.drawScore()
    // cycle.color = "#F00";
  },
  
  newLevel: function() {
    cycle.resetPlayer();
    cycle.resetEnemy();
    this.resetCanvas();
  },
  
  resetCanvas: function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  
};

cycle = {
  
  resetPlayer: function() {
    player.x = canvas.width - (canvas.width / (player.width / 2) + 4);
    player.y = (canvas.height / 2) + (player.height / 2);
    player.color = player.color;
    player.history = [];    
    player.current_direction = "left";
  },
  
  resetEnemy: function() {
    enemy.x = (canvas.width / (enemy.width / 2) - 4);
    enemy.y = (canvas.height / 2) + (enemy.height / 2);
    enemy.color = enemy.color;
    enemy.history = [];
    enemy.current_direction = "right";
  },
  
  move: function(cycle, opponent) {
    switch(cycle.current_direction) {
      case 'up':
        cycle.y -= cycle.height;
        break;
      case 'down':
        cycle.y += cycle.height;
        break;
      case 'right':
        cycle.x += cycle.width;
        break;
      case 'left':
        cycle.x -= cycle.width;
        break;
    }
    if (this.checkCollision(cycle, opponent)) {
      game.stop(cycle);
    }
    coords = this.generateCoords(cycle);
    cycle.history.push(coords);
  },
  
  moveEnemy: function() {
    advisor = this.enemyPingDirections();
    if (advisor[enemy.current_direction] < enemy.width || Math.ceil(Math.random() * 10) == 5) {
      enemy.current_direction = advisor.best;
    }
    this.move(enemy, player);
  },
  
  enemyPingDirections: function() {
    pong = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    };
    // Up
    for (i = enemy.y - enemy.height; i>= 0; i -= enemy.height) {
      pong.up = enemy.y - i - enemy.width;
      if (this.isCollision(enemy.x, i)) break;
    }
    // Down
    for (i = enemy.y + enemy.height; i<= canvas.height; i += enemy.height) {
      pong.down = i - enemy.y - enemy.width;
      if (this.isCollision(enemy.x, i)) break;
    }
    // Left
    for (i = enemy.x - enemy.width; i>= 0; i -= enemy.width) {
      pong.left = enemy.x - i - enemy.width;
      if (this.isCollision(i, enemy.y)) break;
    }
    // Right
    for (i = enemy.x + enemy.width; i<= canvas.width; i += enemy.width) {
      pong.right = i - enemy.x - enemy.width;
      if (this.isCollision(i, enemy.y)) break;
    }
    var largest = {
      key: null,
      value: 0
    };
    for(var j in pong){
        if( pong[j] > largest.value ){
            largest.key = j;
            largest.value = pong[j];
        }
    }
    pong.best = largest.key;
    return pong;
  },

  checkCollision: function(cycle, opponent) {
    if ((cycle.x < (cycle.width / 2)) || 
        (cycle.x > canvas.width - (cycle.width / 2)) || 
        (cycle.y < (cycle.height / 2)) || 
        (cycle.y > canvas.height - (cycle.height / 2)) || 
        (cycle.history.indexOf(this.generateCoords(cycle)) >= 0) || 
        (opponent.history.indexOf(this.generateCoords(cycle)) >= 0)) {
      return true;
    }
  },
  
  isCollision: function(x,y) {
    coords = x + ',' + y;
    if (x < (enemy.width / 2) || 
        x > canvas.width - (enemy.width / 2) || 
        y < (enemy.height / 2) || 
        y > canvas.height - (enemy.height / 2) || 
        enemy.history.indexOf(coords) >= 0 || 
        player.history.indexOf(coords) >= 0) {
      return true;
    }    
  },
  
  generateCoords: function(cycle) {
    return cycle.x + "," + cycle.y;
  },
  
  draw: function(cycle) {
    // context.globalCompositeOperation = 'destination-out';
    var glowWidth;

    glowWidth = cycle.width * 2;
    context.beginPath();
    if(cycle.current_direction == 'left' || cycle.current_direction == 'right') {
      context.moveTo(cycle.x - (cycle.width / 2), cycle.y - (cycle.height / 2));
      context.lineTo(cycle.x + (cycle.width / 2), cycle.y - (cycle.height / 2));
    } else {
      context.moveTo(cycle.x, cycle.y - cycle.width);
      context.lineTo(cycle.x, cycle.y );
    }
    context.lineWidth = glowWidth;
    context.strokeStyle = "rgba(255,255,255,0.2)";
    context.stroke();


    context.fillStyle = cycle.color;
    context.beginPath();
    context.moveTo(cycle.x - (cycle.width / 2), cycle.y - (cycle.height / 2));
    context.lineTo(cycle.x + (cycle.width / 2), cycle.y - (cycle.height / 2));
    
    context.lineWidth = cycle.width;
    context.strokeStyle = cycle.color;
    context.stroke();

    // Set the default mode.
    // context.globalCompositeOperation = 'source-over';
  }
  
};

inverseDirection = function() {
  switch(player.current_direction) {
    case 'up':
      return 'down';
      break;
    case 'down':
      return 'up';
      break;
    case 'right':
      return 'left';
      break;
    case 'left':
      return 'right';
      break;
  }
};

Object.prototype.getKey = function(value){
  for(var key in this){
    if(this[key] instanceof Array && this[key].indexOf(value) >= 0){
      return key;
    }
  }
  return null;
};

addEventListener("keydown", function (e) {
    lastKey = keys.getKey(e.keyCode);
    //alert("get key: " +  keys.getKey(e.keyCode))
    if (['up', 'down', 'left', 'right'].indexOf(lastKey) >= 0  && lastKey != inverseDirection()) {
      player.current_direction = lastKey;
    } else if (['start_game'].indexOf(lastKey) >= 0  && player.history == []) {
      game.start();
    } else if (['start_game'].indexOf(lastKey) >= 0  && game.over) {
      game.start();
    }
}, false);


// addEventListener("mousemove", function (e) {
//   pointer.x = e.pageX - canvas.offsetLeft;
//   pointer.y = e.pageY - canvas.offsetTop;
// })

var time = 0;

loop = function() {

  if(Date.now() - time < 60) return;
  time = Date.now();

  if (game.over === false) {
    var deltaX = Math.abs(pointer.x - player.x),
        deltaY = Math.abs(pointer.y - player.y),
        w = player.width * 2,
        direction;

    if(pointer.x > player.x + w && Math.abs(pointer.y - player.y) < w) {
      direction = 'right';
    }

    if(pointer.x < player.x + w && Math.abs(pointer.y - player.y) < w) {
      direction = 'left';
    }

    if( pointer.y < player.y + w && Math.abs(pointer.x - player.x) < w) {
      direction = 'up';
    }

    if( pointer.y > player.y + w && Math.abs(pointer.x - player.x) < w) {
      direction = 'down';
    }

    if (direction && direction != inverseDirection()) {
      player.current_direction = direction;
    }
  }

  if (game.over === false) {
    cycle.move(player, enemy);
    cycle.draw(player);
    cycle.moveEnemy();
    cycle.draw(enemy);
  } else if(!game.started) {
    game.started = true;
    game.newGame();
  }
};

animationTimeout = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ){ window.setTimeout(callback, 1000 / 60); };

(function animloop () {
  animationTimeout(animloop);
  loop();
})();











var controller = new Leap.Controller({ enableGestures: true }),

    space = { w: 1000, h: 500 },
    leapDeltaY = 150,
    scale = 300/1000,
    // grid = { x: space.w / gridWidth, y: space.h / gridWidth },

    // $space = document.getElementById('space'),
    $point = document.getElementById('point'),
    // $drawer = document.getElementById('drawer'),

    onCurrent = 0,
    onDifferent = 0,
    currentGrid = '',
    oldGrid = '';


controller.on('frame', function(frame) {
  
  if(!frame.fingers.length) return;
  
  // var hand1 = frame.hands[0];
  var finger = frame.fingers[0];

  var height = finger.stabilizedTipPosition[1];
  
  var xFar = ~~(height * 1/Math.tan(Math.abs(1 - finger.direction[0]) * Math.PI / 2 ));
  var yFar = ~~(height * 1/Math.tan(finger.direction[1])) * -1; // -1 because leap rad is negative

  var py = yFar * 1.5 - leapDeltaY;
  var px = space.w / 2 + xFar * 3;

  // snap to border
  // if(px < 0 && px > -space.w/2 ) px = 10;
  // if(px > space.w && px / space.w < 2) px = space.w -10;
  // if(py < 0 && py > -space.h/2 ) py = 10;
  // if(py > space.h && py / space.h < 2) py = space.h -10;

  $point.style.bottom = py * scale + 'mm';
  $point.style.left = px * scale + 'mm';

  pointer.x = $point.offsetLeft - 50 ; // border
  pointer.y = $point.offsetTop - 50;

  // Gesture detection
  var gesture = frame.gestures[0];
  if(gesture && gesture.type == 'swipe' && game.over) {
    game.start();
  }

});

controller.connect();
