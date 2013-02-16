function LetterRow(_string)
{
	while (_string.length < MAXCOLS)
		_string += ' ';

	this.string = _string.toUpperCase();
	this.currLetterArr = [];

	while (this.currLetterArr.length < MAXCOLS)
		this.currLetterArr.push(32); //space in ASCII

}

LetterRow.prototype.draw = function(ctx, row) {

	var yCoord = YMIN + ROWPADDING*row;

	for (var l = 0; l < MAXCOLS; l++) {
		var xCoord = XMIN + (COLPADDING*l);
		var currChar = this.currLetterArr[l];

		var letter = String.fromCharCode(currChar);
		
		if (colorMode)
			ctx.fillStyle = 'hsl(' + (currChar-32)*6 + ',' + 90 + '%,' + 60 + '%)'
		else if (crazyMode)
			ctx.fillStyle = 'hsl(' + Math.floor(Math.random()*360) + ',' + ( Math.floor(Math.random()*35) + 65) + '%,' + 60 + '%)'
		else { //color numbers
			if (currChar >= 48 && currChar <= 57)
				ctx.fillStyle = "#E2964A";
			else
				ctx.fillStyle = "#fff";
		}

/*
		if (clockMode && currChar === 48)
			ctx.fillRect( xCoord, yCoord , COLWIDTH, -40);
		else
*/
			ctx.fillText(letter, xCoord+ 3, yCoord +6);


		//if not right letter, keep changing
		if ( letter !== this.string[l] ) 
		{
			this.currLetterArr[l]++;
			numChanging++;
		}

		//skip unwated letters
		while (BADLETTERS.indexOf(this.currLetterArr[l]) !== -1)
			this.currLetterArr[l]++;
			
		//reset to beginning
		if (this.currLetterArr[l] > 90) 
			this.currLetterArr[l] = 32;

	}
};

function drawFX(canvas)
{
	this.fxctx = canvas.getContext('2d');
	
	for (var fxrow = 0; fxrow < MAXROWS; fxrow++) {
	
		var yCoord = YMIN + ROWPADDING*fxrow;
	
		//batching calls by color for speed
		fxctx.globalAlpha=0.4;
		for (var l = 0; l < MAXCOLS; l++) {
			var xCoord = XMIN + (COLPADDING*l);
	
			//bar through center
			fxctx.fillStyle = '#333';
			fxctx.fillRect( xCoord,yCoord-21,COLWIDTH, 2);
		}
		
		for (var l = 0; l < MAXCOLS; l++) {
			var xCoord = XMIN + (COLPADDING*l);
			
			fxctx.fillStyle = '#555';
			fxctx.fillRect( xCoord,yCoord-20,COLWIDTH, 1);
		}
	
		fxctx.globalAlpha=0.2;
		for (var l = 0; l < MAXCOLS; l++) {
			var xCoord = XMIN + (COLPADDING*l);
			
			//extra shading on bottom half
			fxctx.fillStyle = '#111';
			fxctx.fillRect( xCoord,yCoord-19,COLWIDTH, 19);
		}
	}
}

//create bg panels
function drawBG(canvas) 
{
	this.bgctx = canvas.getContext('2d');
	
	bgctx.globalAlpha=1;

	for (var bgrow = 0; bgrow < MAXROWS; bgrow++) {
		var yCoord = YMIN + ROWPADDING*bgrow;

		for (var l = 0; l < MAXCOLS; l++) {
			var xCoord = XMIN + (COLPADDING*l);

			//rect bg
			bgctx.fillStyle = "#999";
			bgctx.fillRect( xCoord, yCoord+1, 31, -41);
			bgctx.fillStyle = "#222";
			bgctx.fillRect( xCoord-1, yCoord, 31, -41);

			//gradient rect
			var bgGrd = bgctx.createLinearGradient( xCoord, 67 + ROWPADDING*bgrow, 96 + (COLPADDING*l), 67 + ROWPADDING*(bgrow+1) );
			bgGrd.addColorStop(0,'#282D28');
			bgGrd.addColorStop(0.5,'#070D07');
			bgctx.fillStyle = bgGrd;
			bgctx.fillRect( xCoord, yCoord , COLWIDTH, -40);
		}
	}
}

