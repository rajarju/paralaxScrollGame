// Parrelax Scroll
// @author Arjun
// @file Library for multi layer parrelax scrolls

//Globals
var level = null;

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

    };
    this.play = function(){
        //background1 stationed        
        $(this.background1);
        //background2 move 1px per cycle
        updateBackground($(this.background2), -1, 0);
        //background3 move 3px per cycle
        updateBackground($(this.background3), -2, 0);
    };
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
            console.log($(this.playground).height() - $(this.player).height());
            if(this.top < ($(this.playground).height() - $(this.player).height())){
                this.top += this.speedX ;
            //this.posPlayer();
            }
        }

        if(this.shoot)
            console.log('Shoot');

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
        
    }
}




//Missile Object
var missile = function(type){
    this.type = type;
}


//on load
window.onload = function(){
    //console.info('Lib Loaded');
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
                player1.shoot = true;
                e.preventDefault();
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
                player1.shoot = false;
                break;
        }

    }

    run();
};




var run = function(){
    if(level){
        level.play();
        player1.animate();
        requestAnimationFrame(function(){
            run();
        });
    }
    else{
        //console.log('Game error')
        alert('Error O-o');
    }
}
