/**
***	Author : Oussama Ben Khiroun
***	Contact : https://oussamabenkhiroun.com/
*** Version 1.0
**/

// create board
const numberOfBombs = 10;
const matrixSize = 9;
const boardSize="9x9";
const theme="url('images/minesweeper.png') "	// theme could be changed with another sprite (cells dimension=16px)

var b = jsboard.board({attach:"game", size:boardSize});
b.style({borderSpacing: "0px", border:"1px solid #CCC"});
b.cell("each").style({textIndent:"-9999px", background:theme+"-80px -16px no-repeat", width:"16px", height:"16px", margin:"0", padding:"0"});

// setup pieces
var zero = jsboard.piece({text:"ZR", textIndent:"-9999px", background:theme+"0 0 no-repeat", width:"16px", height:"16px", margin:"0 auto" });
var one = jsboard.piece({text:"ON", textIndent:"-9999px", background:theme+"-16px 0 no-repeat", width:"16px", height:"16px", margin:"0 auto" });
var two = jsboard.piece({text:"TW", textIndent:"-9999px", background:theme+"-32px 0 no-repeat", width:"16px", height:"16px", margin:"0 auto" });
var three = jsboard.piece({text:"TH", textIndent:"-9999px", background:theme+"-48px 0 no-repeat", width:"16px", height:"16px", margin:"0 auto" });
var four = jsboard.piece({text:"FO", textIndent:"-9999px", background:theme+"-64px 0 no-repeat", width:"16px", height:"16px", margin:"0 auto" });
var five = jsboard.piece({text:"FI", textIndent:"-9999px", background:theme+"-80px 0 no-repeat", width:"16px", height:"16px", margin:"0 auto" });
var six = jsboard.piece({text:"SX", textIndent:"-9999px", background:theme+"-96px 0 no-repeat", width:"16px", height:"16px", margin:"0 auto" });
var seven = jsboard.piece({text:"SV", textIndent:"-9999px", background:theme+"-112px 0 no-repeat", width:"16px", height:"16px", margin:"0 auto" });
var eight = jsboard.piece({text:"EI", textIndent:"-9999px", background:theme+"-128px 0 no-repeat", width:"16px", height:"16px", margin:"0 auto" });

var flag = jsboard.piece({text:"FL", textIndent:"-9999px", background:theme+"-64px -16px no-repeat", width:"16px", height:"16px", margin:"0 auto" });

// setup bombs
var bomb = jsboard.piece({text:"BM", textIndent:"-9999px", background:theme+"0 -16px no-repeat", width:"16px", height:"16px", margin:"0 auto" });
var bombRed = jsboard.piece({text:"BR", textIndent:"-9999px", background:theme+"-32px -16px no-repeat", width:"16px", height:"16px", margin:"0 auto" });

// array regrouping numbered pieces
var arrayNumbers = [zero, one, two, three, four, five, six, seven, eight];

var gameIsOver = false;

// handle bombs in 2d array
var bombMatrix;

// initializing game array with random placed bombs
initGame();

// game click handler (left mouse click)
b.cell("each").on("click", function() {
	if(!gameIsOver){
		if (b.cell(this).get()===null) {
			// getting current cell indices
			var loc = b.cell(this).where();
			var i = loc[0];
			var j = loc[1];
			
			if(bombMatrix[i][j]==1){
				// game over
				finishGame(i,j);
				// show "Game Over" in HTML
				document.getElementById("game-result").innerText = "Game Over";
				document.getElementById("game-result").className = "game-over";
			}else{
			
				var nearBombs = numberOfNearBombs(i,j); 
				
				if(nearBombs==0){
					// when zero bombs are placed near the current cell
					exploreRecursively(i,j);
				}else{
					b.cell(this).place(arrayNumbers[nearBombs].clone());
				}
				
				// test if all cells not containing bombs are explored
				if(isAllCellExplored()){
					finishGame(-1,-1);
					// show winning message
					document.getElementById("game-result").innerText = "You won!";
					document.getElementById("game-result").className = "game-win";				
				}
			}
		}
	}
});

