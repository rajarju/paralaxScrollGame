// Parrelax Scroll
// @author Arjun
// @file Library for multi layer parrelax scrolls

/**********************************HELPER FUNCTIONS***********************************/
//Helper to remove item from arrays
item_remove = function(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
};
//Random Number Generator
function rand(l,u){
  return Math.floor((Math.random() * (u-l+1))+l);
}
//Request animation Frame
window.requestAnimationFrame = (function(){
  //Check for each browser
  //@paul_irish function
  //Globalises this function to work on any browser as each browser has a different namespace for this
  return  window.requestAnimationFrame       ||  //Chromium
  window.webkitRequestAnimationFrame ||  //Webkit
  window.mozRequestAnimationFrame    || //Mozilla Geko
  window.oRequestAnimationFrame      || //Opera Presto
  window.msRequestAnimationFrame     || //IE Trident?
  function(callback, element){ //Fallback function
    window.setTimeout(callback, 1000/60);
  }

})();


/****************************************Globals*****************************/
var level = null;
var player1 = null;
var missiles = [];
var loadingTimer = null;
var enemies = {
  maxInPage: 1,
  total: 20,
  dead: 0,
  onscreen: 0,
  enemy: []
};

function resetPlayers(){
  level = null;
  player1 = null;
  missiles = [];

  enemies = {
    maxInPage: 1,
    total: 20,
    dead: 0,
    onscreen: 0,
    enemy: []
  };
}


/***************************************** MEDIA TO BE PRELOADED ******************/
//TODO: Add Sounds
var sprites = {
  status : 0,
  progress: 0,
  preloads: [    
  {
    type: 'img',
    src: 'images/background0.png',
    message: 'Sky'
  },
  {
    type: 'img',
    src: 'images/background1.png',
    message: 'Forest'
  },
  {
    type: 'img',
    src: 'images/background2.png',
    message: 'Trees'
  },
  {
    type: 'img',
    src: 'images/player.png',
    message: 'Player Ship'
  },
  {
    type: 'img',
    src: 'images/enemy.png',
    message: 'Enemy Ships'
  },
  {
    type: 'img',
    src: 'images/explode.gif',
    message: 'Animations'
  },
  {
    type: 'img',
    src: 'images/bullet1.png',
    message: 'Weapons'
  },
  ]
};
/**
 * Preloader Function
 */
function preloadSprites(data){

  $(data).each(function(i,j){
    switch(j.type){
      case 'img':
        var img = $('<img />').attr('src', j.src).load(function(){
          //console.log($(this));
          //console.log(sprites.progress++);
          $('#loading #debug').prepend("Loaded "+j.message +"...<br/>");
          sprites.progress++;
        });
        $('#buffer').append(img);
        break;
    }
  });
  
}
/**
 * Increment background pos by amount for the given element.
 */
function updateBackground(element, xInc, yInc){
  var bckPosRaw = $(element).css('background-position');
  bckPosRaw = bckPosRaw.split(" ");
  xPos = parseInt(bckPosRaw[0]);
  yPos = parseInt(bckPosRaw[1]);

  //Update positions
  xPos += xInc;
  yPos += yInc;
  $(element).css('background-position', xPos+"px "+yPos+"px");
}

//Get Background Positions of an element
function getBackground(element){
  var bckPosRaw = $(element).css('background-position');
  bckPosRaw = bckPosRaw.split(" ");
  xPos = parseInt(bckPosRaw[0]);
  yPos = parseInt(bckPosRaw[1]);
  return {
    x: xPos,
    y: yPos
  };
}
//Set Background pos of an element
function setBackground(element, x, y){
  $(element).css('background-position', x+"px "+y+"px");
}
/********************************* CLASSES ****************************/
//The Game Object
var game = function(){
  this.gameOver = false;
  this.status = true;
  this.init = function(){
    //The this inside here is useless
    //Add all the parrelax layers
    this.playground = document.getElementById('playground');
    this.playground.innerHTML = '';
		
    this.background1 = document.createElement('div');
    this.background1.id = 'background-0';
    this.playground.appendChild(this.background1);
		
    this.background2 = document.createElement('div');
    this.background2.id = 'background-1';
    this.playground.appendChild(this.background2);
		
    this.background3 = document.createElement('div');
    this.background3.id = 'background-2';
    this.playground.appendChild(this.background3);

    this.background1 = document.getElementById('background-0');
    this.background2 = document.getElementById('background-1');
    this.background3 = document.getElementById('background-2');

    //Flight Distance
    this.distance = 0;

  };
  this.play = function(){
    //background1 stationed
    $(this.background1);
    //background2 move 1px per cycle
    updateBackground($(this.background2), -1, 0);
    //background3 move 3px per cycle
    updateBackground($(this.background3), -3, 0);
  };
  this.playPause = function(){
    this.status = !this.status;
  }
};

