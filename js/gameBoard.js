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

    points_manager;

    piece_projection_cells;

    debug;

    static createBoard(canvas, next_piece_visualizer, points_manager) {
        const { rows, cells, cell_size, padding_left, padding_up } = Utils.initBoardValues(canvas.width, canvas.height, COLUMNS);

        return new GameBoard(canvas, rows, COLUMNS, cells, cell_size, next_piece_visualizer, padding_left, padding_up, points_manager);
    }

    setDebugManager(){
        this.debug = new DebugManager(this, COLUMNS, this.#rows, this.#canvas, this.#next_piece_visualizer, this.#cell_size, this.#cells)
    }

    loadPieces() {
        this.pieces = Piece.loadPieces(Math.floor(this.#columns / 2));
    }

    pickRandomPiece() {
        const index = Math.floor(Math.random() * this.pieces.length);
        return Piece.copy(this.pieces[index]);
    }

    canSpawnPiece() {
        return this.falling_piece.checkCollisions(this, { x: 0, y: 1 });
    }

    gameOver() {
        // Hacemos que el bucle de juego no se ejecute más 
        clearInterval(this.draw_timer);

        document.getElementById('game_over_rect').style.display = 'flex';

    }

    gameLoop() {
        // Se elige la siguiente pieza
        if (!this.next_piece) {
            this.pickNextPiece();
        }
        if (!this.falling_piece) {
            this.spawnFallingPiece();
        }
        if (this.can_fall_piece) {
            this.can_fall_piece = false;

            // Se mueve la pieza actual
            this.falling_piece.move(this, { x: 0, y: 1 });

            // Se calculan colisiones
            if (!this.falling_piece.checkCollisions(this, { x: 0, y: 1 })) {
                // La pieza ha llegado hasta abajo, se cambia a la siguiente pieza y se calculan lineas
                this.processMovementEnd();
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

    static drawGrid(ctx, columns, rows, cell_size, padding_left, padding_up) {
        ctx.fillStyle = RGBColor.buildRGB(GRID_COLOR);
        for (let i = 0; i <= columns; i++) {
            ctx.fillRect(i * cell_size + padding_left, padding_up, 2, rows * cell_size);
        }

        for (let i = 0; i <= rows; i++) {
            ctx.fillRect(padding_left, i * cell_size + padding_up, columns * cell_size, 2);
        }

        ctx.fillStyle = '#000';
    }

    spawnFallingPiece() {
        this.falling_piece = this.next_piece;
        if (!this.canSpawnPiece()) {
            return this.gameOver();
        }
        this.pickNextPiece();
        this.updatePieceProjection();
    }

    pickNextPiece() {
        this.next_piece = this.pickRandomPiece();
        this.#next_piece_visualizer.drawNextPiece(this.next_piece);
    }

    updatePieceProjection() {
        this.stopProjection();
        const final_position = this.calculateFinalPosition();
        if (final_position != { x: 0, y: 0 }) {
            this.piece_projection_cells = this.falling_piece.cellsForPosition(final_position);
            this.showProjection();
        }
    }

    showProjection() {
        for (const position of this.piece_projection_cells) {
            this.#cells[position.x][position.y].setProjection(this.falling_piece.color);
        }
    }

    stopProjection() {
        for (const position of this.piece_projection_cells) {
            this.#cells[position.x][position.y].removeProjection();
        }
    }

    sideArrowKeyPressed(key) {
        const direction = { x: key, y: 0 };
        if (this.falling_piece.moveLateralIfAble(this, direction)) {
            if (!this.falling_piece.checkCollisions(this, { x: 0, y: 1 })) {
                this.processMovementEnd();
            }
            else
                this.updatePieceProjection();
        }
    }

    upArrowKeyPressed() {
        if (this.falling_piece.rotateIfAble(this, 1))
            this.updatePieceProjection();

    }

    downArrowKeyPressed() {
        if (this.next_piece != null) {

            const final_position = this.calculateFinalPosition();
            this.falling_piece.move(this, final_position);

            this.processMovementEnd();
        }
    }

    calculateFinalPosition() {
        let i = 0;
        while (this.falling_piece.checkCollisions(this, { x: 0, y: i })) { i++; }
        if (i == 0)
            return { x: 0, y: 0 };
        else
            return { x: 0, y: i - 1 };
    }

    processMovementEnd() {
        this.falling_piece.movementEnd();
        const newLines = this.checkForLines();
        if (newLines > 0) {
            this.lines += newLines;
            this.points_manager.updateLinesCounter(this.lines);
        }
        this.spawnFallingPiece();
    }

    setTimers() {
        this.draw_timer = setInterval(() => this.gameLoop(), DELTA_TIME);
        this.can_fall_piece = setInterval(() => { this.can_fall_piece = true }, DELTA_TIME * INITIAL_PIECE_FALL_FACTOR);
    }

    checkForLines() {
        let lines = 0;
        let upper_line = null;
        const piece_lines = this.falling_piece.getLines();
        for (let j = 0; j < piece_lines.length; j++) {
            let is_line = true;
            let i = 0;
            while (i < this.#columns && is_line) {

                this.debugDraw({ type: 'CELL_INSPECTION', x: i, y: piece_lines[j] }, this.#cells[i][piece_lines[j]])

                if (!this.#cells[i][piece_lines[j]].isPiece()) {
                    is_line = false;
                    this.debugDraw({ type: 'NO_LINE_CELL', x: i, y: piece_lines[j] }, this.#cells[i][piece_lines[j]])
                }
                else
                    this.debugDraw({ type: 'DEFAULT_DRAW', x: i, y: piece_lines[j] }, this.#cells[i][piece_lines[j]]);

                i++;
            }
            if (is_line == true) {
                lines++;
                if (upper_line == null)
                    upper_line = piece_lines[j];
                for (let i = 0; i < this.#columns; i++) {
                    this.#cells[i][piece_lines[j]].block_num = 0;
                    this.#cells[i][piece_lines[j]].piece = null;
                }
            }
        }
        if (lines > 0) {
            this.processNewLines(lines, upper_line);
        }
        return lines;
    }

    debugDraw(operationObj, ...cells) {
        if (this.debug)
            this.debug.debugDraw(operationObj, ...cells);
    }

    processNewLines(lines, upper_line) {
        for (let j = upper_line - 1; j > 0; j--) {
            for (let i = 0; i < this.#columns; i++) {
                const piece = this.#cells[i][j].piece
                if (piece) {
                    this.leaveCell({ x: i, y: j });
                    this.occupyCell({ x: i, y: j + lines }, piece);
                }
            }
        }
        console.log("Lineas nuevas", lines);
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
        return coords.y < 0 || coords.y > this.#rows - 1 || coords.x < 0 || coords.x > this.#columns - 1;
    }

    constructor(canvas, rows, columns, cells, cell_size, next_piece_visualizer, padding_left, padding_up, points_manager) {
        this.#canvas = canvas;
        this.#rows = rows;
        this.#columns = columns;
        this.#cells = cells;
        this.#cell_size = cell_size;
        this.lines = 0;
        this.#next_piece_visualizer = next_piece_visualizer;
        this.padding_left = padding_left;
        this.padding_up = padding_up;
        this.points_manager = points_manager;
        this.piece_projection_cells = [];
        this.debug = null;
    }
}