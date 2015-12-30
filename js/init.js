$(document).ready(function() {
	var c4 = new Connect4();
	c4.drawNewBoard();

	var reset = $('#reset-board');
	var winnerFound = false;

	$('#current-player-text').text(c4.getCurrentPlayer());

	//drop a piece
	dropThePiece('.cell');

	//reset board
	reset.on('click', function() {
		var theModal = $('#reset-board-modal');
		c4.drawNewBoard(); //draw new board
		winnerFound = false;
		theModal.modal('hide'); //hide modal
		dropThePiece('.cell'); //bind event again
	});

	//dropping the piece logic
	function dropThePiece(cell) {
		var cell = $(cell);

		cell.on('click', function() {
			var cell = $(this);
			var column = cell.data('column');
			var rowcolumn = cell.data('rowcolumn');

			if (!winnerFound) { // keep doing this until winner is found
				// drop the piece
				winnerFound = c4.dropPiece(column);
			}
		});
	}
});

function Connect4(rows, columns) {
	var self = this;
	self.currentPlayer = 1;
	self.rows = rows || 8; // default 8
	self.columns = columns || 8; // default 8
	self.boardArray = [];
	this.winningCells = [];
}

// logic for dropping piece
Connect4.prototype.dropPiece = function(column) {
	//update the board array and draw updated board
	var win = false;
	var foundPosition = this.updateBoard(column);

	//check for winner
	if (foundPosition !== null){
		win = this.checkWinner(foundPosition);

		// check whether you can still drop a piece onto tha tcolumn
		if (!win && foundPosition.row !== 0) {
			this.swapPlayers();
		}

		return win;
	}

	return win;
};

//update the board
Connect4.prototype.updateBoard = function(column) {
	var currentPlayer = this.getCurrentPlayer();
	var piece = (currentPlayer == 1 ? 'x' : 'o');
	var boardArray = this.boardArray;
	var maxRows = this.rows - 1;

	//iterate through the column, find the last piece in the column and add one on top
	var foundPosition = null;
	
	for (var i = maxRows; i >= 0; i--) {
		var position = boardArray[i][column];
		
		if (!position) { // position free
			boardArray[i][column] = this.getCurrentPlayer();
			
			$('[data-rowcolumn="' + i + '-' + column + '"]').text(piece);
			foundPosition = {
				row: i,
				col: column
			};

			return foundPosition;
		}
	}

	return foundPosition;
};

// draw board based on rows and columns (default is 8x8)
Connect4.prototype.drawNewBoard = function() {
	var output = '';
	var rows = this.rows;
	var columns = this.columns;
	var board = $('#board');
	var boardArray = []; // array representation of board

	this.setCurrentPlayer(1); //reset to first player
	this.updateCurrentPlayerText();
	this.winningCells = [];

	output = '<table class="table table-bordered">';
	// draw rows
	for (var i = 0; i < rows; i++) {
		output += '<tr data-row="' + i + '">';
		boardArray[i] = [];

		//draw columns
		for (var j = 0; j < columns; j++) {
			output += '<td class="cell" data-column="' + j + '" data-rowcolumn="' + i + '-' + j + '">&nbsp;</td>'
			boardArray[i][j] = null;
		}

		output += '</tr>';
	}

	output += '</table>'
    board.html(output); //draw html
   	this.boardArray = boardArray;
}

// get current player
Connect4.prototype.getCurrentPlayer = function() {
	return this.currentPlayer;
};

// get current player
Connect4.prototype.setCurrentPlayer = function(currentPlayer) {
	return this.currentPlayer = currentPlayer;
};

// swap players
Connect4.prototype.swapPlayers = function() {
	(this.currentPlayer === 1 ? this.currentPlayer = 2 : this.currentPlayer = 1);
	this.updateCurrentPlayerText();
};

//Update the text with the current player
Connect4.prototype.updateCurrentPlayerText = function() {
	var currentPlayer = this.getCurrentPlayer();
	$('#current-player-text').html(currentPlayer);
}

