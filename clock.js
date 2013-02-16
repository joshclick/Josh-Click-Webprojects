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


$(document).ready(function() {
	var SIZE = 500;
	var hSIZE = 250;
	
	//set div size
	document.getElementById("holder").style.width = SIZE + "px";
	document.getElementById("holder").style.height = (SIZE+20) + "px";
	
	var bg = Raphael("holder", SIZE, SIZE);
	
	tickFX = document.getElementById("tick");
	tickFX.volume = 0.8;
	
	cx = hSIZE;
	cy = cx;
	var diff = 70;
	
	//draw bg circles
	var rad = hSIZE;
	for (var c = 0; c < 4; c++) {
		//radial gradient changed slightly every iteration for best fade appearance
		var circFill = "r#333:" + (60-c*18) + "-#000:100";
		
		bg.circle(cx, cy, rad).attr({fill: circFill});
		rad -= diff;
	}
	bg.circle(cx, cy, rad+diff).attr({fill: "#000"});

	//draw needles
	var needleFill = "rgba(100,100,100,0.7)";
	var secNeedle = new Needle(bg, 's', hSIZE-diff, hSIZE, 3, needleFill);
	var minNeedle = new Needle(bg, 'm', hSIZE-(diff*2), hSIZE-diff, 3, needleFill);
	var hrNeedle = new Needle(bg, 'h', hSIZE-(diff*3), hSIZE-(diff*2), 3, needleFill);

});