//Player Object
var player = function(){
  this.score = 0;
  this.speedX = 2;
  this.speedY = 3;
  this.move = null;
  this.shoot = false;

  this.init = function(){
    //this.image = new Image();
    //image.src = "images/player.png";
    this.playground = document.getElementById('playground');
    this.player = document.createElement('div');
    this.player.id = 'player';
    this.playground.appendChild(this.player);

    this.player = $('player');
    this.resetPos();
  //console.log(this);
  };
  this.animate = function(){
    if(this.move == 'up'){
      if(this.top > 0){
        this.top -= this.speedX;
      //this.posPlayer();
      }
    }
    if(this.move == 'down'){
           
      if(this.top < ($(this.playground).height() - $("#player").height())){
        this.top += this.speedX ;
      //this.posPlayer();
      }
    }

    //if(this.shoot)
    //console.log('Shoot');

    this.posPlayer();

  };
  this.resetPos = function(){
    this.left = 10;
    this.top = $(this.playground).height()/2 - 100;
    this.posPlayer();
  };
  this.posPlayer = function(){

    var offset = $("#playground").offset();

    $("#player").css({
      top: (this.top + offset.top) + "px",
      left: (this.left + offset.left) + "px"
    });
        
  };
  this.shootem = function(){
    //if(missiles.length < 10)
    missiles.push(new missile('bullet'));
  //console.log(missiles);
  }

  this.explode = function(){
    $("#player").addClass('explode');
    this.top -= 10;
    this.left -= 10;
    this.posPlayer();
    
  }
}

//We ll deal with only one type
//Dont have time
var enemy = function(type){

  this.points = 25;
  this.type = type;
  this.speed = rand(-5, -2);
  this.live = false;
  this.id = 'enemy_'+this.type+ '_' + level.distance;
    
  this.playground = document.getElementById('playground');
  this.enemy = document.createElement('div');
  this.enemy.id = this.id;
  this.enemy.className = 'enemy_'+this.type;
  this.playground.appendChild(this.enemy);
  //Initial POS
  this.pos = {
    top: rand($('#playground').offset().top, $('#playground').offset().top + $('#playground').height() - 40),
    left: $('#playground').offset().left + $('#playground').width() - 30
  };

  this.explode = function(){
    this.pos.top -= 10;
    this.pos.left -= 10;
    $('#'+this.id).addClass('explode');
    this.draw();    
  }

  this.draw = function(){
    //Check if its already there on screen

    //var offset = $("#playground").offset();

    $("#"+this.id).css({
      top: (this.pos.top) + "px",
      left: (this.pos.left) + "px"
    });
    this.live = true;
  //console.log(this);

  }
  this.draw();
  this.live = true;
  enemies.onscreen++;

}


//Missile Object
var missile = function(type){
  this.type = type;
  //this.id = "missile_"+missiles.length;
  this.id = "missile_"+ new Date().getTime(); 
  this.playground = document.getElementById('playground');
  this.missile = document.createElement('div');
  this.missile.id = this.id;
  this.missile.className = 'missile_'+this.type;
  this.playground.appendChild(this.missile);
  this.missile = document.getElementById(this.id);
  switch(type){
    case 'bullet':{
      this.speed = 5;
      this.damage = 5;
      break;
    }
    case 'cosmic' :{
      this.speed = 3;
      this.damage = 20;
      break;
    }
  }
  this.pos = {
    top: $('#player').offset().top + 13,
    left: $('#player').offset().left + 20
  };

  this.draw = function(){
    //Check if its already there on screen
    $("#"+this.id).css({
      top: (this.pos.top) + "px",
      left: (this.pos.left) + "px"
    }).show();

  }
  this.explode = function(){
    $(this.missile).remove();
  }
}



/**
 * end game
 */
var endGame = function(){
    
  $('#playground').fadeOut().hide();
  $('#welcome #status').html('Game Over!!!');
  $('#welcome').show();
    
}


/*****************************************MAIN FUNCTION CYCLE***********************************/

//on load Event bind
window.onload = function(){
  $('#start').click(function(){
    resetPlayers();
    $('#welcome').hide();
    $('#playground').show();
    preloadSprites(sprites.preloads);
    load();
  })

  
};
//Sprites load loop
//Waits for all the sprites to be loaded before starting the game..
//TODO: Make sure it this works
var load = function(){  
  loadingBar.progress = parseInt((sprites.progress/sprites.preloads.length)*100);
  console.log(loadingBar.progress);
  loadingBar.show();
  if(sprites.progress == sprites.preloads.length){    
    //Remove Loading Bar
    clearTimeout(loadingTimer);
    loadingBar.hide();
    //Show the HUD
    $('#hud').show();
    //Build Level
    init();
  }
  else{
    loadingTimer =  setTimeout('load()',500);
  }
}