function CanvasState(canvas, lState)
{	
	this.states = ['sched','input','clock','crazy','wave'];
	this.activeState = 0;
	
	this.lState = lState;
	var currState = this;

//fixes a problem where double clicking causes text to get selected on the canvas
	canvas.addEventListener('selectstart', function(e) { 
		e.preventDefault(); return false; 
	}, false);
	
	//refresh panels with click
	canvas.addEventListener('mousedown', function(e) {
		currState.changeState(1);

	});
	
	$(document).on( 'keydown', function(e) { 
		if (e.which === 8 || //backspace
			e.which === 32 || //spacebar
			e.which === 38 || //up arrow
			e.which === 40) //down arrow
		{
			e.preventDefault(); 	//disable default actions for certain keys
		}
		
		//changes state w/ arrows
		if (e.which === 37)
			currState.changeState(-1);		
		if (e.which === 39)
			currState.changeState(1);
			
		if (e.which === 40)
			lState.mute = !lState.mute;
			
		if (e.which === 38)
			colorMode = !colorMode;
			
		//for alpha characters (fixes capital letter input)
		if (currState.activeState == 1)
		{
			if ( e.which === 32 || (e.which >= 65 && e.which <=90) ) 
				lState.addToQueue(e.which);
	
			if (e.which === 8) 
			{
				lState.queue = lState.queue.slice(0,-1);
				lState.updateInputLetters();
			}
		}	

		
	}).on( 'keypress', function(e) { //handles keypresses when it's inputState
		if (currState.activeState == 1) 
		{
			if( (e.which >= 48 && e.which <= 58) || 
				e.which === 46 || 
				e.which === 45 || 
				e.which === 33 ||
				e.which === 64 ||
				e.which === 39 //apostrophe
			) {
				lState.addToQueue(e.which);
			}
		}
	})
	
	
	currState.crazyTimer;
	currState.clockTimer;
	currState.waveTimer;
	
	this.waveIter = 0;
}

CanvasState.prototype.changeState = function(dir) {
	//sets state
	var activeS = this.activeState;
	if (dir === 1) {
		if (activeS === this.states.length-1)
			this.activeState = 0;
		else
			this.activeState ++;
	} else if (dir === -1) {
		if (activeS === 0)
			this.activeState = this.states.length-1;
		else
			this.activeState --;
	}
	
	clockMode = false;
	crazyMode = false;
	clearInterval(this.crazyTimer);
	clearInterval(this.clockTimer);
	clearInterval(this.waveTimer);
	switch(this.activeState) {
		case 0:
			this.setClassState(todayList());
			break;
		case 1:
			this.setInputState();
			break;
		case 2:
			this.setClockState();
			break;
		case 3:
			this.setCrazyState();
			break;
		case 4:
			this.setWaveState();
			break;
		default:
			this.setClassState(todayList());
			console.log('activstateerror');
			break;
	}
};

CanvasState.prototype.setWaveState = function() {

	for (var i = 0; i < MAXROWS; i++)
		this.lState.setLetterRow('',i);
		
	var s = this;
		
	this.waveTimer = setInterval( function() {
		var currX = s.waveIter;
		var currY = 0;
		
		while (currX >= 0) {
			s.lState.resetIndiv(currX,currY);
			currX --;
			currY ++;
		}
		
		s.waveIter++;
		if (s.waveIter > MAXCOLS+MAXROWS)
			s.waveIter = 0;	
	
	}, 100);

};


CanvasState.prototype.setClockState = function() {
	clockMode = true;
	this.lState.setLetterRow('',0);
	this.lState.setLetterRow('',6);

	var s = this;
	this.clockTimer = setInterval( function() { s.refreshTime(); } ,300);
	
};

CanvasState.prototype.refreshTime = function() {
		
		var timeRows = [
			' HHHH hhhh   MMMM mmmm ......',
			' HHHH hhhh o MMMM mmmm ......',
			' HHHH hhhh   MMMM mmmm ......',
			' HHHH hhhh o MMMM mmmm ......',
			' HHHH hhhh   MMMM mmmm ......'
		];
		
		var hrs = new Date().getHours();
		var min = new Date().getMinutes();
		var sec = new Date().getSeconds() + 1;	
		
		var hrs1 = hrs%10;
		var hrs10 = Math.floor(hrs/10);
				
		var min1 = min%10;
		var min10 = Math.floor(min/10);
		
		//format string for seconds
		var secDisp = [
			'      ',
			'      ',
			'      ',
			'      ',
			'      '
		];
		var secString = "";
		while (secString.length < Math.floor(sec/2) )
			secString += '.';
		var numSecRows = Math.floor ( secString.length / 6 );
		for (var ss = 0; ss <= numSecRows; ss++) {
			secDisp[ss] = secString.substring( 6*ss, 6*(ss+1),ss+1 );
		}
		
		for (var r = 0; r < 5; r++) {
			timeRows[r] = timeRows[r].replace("HHHH", DIGITROWS[hrs10][r]);
			timeRows[r] = timeRows[r].replace("hhhh", DIGITROWS[hrs1][r]);
			timeRows[r] = timeRows[r].replace("MMMM", DIGITROWS[min10][r]);
			timeRows[r] = timeRows[r].replace("mmmm", DIGITROWS[min1][r]);
			timeRows[r] = timeRows[r].replace("......", secDisp[r]);
			
			this.lState.setLetterRow(timeRows[r], r+1);
		}
		
};

