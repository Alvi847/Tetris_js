class GameBoard extends DrawableBoard {
    #columns;
    #rows;
    #canvas;
    #next_piece_visualizer;
    #cell_size;

    #cells;

    draw_timer;
    fall_timer;

    seed;

    next_piece;

    falling_piece;

    can_fall_piece;

    lines;
    current_level;
    points;
    points_in_current_level; // Valor para ahorrar cálculos
    game_text_gui_manager;

    piece_projection_cells;

    debug;

    fall_speed;


    static createBoard(canvas, next_piece_visualizer, game_text_gui_manager) {
        const { rows, cells, cell_size, padding_left, padding_up, starting_x } = DrawableBoard.initBoardValues(canvas.width, canvas.height, COLUMNS);

        return new GameBoard(canvas, rows, COLUMNS, cells, cell_size, next_piece_visualizer, padding_left, padding_up, game_text_gui_manager, starting_x);
    }

    setDebugManager() {
        this.debug = new DebugManager(this, COLUMNS, this.#rows, this.#canvas, this.#next_piece_visualizer, this.#cell_size, this.#cells, this.game_text_gui_manager)
        return this.debug;
    }

    loadPieces() {
        if (Piece.parsed_pieces.length == 0)
            Piece.loadHardCodedPieces(this.starting_x);
    }

    pickRandomPiece() {
        //const index = Math.floor(Math.random() * this.pieces.length);

        const total_weight = (() => {
            let weight_sum = 0;
            for (const piece_data of Piece.parsed_pieces) {
                weight_sum += Number(piece_data.weight);
            }
            return weight_sum;
        })();

        const rand = Math.floor(Math.random() * total_weight);

        let accumulator = 0

        for (const piece_data of Piece.parsed_pieces) {
            accumulator += Number(piece_data.weight);

            if (rand < accumulator) {
                return Piece.copy(piece_data);
            }
        }

        //console.log('pickRandomPiece falló');
        //return Piece.copy(Piece.parsed_pieces[index]);
    }

    canSpawnPiece() {
        return this.falling_piece.checkCollisions(this, { x: 0, y: 1 });
    }

    pauseGame() {
        this.paused = true;
        this.stopTimers();
    }

    startGame() {
        this.fall_speed = INITIAL_PIECE_FALL_FACTOR;
        this.current_level = 0;
        this.points = 0;
        this.points_in_current_level = 0;
        this.game_text_gui_manager.updateGUICounters(this.lines, this.points, this.current_level);
        if (this.debug)
            this.debug.updateDebugGUI(this.fall_speed, this.points_in_current_level);
        this.paused = false;
        this.setTimers();
    }

    gameOver() {
        // Hacemos que el bucle de juego no se ejecute más 
        this.paused = true;
        this.stopTimers();
        this.draw(this.#canvas, this.#columns, this.#rows, this.#cells, this.#cell_size);
        document.getElementById('game_over_rect').style.visibility = 'visible';
    }

    gameLoop() {
        if (!this.paused) {
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
            this.draw(this.#canvas, this.#columns, this.#rows, this.#cells, this.#cell_size);
        }
    }

    spawnFallingPiece() {
        this.falling_piece = this.next_piece;
        this.falling_piece.movePieceToSpawn(this.starting_x);
        if (!this.canSpawnPiece()) {
            return this.gameOver();
        }
        this.pickNextPiece();
        this.updatePieceProjection();
    }

    pickNextPiece() {
        this.next_piece = this.pickRandomPiece();
        this.#next_piece_visualizer.drawPiece(this.next_piece);
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
        if (!this.paused) {
            const direction = { x: key, y: 0 };
            if (this.falling_piece.moveLateralIfAble(this, direction)) {
                if (!this.falling_piece.checkCollisions(this, { x: 0, y: 1 })) {
                    this.processMovementEnd();
                }
                else
                    this.updatePieceProjection();
            }
        }
    }

    upArrowKeyPressed() {
        if (!this.paused) {
            if (this.falling_piece.rotateIfAble(this, 1))
                this.updatePieceProjection();
        }

    }

    downArrowKeyPressed() {
        if (!this.paused) {
            if (this.next_piece != null) {

                const final_position = this.calculateFinalPosition();
                this.falling_piece.move(this, final_position);

                this.processMovementEnd();
            }
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

    async processMovementEnd() {
        this.falling_piece.movementEnd();
        const newLines = await this.checkForLines();
        if (newLines > 0) { // Solo se ejecuta si se han hecho líneas

            // Puntos por línea en el nivel más los puntos de combo si se hacen más líneas a la vez
            const points_obtained = Level.pointsPerLine(this.current_level) * newLines + (newLines - 1) * Level.comboPoints(this.current_level);

            this.lines += newLines;
            this.points += points_obtained;
            this.points_in_current_level += points_obtained;

            const new_level_data = Level.changeLevel(this.current_level, this.fall_speed, this.points_in_current_level);
            if (this.current_level != new_level_data.level) {

                this.points_in_current_level = new_level_data.points_in_level;
                this.current_level = new_level_data.level;
                this.fall_speed = new_level_data.fall_speed;
                this.updateFallSpeed();

                if (this.debug)
                    this.debug.updateDebugGUI(this.fall_speed, this.points_in_current_level);
            }

            this.game_text_gui_manager.updateGUICounters(this.lines, this.points, this.current_level);
        }
        this.spawnFallingPiece();
    }

    setTimers() {
        this.draw_timer = setInterval(() => this.gameLoop(), DELTA_TIME);
        this.fall_timer = setInterval(() => { this.can_fall_piece = true }, DELTA_TIME * this.fall_speed);
    }

    stopTimers() {
        clearInterval(this.draw_timer);
        clearInterval(this.fall_timer);
    }

    updateFallSpeed() {
        clearInterval(this.fall_timer);
        this.fall_timer = setInterval(() => { this.can_fall_piece = true }, DELTA_TIME * this.fall_speed);
    }

    async checkForLines() {
        if (this.debug)
            this.draw(this.#canvas, this.#columns, this.#rows, this.#cells, this.#cell_size);
        let lines = 0;
        let upper_line = null;
        const piece_lines = this.falling_piece.getLines();
        for (let j = 0; j < piece_lines.length; j++) {
            let is_line = true;
            let i = 0;
            while (i < this.#columns && is_line) {

                await this.debugDraw({ type: 'CELL_INSPECTION', x: i, y: piece_lines[j] }, this.#cells[i][piece_lines[j]])

                if (!this.#cells[i][piece_lines[j]].isPiece()) {
                    is_line = false;
                    await this.debugDraw({ type: 'NO_LINE_CELL', x: i, y: piece_lines[j] }, this.#cells[i][piece_lines[j]])
                }
                else
                    await this.debugDraw({ type: 'DEFAULT_DRAW', x: i, y: piece_lines[j] }, this.#cells[i][piece_lines[j]]);

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

    async debugDraw(operationObj, ...cells) {
        if (this.debug) {
            this.stopTimers();
            await this.debug.debugDraw(operationObj, ...cells);
            this.setTimers();
        }
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

    constructor(canvas, rows, columns, cells, cell_size, next_piece_visualizer, padding_left, padding_up, game_text_gui_manager, starting_x) {
        super(padding_left, padding_up, starting_x, 0);
        this.#canvas = canvas;
        this.#rows = rows;
        this.#columns = columns;
        this.#cells = cells;
        this.#cell_size = cell_size;
        this.lines = 0;
        this.#next_piece_visualizer = next_piece_visualizer;
        this.game_text_gui_manager = game_text_gui_manager;
        this.piece_projection_cells = [];
        this.debug = null;
    }
}