//Initialize Game Levels and Players
var init = function(){

  //Create Level
  level = new game();
  level.init();

  //Create Player
  player1 = new player();
  player1.init();

  //Binding User behaviors
  //window.onkeydown = function(e){
  window.onkeydown = function(e){
    switch(e.keyCode){
      case 38:
        player1.move = 'up';
        e.preventDefault();
        break;
      case 40:
        player1.move = 'down';
        e.preventDefault();
        break;
      case 32:
        //player1.shoot = true;
        e.preventDefault();
        player1.shootem();
        break;
    }

  }
  window.onkeyup = function(e){
    e.preventDefault();
    switch(e.keyCode){
      case 38:
        player1.move = null;
        break;
      case 40:
        player1.move = null;
        break;
      case 32:
        //player1.shoot = false;
        //e.preventDefault();
        //player1.shootem();
        break;
    }
  }
  run();
}

//Main Game Loop
var run = function(){
  if(level){

    level.play();

    //Move the player
    player1.animate();

    //Move the Enemies
    for(i in enemies.enemy){
      if(enemies.enemy[i] != undefined){
        //console.log(enemies.enemy[i]);
        if((enemies.enemy[i].pos.left < ($(level.playground).offset().left + 30)) && enemies.enemy[i].live){
          //missiles[i].destroy();
          $("#"+enemies.enemy[i].id).remove();
          //delete enemies.enemy[i];
          item_remove(enemies.enemy, i, 1)
          enemies.onscreen--;
          this.live = false;

        }
        else if(
          (enemies.enemy[i].pos.left < ($('#player').offset().left + $('#player').width())) &&
          (
            //(enemies.enemy[i].pos.top + 20) > $('#player').offset().top - 36 &&
            //(enemies.enemy[i].pos.top + 20) < $('#player').offset().top + 40
            Math.abs(
              (enemies.enemy[i].pos.top + ($('.enemy_ship').height())/2) -
              ($('#player').offset().top + ($('#player').height())/2)
              )
            < 36
            )
          )
          {
          //console.log('Boom');
          //level.gameOver = true;
          //return;
          player1.explode();
          enemies.enemy[i].explode();
          enemies.onscreen--;
          setTimeout(function(){
            level.gameOver = true;
            $('.explode').hide();            
            endGame();
          }, 500);

        }
        else{
          //console.log(missiles[i].pos.left);
          //console.log(missiles[i].speed);
          enemies.enemy[i].pos.left += enemies.enemy[i].speed;
          enemies.enemy[i].draw();

        }
      }
    }
    //Move the Missiles
    for(i in missiles){
      if(missiles[i] != undefined){
        if(missiles[i].pos.left > ($(level.playground).offset().left + $(level.playground).width()-30)){
          console.log($("#"+missiles[i].id).hide().remove());          
          item_remove(missiles, i, 1);
        }
        else{
          //console.log(missiles[i].pos.left);
          //console.log(missiles[i].speed);
          missiles[i].pos.left += missiles[i].speed;
          missiles[i].draw();

          //check for collision with enemy and blow em up!
          //distance calculation..
          if(enemies.enemy.length){
            for(j in enemies.enemy)
              dist = parseInt(Math.sqrt(
                Math.pow((enemies.enemy[j].pos.left - missiles[i].pos.left), 2) +
                Math.pow((enemies.enemy[j].pos.top - missiles[i].pos.top), 2)
                ));
            if(dist < 30){
              player1.score += enemies.enemy[j].points;
              //Explode the Enemy
              enemies.enemy[j].explode();
              setTimeout(function(){
                $('.explode').hide();
                enemies.onscreen--;
              }, 500);
              //Remove Missile
              $("#"+missiles[i].id).remove();
              item_remove(missiles, i, 1);
              item_remove(enemies.enemy, j, 1);
              
            }
          }
        }
      }
    }

    //Generate new enemies if the total on screen is < 3
    //and there are still more left to be killed
    if(level.distance > 300)
      if(enemies.onscreen < enemies.maxInPage && enemies.dead < enemies.total){
        enemies.enemy.push(new enemy('ship'));
      //console.log(enemies.enemy);
      }

    //Execute the Loop
    if(!level.gameOver && level.status)
      requestAnimationFrame(function(){
        run();
      });

    level.distance++;
    $('#dist span').text(level.distance);
    $('#score span').text(player1.score);
  }
  else{
    console.log('Game error');
  }
}



/**
 * Loading Bar Function
 * increments to add for each call
 * minimum to start with
 * max to end with
 */
var loadingBar = {
  progress: 0,
  show: function(){    
    $('#bar #progress').animate({
      'width' : loadingBar.progress + '%'
    },200);
  },
  hide: function(){
  //$('#playground').html('');
  }
}