CanvasState.prototype.setCrazyState = function() {
	crazyMode = true;
	var l = this.lState;

	l.setLetterRow("--------seizure--Mode--------",0);

	this.crazyTimer = setInterval( function () {
	
	    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
	    var randRow = Math.floor(Math.random() * (MAXROWS -1)) +1;
		var randString = "";
		while (randString.length < MAXCOLS)
			randString += possible.charAt(Math.floor(Math.random() * possible.length));
		l.setLetterRow(randString,randRow);
		
	}, 500);
};

CanvasState.prototype.setInputState = function() {
	this.lState.setLetterRow("-Input Mode- start typing:",0);
	this.lState.updateInputLetters();
};

CanvasState.prototype.setClassState = function(classes) {
	var day = new Date().getDay();
	var weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	var todays = weekday[day];

	this.lState.setLetterRow(todays + "'s class schedule:",0);

	for (var sesh = 0; sesh < classes.length; sesh++) {
		//pads the strings
		var building = classes[sesh][0];
		while (building.length < 6)
			building += ' ';
			
		var room = classes[sesh][1];
		while (room.length < 6)
			room += ' ';
			
		var name = classes[sesh][2];
		while (name.length < 12)
			name += ' ';
			
		var time = classes[sesh][3];
		while (time.length < 5)
			time = ' ' + time;

		this.lState.setLetterRow(building+room+name+time, (sesh + 1) );
	}

	for (var row = classes.length+1; row < MAXROWS; row++)
		this.lState.setLetterRow("",row);

}

function LetterState(canvas) 
{
	this.ctx = canvas.getContext('2d');
	this.ctx.textBaseline = 'bottom';

	this.letterRows = [];  
	for (var r = 0; r < MAXROWS; r++)
		this.letterRows.push(new LetterRow(""));

	this.queue = '';
	
	this.mute = false;
		
	var l = this;
	
	l.mainTimer = setInterval(function() { l.draw(); }, 85);

}

LetterState.prototype.updateInputLetters = function () {
	var currQueue = this.queue;
	var rows = Math.floor( currQueue.length / MAXCOLS );
	for (var i = 0; i <= rows; i++) {
		this.setLetterRow( currQueue.substring(MAXCOLS*i, MAXCOLS*(i+1)), i+1 );
	}
	rows += 2;
	for (rows; rows < MAXROWS; rows++)
		this.setLetterRow("",rows);
};

//adds letter to queue and updates inputLetters
LetterState.prototype.addToQueue = function(charCode) {
	var letter = (String.fromCharCode(charCode));
				
	if (this.queue === undefined) 
		this.queue = letter;
	else 
		this.queue += letter;

	this.updateInputLetters();
};

LetterState.prototype.draw = function() {
	var ctx = this.ctx;
	this.clear();
		
	ctx.font = 'bold 38px cbfont';

	for (var i = 0; i < MAXROWS; i++) 
		this.letterRows[i].draw(ctx, i);

	if (numChanging > 0)
		playSound();
		
	//lower volume if fewer # of panels changing
	if (numChanging > 100) {
		setVolume(1.0);
	} else if (numChanging > 80) {
		setVolume(0.8);
	} else if (numChanging > 60) {
		setVolume(0.6);
	} else if (numChanging > 40) {
		setVolume(0.5);
	} else if (numChanging > 20) {
		setVolume(0.4);
	} else {
		setVolume(0.3);
	}
	numChanging = 0;
	
	if (this.mute)
		setVolume(0);
};

LetterState.prototype.reset = function() {
	var letterRows = this.letterRows;
			
	for (var i = 0; i < MAXROWS; i++) {
		for (var j = 0; j < MAXCOLS; j++) {
			if (letterRows[i].currLetterArr[j] !== 32)
				letterRows[i].currLetterArr[j]++;
		}
	}
};