// check for winner
Connect4.prototype.checkWinner = function(position){
	var boardArray = this.boardArray;

	// check vertical
	var verticalWon = true;
	for (var i = 1; i < 4; i++) {
		if (position.row + i >= this.rows){
			verticalWon = false;
			break;
		}

		var value = boardArray[position.row + i][position.col];

		if (value != this.getCurrentPlayer()) {
			verticalWon = false;
			break;
		}
	}

	// check horizontal
	var horizontalRow = []; //create array to with the values of horizontal
	var row = boardArray[position.row];
	var colMin = Math.max(0, position.col - 3)
	var colMax = Math.min(this.columns - 1, position.col + 3)

	for (var i = colMin; i <= colMax; i++) {
		var value = row[i];
		//horizontalRow.push(value);
		horizontalRow.push({
			'val': value,
			'row': position.row,
			'col': i
		});
	}
	//var horizontalWon = this.checkConsecutive2(horizontalRow, 4); // check for winner
	var horizontalWon = false;

	// check SE diagonal
	var diagonalSERow = []; //create another array with the values of the diagonal
	var startingSEPosition = position;

	while (true) {
		if (startingSEPosition.col == 0 || startingSEPosition.row == 0) {
			//at top left (0,0)
			break;
		} else {
			//create an array of SE diagonal which contains the row and col of the diagonal (direction left)
			startingSEPosition = {
				row : startingSEPosition.row - 1,
				col : startingSEPosition.col - 1
			}
		}
	}

	//Build the SE diagonal array
	while (true) {
		var value = boardArray[startingSEPosition.row][startingSEPosition.col];
		diagonalSERow.push({
			val : value,
			row : startingSEPosition.row,
			col : startingSEPosition.col
		}); //add the value of that position on the board into another array

		//create an array of SE diagonal which contains the row and col of the diagonal (direction right)
		startingSEPosition = {
			row : startingSEPosition.row + 1,
			col : startingSEPosition.col + 1
		};

		if (startingSEPosition.row >= this.rows || startingSEPosition.col >= this.columns) {
			//stop at (max rows, max columns)
			break;
		}
	}
	//var southEasterlyWon = this.checkConsecutive2(diagonalSERow, 4); //check for winner
	var southEasterlyWon = false;
	
	// check NE diagonal
	var diagonalNERow = []; //create another array with the values of the diagonal
	var startingNEPosition = position;
	while (true) {
		if (startingNEPosition.col == (this.columns - 1) || startingNEPosition.row == 0) {
			//at top right (0, (this.cols - 1))
			break;
		} else {
			//create an array of NE diagonal which contains the row and col of the diagonal (direction left)
			startingNEPosition = {
				row : startingNEPosition.row - 1,
				col : startingNEPosition.col + 1
			}
		}
	}

	//Build the NE diagonal array
	while (true) {
		var value = boardArray[startingNEPosition.row][startingNEPosition.col];
		diagonalNERow.push({
			val : value,
			row : startingNEPosition.row,
			col : startingNEPosition.col
		}); //add the value of that position on the board into another array

		//create an array of NE diagonal which contains the row and col of the diagonal (direction right)
		startingNEPosition = {
			row : startingNEPosition.row + 1,
			col : startingNEPosition.col - 1
		};

		if (startingNEPosition.row == this.rows || startingNEPosition.row < 0 || startingNEPosition.col == this.columns || startingNEPosition.col < 0 ) {
			//stop at (max rows, column 0)
			break;
		} 
	}

	var northEasterlyWon = this.checkConsecutive2(diagonalNERow, 4); //check for winner

	if (verticalWon || horizontalWon || southEasterlyWon || northEasterlyWon) {
		//winner found
		this.displayWinner();
		return true;
	}

};

// check for sequence of 4 in a row
Connect4.prototype.checkConsecutive2 = function(theArray, length) {
	var sequence = 0;
	var arr = theArray;
	var winningCells = []; //get an array of the cells to highlight
	//check length in a row to find winner
	for (var i = 0; i < arr.length; i++) {
		var val = arr[i].val;
		var row = arr[i].row;
		var col = arr[i].col;

		if (val == this.getCurrentPlayer()) {
			sequence += 1;
			winningCells.push({ row: row, col: col });
		} else {
			sequence = 0;
			winningCells = [];
		}

		if (sequence == length) {
			//winner found
			this.winningCells = winningCells;
			return true;
		}
	}

	//no winner just return false
	return false;
};

// check for sequence of 4 in a row
Connect4.prototype.checkConsecutive = function(theArray, length) {
	var sequence = 0;
	var arr = theArray;

	//check length in a row to find winner
	for (var i = 0; i <= arr.length; i++) {
		var value = arr[i];
		(value == this.getCurrentPlayer() ? sequence += 1 : sequence = 0);
		
		if (sequence == length) { //winner found
			return true;
		}
	}

	//no winner just return false
	return false;
};

//show winner
Connect4.prototype.displayWinner = function() {
	var cells = this.winningCells;
	console.log(this.winningCells);
	for (var i = 0; i < cells.length; i++) {
		var row = cells[i].row;
		var col = cells[i].col;
		var cell = $('.cell[data-rowcolumn="' + row + '-' + col + '"]');
		cell.addClass('success');
	}

	alert('Player ' + this.getCurrentPlayer() + ' Wins!');
};