// placing flags (right mouse click)
b.cell("each").on("contextmenu", function(ev) {
	// avoid showing context menu
    ev.preventDefault();
	// for updating remaining mines
	var x = eval(document.getElementById("remaining-mines").innerText);
	if (b.cell(this).get()===null) {
		b.cell(this).place(flag.clone());	// place a flag
		document.getElementById("remaining-mines").innerText = x - 1;
	}else if(b.cell(this).get()=="FL"){
		b.cell(this).rid();
		document.getElementById("remaining-mines").innerText = x + 1;
	}
    return false;
}, false);

function initGame(){
	var i, j;
	bombMatrix = [];
	for (i=0; i<matrixSize; i++){
		bombMatrix[i] = [];
		for (j=0; j<matrixSize; j++){
			bombMatrix[i][j] = 0;
		}
	}
	
	// place bombs randomly
	var placedBombs = 0;
	while(placedBombs<numberOfBombs){
		i = Math.floor(Math.random() * matrixSize);
		j = Math.floor(Math.random() * matrixSize);
		if(bombMatrix[i][j]==0){
			bombMatrix[i][j]=1;
			placedBombs++;
		}
	}
	// set number of remaining mines in HTML
	document.getElementById("remaining-mines").innerText = numberOfBombs;
}

function numberOfNearBombs(i,j){
	var nearBombs = 0;
	if(i>0){
		nearBombs = nearBombs + bombMatrix[i-1][j];
	}
	if(j>0){
		nearBombs = nearBombs + bombMatrix[i][j-1];
	}
	if(i<matrixSize-1){
		nearBombs = nearBombs + bombMatrix[i+1][j];
	}
	if(j<matrixSize-1){
		nearBombs = nearBombs + bombMatrix[i][j+1];
	}
	if((i-1>=0)&&(j-1>=0)){
		nearBombs = nearBombs + bombMatrix[i-1][j-1];
	}
	if((i+1<matrixSize)&&(j+1<matrixSize)){
		nearBombs = nearBombs + bombMatrix[i+1][j+1];
	}
	if((i-1>=0)&&(j+1<matrixSize)){
		nearBombs = nearBombs + bombMatrix[i-1][j+1];
	}	
	if((i+1<matrixSize)&&(j-1>=0)){
		nearBombs = nearBombs + bombMatrix[i+1][j-1];
	}
	return nearBombs; 
}

// this function is called when zero cell is clicked
function exploreRecursively(i,j){
	if((i>=0)&&(i<matrixSize)&&(j>=0)&&(j<matrixSize)&&(b.cell([i,j]).get()===null)){
		var nearBombs = numberOfNearBombs(i,j);
		b.cell([i,j]).place(arrayNumbers[nearBombs].clone());
		if((nearBombs==0)){		
			exploreRecursively(i+1,j) + exploreRecursively(i-1,j) + exploreRecursively(i,j+1) + exploreRecursively(i,j-1)
			+ exploreRecursively(i-1,j-1) + exploreRecursively(i-1,j+1) + exploreRecursively(i+1,j-1) + exploreRecursively(i+1,j+1);
		}			
	}
}

/* show all hidden cells:
	- when a bombs is clicked, (k,l) represent the cell indices (a red bomb is shown)
	- to resolve the grid, this function can be called by passing (-1,-1) arguments
*/
function finishGame(k,l){
	var aux; 
	for (var i=0; i<matrixSize; i++){
		for (var j=0; j<matrixSize; j++){
			if(bombMatrix[i][j]==1){
				if((i==k)&&(j==l)){
					b.cell([i,j]).place(bombRed.clone());
				}else{
					b.cell([i,j]).place(bomb.clone());
				}				
			}else{
				aux = numberOfNearBombs(i,j);
				b.cell([i,j]).place(arrayNumbers[aux].clone());
			}
		}	
	}
	gameIsOver = true;
}

// verify if all cells are exlored (win scenario)
function isAllCellExplored(){
	for (var i=0; i<matrixSize; i++){
		for (var j=0; j<matrixSize; j++){
			if((bombMatrix[i][j]==0)&&(b.cell([i,j]).get()===null)){
				return false;
			}
		}	
	}
	return true;
}