LetterState.prototype.resetIndiv = function(x,y) {
	if (this.letterRows[x] !== undefined && this.letterRows[x].currLetterArr[y] !== undefined)
		this.letterRows[x].currLetterArr[y]++;
}


LetterState.prototype.setLetterRow = function(letterRow,row) {
	letterRow = letterRow.toUpperCase();
	while (letterRow.length < MAXCOLS)
		letterRow += ' ';
	this.letterRows[row].string = letterRow;

};

LetterState.prototype.clear = function() {
	this.ctx.clearRect(0, 0, 1000, 500);
};


$(document).ready(function() {
	DIGITROWS = [[
		'0000',
		'0  0',
		'0  0',
		'0  0',
		'0000'
	], [
		'   0',
		'   0',
		'   0',
		'   0',
		'   0'
	], [
		'0000',
		'   0',
		'0000',
		'0   ',
		'0000'
	], [
		'0000',
		'   0',
		'0000',
		'   0',
		'0000'
	], [
		'0  0',
		'0  0',
		'0000',
		'   0',
		'   0'
	], [
		'0000',
		'0   ',
		'0000',
		'   0',
		'0000'
	], [
		'0   ',
		'0   ',
		'0000',
		'0  0',
		'0000'
	], [
		'0000',
		'   0',
		'   0',
		'   0',
		'   0'
	], [
		'0000',
		'0  0',
		'0000',
		'0  0',
		'0000'
	], [
		'0000',
		'0  0',
		'0000',
		'   0',
		'   0'
	]];

	BADLETTERS = [34,35,36,37,40,41,42,43,44,47,59,60,61,62,63]; //list of char to skip over
	ROWHEIGHT = 40;
	COLWIDTH = 30;
	ROWPADDING = 20 + ROWHEIGHT;
	COLPADDING = 4 + COLWIDTH;
	YMIN = 0 + ROWHEIGHT;
	XMIN = 10;
	MAXROWS = Math.floor(420/ROWPADDING);
	MAXCOLS = Math.floor(1000/COLPADDING);

	cbfx = document.getElementById("cbfx");
	cbfx2 = document.getElementById("cbfx2");
	cbfx3 = document.getElementById("cbfx3");

	numChanging=0;
	soundBin = 0;

	//creates bg for letters
	var canv2 = document.getElementById("classBoardCanvasBG");
	drawBG(canv2);

	//set up canvas for letters
	var canv = document.getElementById("classBoardCanvas");
	var l = new LetterState(canv);
	
	//handles input and state changes
	var canvfx = document.getElementById("classBoardCanvasFX");
	drawFX(canvfx);
	var s = new CanvasState(canvfx,l);
	clockMode = false;
	crazyMode = false;
	colorMode = false;

	s.setClassState(todayList());
});

function playSound()
{
	switch(soundBin) {
		case 0:
	    	cbfx.play();
	    	soundBin++;
	    	break;		
	    case 1:
	    	cbfx2.play();
	    	soundBin++;
	    	break;
	    case 2:
	    	cbfx3.play();
	    	soundBin=0;
	    	break;	   
	}

}

function setVolume(vol) {
	cbfx.volume = vol;
	cbfx2.volume = vol;
	cbfx3.volume = vol;
}

function todayList() 
{
	var allClasses = [
		['tisc','lc25','prin.of.fa','09:30','13'],
		['ciww','109','data.strct','11:00','13'],
		['bobs','ll143','intrm.chin','14:00','1234'],
		['ciww','109','d.s.rec','15:30','1'],
		//['tisc','lc21','r&f.models','11:00','24'],
		['tisc','201','entr.n.age','18:20','3']
	];
	var day = new Date().getDay();

	//adds todays class to list
	var todayClasses = [];
	for (var item = 0; item < allClasses.length; item++) 
	{
		if ( allClasses[item][4].indexOf(""+day) !== -1 )
			todayClasses.push(allClasses[item]);
	}

	//sorts classes by time
	var sorted = false;
	while (!sorted) 
	{
		sorted = true;
		for (var c = 0; c < todayClasses.length - 1; c++) 
		{
			if ( todayClasses[c][3].substring(0,2)*1 > todayClasses[c+1][3].substring(0,2)*1 ) {
				sorted = false;
				var temp = todayClasses[c];
				todayClasses[c] = todayClasses[c+1];
				todayClasses[c+1] = temp;
			}
		}
	}

	return todayClasses;
}