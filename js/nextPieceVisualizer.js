class NextPieceVisualizer {

    #canvas
    #rows;
    #columns;
    #cell_size;
    #cells;

    padding_left;
    padding_up;

    static createNextPieceVisualizer(canvas) {
        const {rows, cells, cell_size, padding_left, padding_up} = Utils.initBoardValues(canvas.width, canvas.height, MAX_PIECE_WIDTH);

        return new NextPieceVisualizer(canvas, rows, MAX_PIECE_WIDTH, cells, cell_size, padding_left, padding_up);
    }

    drawNextPiece(piece) {

        this.clear();

        const pieceCopy = new Piece(piece.name, piece.color, piece.shape, piece.center, piece.rotatable);

        pieceCopy.spawnInNextPieceVisualizer({ x: Math.floor(this.#columns / 2), y: Math.floor(this.#rows / 2) }, this.#cells);

        GameBoard.draw(this.#canvas, this.#columns, this.#rows, this.#cells, this.#cell_size, this.padding_left, this.padding_up);
    }

    clear() {
        for (let i = 0; i < this.#columns; i++) {
            for (let j = 0; j < this.#rows; j++) {
                this.#cells[i][j].piece = null;
            }
        }
    }

    constructor(canvas, rows, columns, cells, cell_size, padding_left, padding_up) {
        this.#canvas = canvas;
        this.#cell_size = cell_size;
        this.#cells = cells;
        this.#columns = columns;
        this.#rows = rows;
        this.padding_left = padding_left;
        this.padding_up = padding_up;        
    }
}