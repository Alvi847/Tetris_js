class NextPieceVisualizer {

    #canvas
    #rows;
    #columns;
    #cell_size;
    #cells;

    static createNextPieceVisualizer(canvas) {
        const cell_size = Math.floor(canvas.width / MAX_PIECE_WIDTH);
        const rows = Math.floor(canvas.height / cell_size);

        const cells = [];
        for (let i = 0; i < MAX_PIECE_WIDTH; i++) {
            cells[i] = [];
            for (let j = 0; j < rows; j++) {
                cells[i][j] = new Cell();
            }
        }

        return new NextPieceVisualizer(canvas, rows, MAX_PIECE_WIDTH, cells, cell_size);
    }

    drawNextPiece(piece) {

        this.clear();

        const pieceCopy = new Piece(piece.name, piece.color, piece.shape, piece.center, piece.rotatable);

        pieceCopy.spawnInNextPieceVisualizer({ x: Math.floor(this.#columns / 2), y: Math.floor(this.#rows / 2) }, this.#cells);

        GameBoard.draw(this.#canvas, this.#columns, this.#rows, this.#cells, this.#cell_size);
    }

    clear() {
        for (let i = 0; i < this.#columns; i++) {
            for (let j = 0; j < this.#rows; j++) {
                this.#cells[i][j].piece = null;
            }
        }
    }

    constructor(canvas, rows, columns, cells, cell_size) {
        this.#canvas = canvas;
        this.#cell_size = cell_size;
        this.#cells = cells;
        this.#columns = columns;
        this.#rows = rows;
    }
}