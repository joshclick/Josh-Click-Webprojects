function Flake(_x, _y, _size, _speed, _color) {
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
};

// Update function, used to update the snow flakes, and checks current snowflake against bounds
Flake.prototype.update = function(){
	this.y += this.speed;
	
	if(this.y > (winH))
		this.reset();
	
	this.step += this.stepSize;
	this.x += Math.cos(this.step);

	if(this.x > (winW + 20) || this.x < (0 - 20))  //allows for swaying outside of window, otherwise, reset
		this.reset();
	
};

// Resets the snowflake once it reaches one of the bounds set
Flake.prototype.reset = function() {
	this.y = 0;
	this.x = random(0, winW);
	this.stepSize = random(1,10) / 100;
	this.size = random((minSize * 100), (maxSize * 100)) / 100;
	this.speed = random(minSpeed, maxSpeed);
};

function CanvasState(canvas) {
  this.canvas = canvas;
  this.width = winW;
  this.height = winH;
  this.ctx = canvas.getContext('2d');
  thectx = canvas.getContext('2d');
  this.flakes = [];  // the collection of things to be drawn
  
  var myState = this;
  setInterval(function() { myState.draw(); }, 30);
}

CanvasState.prototype.addflake = function(flake) {
	this.flakes.push(flake);
};

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
};

window.onresize = function () {
	winW = window.innerWidth;
	winH = window.innerHeight;
	
	this.width = winW;
	this.height = winH;
	
	var canv = document.getElementById("siteCanvas");
	canv.width = winW;
	canv.height = winH;
};

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
};

$(document).ready(function() {
	random = function random(min, max){
		return Math.round(min + Math.random()*(max-min));
	};

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
});

