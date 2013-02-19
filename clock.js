function Needle(holder, type, R1, R2, stroke_width, colour) {
	var color = colour || "#fff",
		width = stroke_width || 1,
		r = holder,
		pathParams = {stroke: color, "stroke-width": width};
		
	this.r1 = Math.min(R1, R2) || 35,
	this.r2 = Math.max(R1, R2) || 60,
	this.type = type;
	
	var n = this;

	//to determine type of needle (sec, min, hr, etc)
	var radLoc = n.getRadLoc();

	this.needlePath = r.path([
		["M", cx + n.r1 * Math.cos(radLoc), cy + n.r1 * Math.sin(radLoc)],
		["L", cx + n.r2 * Math.cos(radLoc), cy + n.r2 * Math.sin(radLoc)]
	]).attr(pathParams);
		
	//stall until start of second
	var currSec = new Date().getMilliseconds();
	while (currSec > 50)
		currSec = new Date().getMilliseconds();
		
	setInterval( function() { n.draw(); }, 1000);
	updateBGColor();
	setInterval( updateBGColor, 30000);
}

Needle.prototype.getRadLoc = function() {
	var time;
	var frac;
	switch(this.type) {
		case 's':
			time = new Date().getSeconds();
			frac = time/60;
			break;
		case 'm':
			time = new Date().getMinutes();
			frac = time/60;
			break;
		case 'h':
			time = new Date().getHours();
			frac = time/24;
			break;
	}
	var radLoc = (2*Math.PI * frac) - Math.PI/2 ;
	return radLoc;
}

Needle.prototype.draw = function() {
	//to determine type of needle (sec, min, hr, etc)
	var radLoc = this.getRadLoc();
		
	tickFX.play();
	this.needlePath.animate({path:[
		["M", cx + this.r1 * Math.cos(radLoc), cy + this.r1 * Math.sin(radLoc)],
		["L", cx + this.r2 * Math.cos(radLoc), cy + this.r2 * Math.sin(radLoc)]
	]}, 100, "elastic");
	
};

function updateBGColor() {
	var hr = new Date().getHours();
	var m = new Date().getMinutes();
	var time = hr*60 + m;
	
	//time at h:360
	var zTime = 17;
	
	//shift 18 hrs back so 1800 falls on 255 of h
	if (time > 0)
		time -= zTime * 60; //18 * 60
	else
		time = 1440 - time;
		
	//setup color
	var h = 360-time/1440*360; //h moves backwards
	var l = 60;
	var brightColor = hsl(h,60,l);

	circArr[0].attr({fill: rGrad(brightColor,70,"hsl(0,0,95)",100)});
	for (var c = 1; c < circArr.length; c++) {
		var darkColor =	hsl(h,60,l-6);
		brightColor =	hsl(h,60,l);
		var circFill = rGrad(brightColor,60-(c-1)*18,darkColor,100);
		circArr[c].attr({fill: circFill});
		l -= 10;
	}
}

function hsl(h,s,l) {
	return "hsl(" + h + "," + s + "," + l + ")";
}

function rGrad(c1,s1,c2,s2) {
	return "r" + c1 + ":" + s1 + "-" + c2 + ":" + s2;
}

$(document).ready(function() {
	var SIZE = 500;
	var hSIZE = 250;
	
	//set div size
	document.getElementById("holder").style.width = 600 + "px";
	document.getElementById("holder").style.height = (600+20) + "px";
	
	var bg = Raphael("holder", SIZE+100, SIZE+100);
	
	tickFX = document.getElementById("tick");
	tickFX.volume = 0.8;
	
	cx = hSIZE+50;
	cy = cx;
	
	var diff = 70;
	
	//draw bg circles
	var darkColor =		"hsl(0,0,15)";
	var brightColor =	"hsl(0,0,22)";
	circArr = [];
	circArr.push(bg.circle(300, 300, 300).attr({stroke: "none", fill: rGrad(brightColor,60,"hsl(0,0,96)",100)}));
	var rad = hSIZE;
	for (var c = 0; c < 4; c++) {
		//radial gradient changed slightly every iteration for best fade appearance
		var circFill = rGrad(brightColor,60-c*18,darkColor,100);
		
		circArr.push(bg.circle(cx, cy, rad).attr({stroke: "none", fill: circFill}));
		rad -= diff;
	}
	bg.circle(cx, cy, rad+diff).attr({stroke: "none", fill: "rgba(80,80,80,.4)"});

	//draw needles
	var needleFill = "rgba(250,250,250,0.6)";
	var secNeedle = new Needle(bg, 's', hSIZE-diff, hSIZE, 3, needleFill);
	var minNeedle = new Needle(bg, 'm', hSIZE-(diff*2), hSIZE-diff, 3, needleFill);
	var hrNeedle = new Needle(bg, 'h', hSIZE-(diff*3), hSIZE-(diff*2), 3, needleFill);

});