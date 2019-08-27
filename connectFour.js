//this code uses the libary p5.js to simplify drawing and other game-related tasks

class Board{
  constructor(){  
        //data that will represent colors or empty
        this.red = "r";
        this.black = "b";
        this.empty = "-";
        //controls the speed of the drop animation
        this.dropSpeed = 100;
        //data used for positioning and drawing the board
        this.x = 0;
        this.y = 0;
        this.positions = [];
        this.pieceDiameter = 60;
        this.margin = 10;
        this.columns = 7;
        this.rows = 6;
        this.slotSize = (this.margin*2)+this.pieceDiameter;
        this.width = this.slotSize*this.columns;
        this.height = this.slotSize*this.rows;
        //reset to initialize the board positions
        this.resetData();
    }
	
	resetData(){
		//set all the positions on the board to empty
		let totalPositions = this.columns*this.rows;
		for(let i = 0;i<totalPositions;i++){
			this.positions[i] = this.empty;
		}
	}
	
	draw(){
        background(200);
		//no outline
		stroke(0,0,0,0);
		//yellow fill
		fill(255,255,0);
		//draw the rectangle of the board
		rect(this.x,this.y,this.width,this.height);
		//draw the slots by setting the appropriate color
		for(let i = 0;i<this.positions.length;i++){
			switch(this.positions[i]){
				case this.red:			
					//red
					fill(255,0,0);
					break;
				case this.black:
					//black
					fill(0);
					break;
				default:	
					//empty
					fill(200)	
					break;
			}
			//draw a circle at the appropriate location to create the slot
			ellipse(this.x+(this.slotSize/2)+(this.slotSize*(i%this.columns)), this.y+(this.slotSize/2)+(this.slotSize*floor(i/this.columns)),this.pieceDiameter,this.pieceDiameter);
		}
	}
	
