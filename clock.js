function Needle(holder, type, R1, R2, stroke_width, colour) {
     var color = colour || "#fff",
        width = stroke_width || 1,
        r1 = Math.min(R1, R2) || 35,
        r2 = Math.max(R1, R2) || 60,
        r = holder,
        pathParams = {stroke: color, "stroke-width": width};
            
    //to determine type of needle (sec, min, hr, etc)
    var time;
    var frac;
    switch(type) {
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

    var needlePath = r.path([
		["M", cx + r1 * Math.cos(radLoc), cy + r1 * Math.sin(radLoc)],
		["L", cx + r2 * Math.cos(radLoc), cy + r2 * Math.sin(radLoc)]
    ]).attr(pathParams);
        
    //stall until start of second
    var currSec = new Date().getMilliseconds();
    while (currSec > 50)
    	currSec = new Date().getMilliseconds();
    	
    var n = this;
    setInterval( function() { n.draw(type, needlePath, r1, r2); }, 1000);
    setInterval( updateBGColor(), 60000);

}

Needle.prototype.draw = function(type, needlePath, r1, r2) {
    //to determine type of needle (sec, min, hr, etc)
    var time;
    var frac;
    switch(type) {
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
        
    tickFX.play();
    needlePath = needlePath.animate({path:[
		["M", cx + r1 * Math.cos(radLoc), cy + r1 * Math.sin(radLoc)],
		["L", cx + r2 * Math.cos(radLoc), cy + r2 * Math.sin(radLoc)]
	]}, 100, "elastic");
	
};

function updateBGColor() {
	var h = new Date().getHours();
	var m = new Date().getMinutes();
	//var s = new Date().getSeconds();
	//var ms = new Date().getMilliseconds();
	var time = h*60 + m;
	var h = time/1440*255;
	var b = 60;
	var brightColor =	"hsl(" + h + ",60," + b + ")";


	circArr[0].attr({fill: "r" + brightColor + ":" + (70) + "-hsl(0,0,96):100"});
	for (var c = 1; c < circArr.length; c++) {
		var darkColor =		"hsl(" + h + ",60,"+ (b-6) + ")";
		brightColor =	"hsl(" + h + ",60," + b + ")";
		var circFill = "r" + brightColor + ":" + (60-(c-1)*18) + "-" + darkColor + ":100";
		circArr[c].attr({fill: circFill});
		b -= 10;
	}
}

$(document).ready(function() {
	var SIZE = 500;
	var hSIZE = 250;
	
	//set div size
	document.getElementById("holder").style.width = SIZE + "px";
	document.getElementById("holder").style.height = (SIZE+20) + "px";
	
	var bg = Raphael("holder", SIZE+100, SIZE+100);
	
	tickFX = document.getElementById("tick");
	tickFX.volume = 0.8;
	
	cx = hSIZE+50;
	cy = cx;
	var diff = 70;
	
	//baseColor = "#333";
	var darkColor = 	"hsl(0,0,15)";
	var brightColor = 	"hsl(0,0,22)";
	
	//draw bg circles
	circArr = []
	
	circArr.push(bg.circle(300, 300, 300).attr({stroke: "none", fill: "r" + brightColor + ":" + (60) + "-hsl(0,0,96):100"}));
	var rad = hSIZE;
	for (var c = 0; c < 4; c++) {
		//radial gradient changed slightly every iteration for best fade appearance
		var circFill = "r" + brightColor + ":" + (60-c*18) + "-" + darkColor + ":100";
		
		circArr.push(bg.circle(cx, cy, rad).attr({stroke: "none", fill: circFill}));
		rad -= diff;
	}
	bg.circle(cx, cy, rad+diff).attr({stroke: "none", fill: "#000"});

	//draw needles
	var needleFill = "rgba(220,220,220,0.5)";
	var secNeedle = new Needle(bg, 's', hSIZE-diff, hSIZE, 3, needleFill);
	var minNeedle = new Needle(bg, 'm', hSIZE-(diff*2), hSIZE-diff, 3, needleFill);
	var hrNeedle = new Needle(bg, 'h', hSIZE-(diff*3), hSIZE-(diff*2), 3, needleFill);

});