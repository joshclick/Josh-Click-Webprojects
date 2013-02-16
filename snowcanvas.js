function Flake(_x, _y, _size, _speed, _color)
{
	// Flake properties
	this.x	= _x;
	this.y	= _y;
	this.size = _size;
	this.fill = _color; //hex color
	this.speed = _speed;
	this.step = 0;
	this.stepSize = random(1,10) / 100; //side to side movement
}


// Draws this flake to a given context
Flake.prototype.draw = function(ctx) {
  ctx.fillStyle = this.fill;

  ctx.beginPath();
  ctx.arc(this.x,this.y,this.size,0,2*Math.PI);
  ctx.fill();
  ctx.closePath();

//  ctx.fillRect(this.x, this.y, this.size, this.size);
}

// Update function, used to update the snow flakes, and checks current snowflake against bounds
Flake.prototype.update = function(){
	this.y += this.speed;
	
	if(this.y > (winH)){
		this.reset();
	}

	
	this.step += this.stepSize;
	this.x += Math.cos(this.step);

	if(this.x > (winW + 20) || this.x < (0 - 20) ) { //allows for swaying outside of window, otherwise, reset
		this.reset();
	}
	
	if (collection) {
		// Pileup check
		if(this.x > targX && this.x < targW + targX && this.y > targY && this.y < targH + targY){
			var ctx = thectx,
				curX = this.x;
				curY = this.y;
	
			if(colData[parseInt(curX)][parseInt(curY+this.speed+this.size)] !== undefined || curY+this.speed+this.size > targH){
				if(curY+this.speed+this.size > targH){
					while(curY+this.speed+this.size > targH && this.speed > 0){
						this.speed *= .5;
					}
	
					//ctx.fillStyle = "#222";
					
					if(colData[parseInt(curX)][parseInt(curY+this.speed+this.size)] == undefined){
						colData[parseInt(curX)][parseInt(curY+this.speed+this.size)] = 1;
	/* 					ctx.fillRect(curX, (curY)+this.speed+this.size, this.size, this.size); */
	  					s.addCollect(new Flake( curX, (curY)+this.speed+this.size, this.size, this.size, 0 , this.fill ));
	
					}else{
						colData[parseInt(curX)][parseInt(curY+this.speed)] = 1;
	/* 					ctx.fillRect(curX, curY+this.speed, this.size, this.size); */
						 s.addCollect(new Flake( curX, (curY)+this.speed, this.size, this.size, 0 , this.fill ));
	
					}
					this.reset();
				}else{
					// flow to the sides
					this.speed = 1;
					this.stepSize = 0;
				
					if(parseInt(curX)+1 < targW && colData[parseInt(curX)+1][parseInt(curY)+1] == undefined ){
						// go left
						this.x++;
					}else if(parseInt(curX)-1 > 0 && colData[parseInt(curX)-1][parseInt(curY)+1] == undefined ){
						// go right
						this.x--;
					}else{
						//stop
						//ctx.fillStyle = "#222";
	/* 					ctx.fillRect(curX, curY, this.size, this.size); */
						 s.addCollect(new Flake( curX, (curY), this.size, this.size, 0 , this.fill ));
	
						colData[parseInt(curX)][parseInt(curY)] = 1;
						this.reset();
					}
				}
			}
		}
	}
	
}

// Resets the snowflake once it reaches one of the bounds set
Flake.prototype.reset = function(){
	this.y = 0;
	this.x = random(0, winW);
	this.stepSize = random(1,10) / 100;
	this.size = random((minSize * 100), (maxSize * 100)) / 100;
	this.speed = random(minSpeed, maxSpeed);
}

function CanvasState(canvas) {
  this.canvas = canvas;
  this.width = winW;
  this.height = winH;
  this.ctx = canvas.getContext('2d');
  thectx = canvas.getContext('2d');
  this.flakes = [];  // the collection of things to be drawn
  this.collect = []; //flakes that have collected
  
  var myState = this;
  setInterval(function() { myState.draw(); }, 30);
  setInterval(function() { myState.updateBounds(); }, 1000);

}

CanvasState.prototype.addCollect = function(collect) {
	this.collect.push(collect);
}

CanvasState.prototype.addflake = function(flake) {
	this.flakes.push(flake);
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

CanvasState.prototype.updateBounds = function() {

	if (winW !== window.innerWidth || winH !== window.innerHeight) {
		winW = window.innerWidth;
		winH = window.innerHeight;
		
		this.width = winW;
		this.height = winH;
		
		var canv = document.getElementById("siteCanvas");
		canv.width = winW;
		canv.height = winH;
	}
}

CanvasState.prototype.draw = function() {
    var ctx = this.ctx;
    var flakes = this.flakes;
    this.clear();
        
    // draw all flakes
    var l = flakes.length;
    for (var i = 0; i < l; i++) {
    	flakes[i].update();			
        flakes[i].draw(ctx);
    } 
    
    if (collection) {
    	var collects = this.collect;
	    for (var j = 0; j < collects.length; j++) {
		    collects[j].draw(ctx);
	    }
	}

}

init();

function init() {
	random = function random(min, max){
		return Math.round(min + Math.random()*(max-min)); 
	};
	
	collection = false;
	
	if (collection) {
		targX = 0;
		targW = screen.width;
		targY = window.innerHeight-5;
		targH = 10;
		colData = [];
	
		for(var w = 0; w < screen.width; w++){
			colData[w] = [];
		}
	}

	flakeCount = 400,
	minSize = 1,
	maxSize = 3,
	minSpeed = 1,
	maxSpeed = 5;
	
	winW = window.innerWidth;
	winH = window.innerHeight;
		
	var canv = document.getElementById("siteCanvas");
	canv.width = winW;
	canv.height = winH;

/*    var s = new CanvasState(document.getElementById('siteCanvas')); */
    s = new CanvasState(document.getElementById('siteCanvas'));


	// initialize the flakes
	for(i = 0; i < flakeCount; i+=1){
		s.addflake(new Flake( 
			random(0, s.width), 
			random(0, s.height), 
			random( (minSize * 100),(maxSize * 100) ) / 100 , 
			random(minSpeed, maxSpeed) , 
			("#" + random(2,9)*111) 
		));
		}
}