	movePieceDown(value,position, onComplete){
		//calculate the new position below the current one
		let newPosition = position+this.columns;
		//if the piece can fall more, move it down
		if(newPosition<this.positions.length && this.positions[newPosition]==this.empty){
			this.positions[position] = this.empty;
			this.positions[newPosition] = value;
			this.draw();
			setTimeout(()=>{this.movePieceDown(value, newPosition, onComplete);}, this.dropSpeed);
		}else{
			//there is no more space to move so call onComplete to resume the gameplay
			onComplete(position);
		}
	}
	//convert x,y coordinates on the board to the corresponding position in the array; starts at (1,1) ends at (6,7)
	getPosition(x,y){
		return (x-1)+((y-1)*this.columns);
	}
	//adds a piece and returns true if successful and false if not
	addPiece(x, value, onComplete){
		// print("adding a piece at "+x);
		if(x-this.x>=0 &&x<=this.x+this.width){
			//choose which column was selected
			let column = floor((x-this.x)/this.slotSize);
			if(this.positions[column]==this.empty){
				//place the piece
				this.positions[column]=value;
                
                background(200);
                this.draw();
				setTimeout(()=>{this.movePieceDown(value, column, onComplete);}, this.dropSpeed);
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}
}


let player1 = "Player 1";
let player2 = "Player 2";
let player1Turn = true;
let board;
let gamePaused = false;

//setup runs when we start the game (a feature of P5.js)
function setup() {
    //uncomment this line to make the board dynamically sized
	createCanvas(windowWidth, windowHeight);
	board = new Board();
	//center the board horizontally
	board.x = (windowWidth/2)-(board.width/2);
	board.y = windowHeight-board.width-20;
	resetGame();
}

function getPlayerNames(){
	player1 = prompt("What is the name of Player 1?","Player 1");
	player2 = prompt("What is the name of Player 2?", "Player 2");
    if(player1==null||player1==""){
        player1 = "Player 1";
    }
    if(player2==null||player2==""){
        player2 = "Player 2";
    }
}

function resetGame(){
	board.resetData();
	board.draw();
	getPlayerNames();
	//randomize who goes first; this value will be reversed when we initialize the turn
	player1Turn = floor(random(2))==0;
	gamePaused = false;
	initializeTurn()
}

//this runs when the mouse is clicked (a feature of P5.js)
function mousePressed(){
	if(!gamePaused){
        gamePaused = true;
        board.addPiece(mouseX, player1Turn?board.black:board.red, testGameOver);
	}
}

function initializeTurn(){
	//switch to the new player
	player1Turn = !player1Turn;
	let message = (player1Turn)?player1+"'s Turn":player2+"'s Turn";
	//write which player's turn it is
    if(player1Turn){
        fill(0);
    }else{
        fill(255,0,0);
    }
	textSize(35);
	text(message, board.x+(board.width/2)-120,125);
}

function gameOver(isATie = false){
	let message ="";
	if(isATie){
		message = "It's a tie!";
	}else{
		message = player1Turn?player1+ " Wins!":player2+" Wins!";
	}
    //setup font size and color
	fill(255, 226, 61).textSize(40);
	text(message, board.x+(board.width/2)-120,125);
    
    //reset could be implemented pretty easily using resetGame()
}

function testGameOver(changedPosition){
	// get an x,y position for the current game piece; this makes things easier for humans to understand
	let x = (changedPosition%board.columns)+1;
	let y = floor(changedPosition/(board.columns))+1;
	
	//horizontal wins check; check the changed row for wins
	let horizontalCheck = checkForWins(board.getPosition(1,y),board.getPosition(board.columns, y),1);
	if(horizontalCheck){
		gameOver();	
		return;
	}
	
	//vertical wins check; check the changed column for wins
	let verticalCheck = checkForWins(board.getPosition(x,1),board.getPosition(x, board.rows),board.columns);	
	if(verticalCheck){
		gameOver();	
		return;
	}
	
	//right diagonal wins
	//get the top right and bottom left of the diagonal that contains the current position.
	let tempX = x;
	let tempY = y;
	while(tempX>1 && tempY<board.rows){
		tempX--;	
		tempY++
	}	
	let topRight = board.getPosition(tempX, tempY);
	tempX = x;
	tempY = y;
	while(tempX<board.columns && tempY>1){
		tempX++;	
		tempY--;
	}	
	let bottomLeft = board.getPosition(tempX, tempY);
	let rightDiagonalCheck = checkForWins(bottomLeft,topRight,board.columns-1);	
	if(rightDiagonalCheck){
		gameOver();	
		return;
	}
	
	//left diagonal wins check	
	//get the top left and bottom right of the diagonal that contains the current position.
	tempX = x;
	tempY = y;
	//top left
	while(tempX>1 && tempY>1){
		tempX--;	
		tempY--;
	}	
	let topLeft = board.getPosition(tempX, tempY);
	//bottom right
	tempX = x;
	tempY = y;
	while(tempX<board.columns && tempY<board.rows){
		tempX++;	
		tempY++;
	}	
	let bottomRight = board.getPosition(tempX, tempY);
	let leftDiagonalCheck = checkForWins(topLeft,bottomRight,board.columns+1);	
	if(leftDiagonalCheck){
		gameOver();	
		return;
	}
	//no wins found so check for a tie
    if(board.positions.indexOf(board.empty)==-1){
        gameOver(true);
        return;
    }
    //no wins so resume the gameplay
	gamePaused = false;
	initializeTurn();	
}

function checkForWins(start, end, offset){
	// print("start: "+start+" end: "+end+"offset: "+offset);
	let numberOfMatchingToWin = 4;
	let blackWins = board.black.repeat(numberOfMatchingToWin);
	let redWins = board.red.repeat(numberOfMatchingToWin);
	//get a list of the locations to check
	let positionsToTest = [];
	for(let i = start;i<=end;i+=offset){
		positionsToTest.push(i);
	}
	// print("TESTING POINTS: ");
	// print(positionsToTest.join(","));
	let result = "";
	//go through the locations and check for wins until there are not enough locations to make a valid win
	for(let i = 0;i<positionsToTest.length-(numberOfMatchingToWin-1);i++){
		result = "";
		//check from each starting position up to the number needed for a win
		for(let slot = 0;slot<numberOfMatchingToWin;slot++){
			result += board.positions[positionsToTest[i+slot]];
		}
		// print("result: "+result); 
		//check if the result was a win
		if(result==blackWins||result==redWins){
			//if it was a win then end the testing and return a positive result
			return true;	
		}
	}
	//if we end up here there are either not enough locations or there are no wins
	return false;
}