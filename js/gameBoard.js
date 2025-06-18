class GameBoard {
    #columns;
    #rows;
    #canvas;
    #next_piece_visualizer;
    #cell_size;

    #cells;

    padding_left;
    padding_up;

    draw_timer;

    seed;

    next_piece;

    falling_piece;

    pieces;

    can_fall_piece;

    lines;
    
    static createBoard(canvas, next_piece_visualizer) {
        const {rows, cells, cell_size, padding_left, padding_up} = Utils.initBoardValues(canvas.width, canvas.height, COLUMNS);

        return new GameBoard(canvas, rows, COLUMNS, cells, cell_size, next_piece_visualizer, padding_left, padding_up);
    }

    loadPieces() {
        this.pieces = Piece.loadPieces(Math.floor(this.#columns / 2));
        this.falling_piece = this.pickRandomPiece();
    }

    pickRandomPiece() {
        const index = Math.floor(Math.random() * this.pieces.length);
        //return Piece.copy(this.pieces[index]);
        return new Piece(this.pieces[index].name, this.pieces[index].color, this.pieces[index].shape, this.pieces[index].center, this.pieces[index].rotatable);
    }

    canSpawnPiece(){
        return this.falling_piece.checkCollisions(this, { x: 0, y: 1 });
    }

    gameOver(){
        // Hacemos que el bucle de juego no se ejecute más 
        clearInterval(this.draw_timer);

        document.getElementById('game_over_rect').style.display = 'flex'; 

    }

    gameLoop() {
        // Se elige la siguiente pieza
        if (!this.next_piece) {
            this.next_piece = this.pickRandomPiece();
            this.#next_piece_visualizer.drawNextPiece(this.next_piece);
        }
        if (this.can_fall_piece) {
            this.can_fall_piece = false;

            // Se mueve la pieza actual
            this.falling_piece.move(this, { x: 0, y: 1 });

            // Se calculan colisiones
            if (!this.falling_piece.checkCollisions(this, { x: 0, y: 1 })) {
                // La pieza ha llegado hasta abajo, se cambia a la siguiente pieza y se calculan lineas
                this.falling_piece = this.next_piece;
                this.next_piece = null;
                this.checkForLines();
                if(!this.canSpawnPiece()){
                    this.gameOver();
                }
            }
        }
        // Se dibuja el tablero
        GameBoard.draw(this.#canvas, this.#columns, this.#rows, this.#cells, this.#cell_size, this.padding_left, this.padding_up);
    }

    static draw(canvas, columns, rows, cells, cell_size, padding_left, padding_up) {
        if (canvas.getContext) {
            const ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height) // Se borra todo el tablero

            GameBoard.drawGrid(ctx, columns, rows, cell_size, padding_left, padding_up);

            for (let i = 0; i < columns; i++) {
                for (let j = 0; j < rows; j++) {
                    cells[i][j].draw(ctx, i * cell_size + padding_left, j * cell_size + padding_up, cell_size);
                }
            }
        }
    }

    static drawGrid(ctx, columns, rows, cell_size, padding_left, padding_up){
        ctx.fillStyle = RGBColor.buildRGB(GRID_COLOR);
        for(let i = 0; i <= columns; i++){
            ctx.fillRect(i * cell_size + padding_left, padding_up, 2, rows * cell_size);
        }

        for(let i = 0; i <= rows; i++){
            ctx.fillRect(padding_left, i * cell_size + padding_up, columns * cell_size, 2);
        }

        ctx.fillStyle = '#000';
    }

    sideArrowKeyPressed(key) {
        const direction = { x: key, y: 0 };
        if (this.falling_piece.moveLateralIfAble(this, direction)) {
            if (!this.falling_piece.checkCollisions(this, { x: 0, y: 1 })) {
                this.falling_piece = this.next_piece;
                this.next_piece = null;
            }
        }
    }

    downArrowKeyPressed() {
        while (this.falling_piece.checkCollisions(this, { x: 0, y: 1 })) {
            this.falling_piece.move(this, { x: 0, y: 1 });
        }

        this.falling_piece = this.next_piece;
        this.next_piece = null;
        this.checkForLines();
    }

    setTimers() {
        this.draw_timer = setInterval(() => this.gameLoop(), DELTA_TIME);
        this.can_fall_piece = setInterval(() => { this.can_fall_piece = true }, DELTA_TIME * 2);
    }

    checkForLines() {
        let lines = 0;
        for (let j = 0; j < this.#rows; j++) {
            let isLine = true;
            for (let i = 0; i < this.#columns; i++) {
                if (!this.#cells[i][j].isPiece())
                    isLine = false;
            }
            if (isLine == true) {
                lines++;
                for (let i = 0; i < this.#columns; i++) {
                    this.#cells[i][j].block_num = 0;
                    this.#cells[i][j].piece = null;
                }
            }
        }
        if (lines > 0) {
            for (let j = this.#rows - 1 - lines; j > 0; j--) {
                for (let i = 0; i < this.#columns; i++) {
                    const piece = this.#cells[i][j].piece
                    if (piece) {
                        this.leaveCell({ x: i, y: j });
                        this.occupyCell({ x: i, y: j + 1 }, piece);
                    }
                }
            }
            this.lines += lines
            console.log("Líneas: ", this.lines);
        }
        return lines;
    }

    leaveCell(coords) {
        this.#cells[coords.x][coords.y].block_num--;
        if (this.#cells[coords.x][coords.y].block_num <= 0) {
            this.#cells[coords.x][coords.y].piece = null;
            this.#cells[coords.x][coords.y].block_num = 0;
        }
    }

    occupyCell(coords, piece) {
        this.#cells[coords.x][coords.y].piece = piece;
        this.#cells[coords.x][coords.y].block_num++;
    }

    isMovementEnd(coords, piece) {
        return this.isOut(coords) || this.#cells[coords.x][coords.y].isOtherPiece(piece);
    }

    isOut(coords) {
        return coords.y > this.#rows - 1 || coords.x < 0 || coords.x > this.#columns - 1;
    }

    constructor(canvas, rows, columns, cells, cell_size, next_piece_visualizer, padding_left, padding_up) {
        this.#canvas = canvas;
        this.#rows = rows;
        this.#columns = columns;
        this.#cells = cells;
        this.#cell_size = cell_size;
        this.lines = 0;
        this.#next_piece_visualizer = next_piece_visualizer;
        this.padding_left = padding_left;
        this.padding_up = padding_up;
    }

    /*get columns(){
        return this.#columns;
    }
    get rows(){
        return this.#rows;
    }
    get canvas(){
        return this.#canvas;
    }
    get cells(){
        return this.#cells;
    }*/
}