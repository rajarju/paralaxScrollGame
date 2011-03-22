// Parrelax Scroll
// @author Arjun
// @file Library for multi layer parrelax scrolls

item_remove = function(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
};
//Globals
var level = null;
var missiles = [];

var enemies = {
  maxInPage: 1,
  total: 20,
  dead: 0,
  onscreen: 0,
  enemy: []
};

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


/**
 * Preloads
 */
var sprites = {
  status : 0,
  progress: 0,
  preloads: [  
  {
    type: 'img',
    src: 'images/background0.png'
  },
  {
    type: 'img',
    src: 'images/background1.png'
  },
  {
    type: 'img',
    src: 'images/background2.png'
  },
  {
    type: 'img',
    src: 'images/player.png'
  }
  ]
};

/**
* Preloader Function
*/
function preloadSprites(data){

  $(data).each(function(i,j){
    switch(j.type){
      case 'img':
        console.log(j.src + 'started');
        $.ajax({
          src : j.src,
          complete : function(data){
            console.log(j.src + 'done');
            sprites.progress++;
          }
        })
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


function setBackground(element, x, y){
  $(element).css('background-position', x+"px "+y+"px");
}


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

  this.type = type;
  this.speed = -2;
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
  this.id = "missile_"+missiles.length;

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
}


//on load
window.onload = function(){
  preloadSprites(sprites.preloads);
  load();

};

var load = function(){
  console.log(sprites.progress);
  if(sprites.progress == sprites.preloads.length)
    init();
  else
    setTimeout('load()',1000);
}


var init = function(){

 

  level = new game();
  level.init();

  player1 = new player();
  player1.init();

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
        player1.shootem()
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
        break;
    }
  }
  run();
}



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
            (enemies.enemy[i].pos.top + 20) > $('#player').offset().top - 40 &&
            (enemies.enemy[i].pos.top + 20) < $('#player').offset().top + 40
            )
          )
          {
          //console.log('Boom');
          player1.explode();
          enemies.enemy[i].explode();

          setTimeout(function(){
            level.gameOver = true;
            $('.explode').hide();
          }, 700);

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
          $("#"+missiles[i].id).remove();
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

              //Explode the Enemy
              enemies.enemy[i].explode();
              setTimeout(function(){
                $('.explode').hide();
              }, 700);
              //Remove Missile
              $("#"+missiles[i].id).remove();
              item_remove(missiles, i, 1);
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
        
  }
  else{
    //console.log('Game error')
    alert('Fcuk!! Ur still using IE?');
  }
}


//Random Number Generator
function rand(l,u) 
{
  return Math.floor((Math.random() * (u-l+1))+l);
}
