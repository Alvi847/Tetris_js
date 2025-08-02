class PieceVisualizer extends DrawableBoard {

    #canvas
    #rows;
    #columns;
    #cell_size;
    #cells;
    #current_piece;

    get current_piece() {
        return this.#current_piece;
    }

    static createPieceVisualizer(canvas) {
        const { rows, cells, cell_size, padding_left, padding_up, starting_x, starting_y } = DrawableBoard.initBoardValues(canvas.width, canvas.height, MAX_PIECE_WIDTH);

        return new PieceVisualizer(canvas, rows, MAX_PIECE_WIDTH, cells, cell_size, padding_left, padding_up, starting_x, starting_y);
    }

    drawPiece(piece) {

        this.clear();

        if (!isEmptyObj(piece)) {
            const pieceCopy = new Piece(piece.name, piece.color, piece.shape, piece.center, piece.rotatable, piece.weight);
            pieceCopy.spawnInPieceVisualizer({ x: this.starting_x, y: this.starting_y }, this.#cells, this.#columns, this.#rows);
            this.#current_piece = pieceCopy;
        }

        this.draw(this.#canvas, this.#columns, this.#rows, this.#cells, this.#cell_size);
    }

    getCellByCoords(coords) {
        const column = Math.floor(coords.x / this.#cell_size);
        const row = Math.floor(coords.y / this.#cell_size);

        if (column >= this.#columns || row >= this.#rows || row < 0 || column < 0)
            return null;
        else
            return { column, row };
    }

    toggleCell(cell) {
        const board_cell = this.#cells[cell.column][cell.row];
        if (!board_cell.isPiece()) {
            //const piece_to_paint = (this.#current_piece || new Piece()) // TODO: color???
            board_cell.piece = this.#current_piece;
        }
        else {
            board_cell.piece = null;
        }
        this.draw(this.#canvas, this.#columns, this.#rows, this.#cells, this.#cell_size);
    }

    scanShape() {
        const shape = [];
        for (let row = 0; row < this.#rows; row++) {
            const shape_row = [];
            let row_has_blocks = false;
            for (let column = 0; column < this.#columns; column++) {
                const cell = this.#cells[column][row];

                if(!cell.isPiece())
                    shape_row.push('O');
                else{
                    if(this.#current_piece.center.x == column && this.#current_piece.center.y == row)
                        shape_row.push('C');
                    else
                        shape_row.push('X');
                    row_has_blocks = true;
                }

            }
            if(row_has_blocks){
                shape.push(shape_row);
            }
        }

        return shape;
    }

    update(){
        this.draw(this.#canvas, this.#columns, this.#rows, this.#cells, this.#cell_size);
    }

    clear() {
        for (let i = 0; i < this.#columns; i++) {
            for (let j = 0; j < this.#rows; j++) {
                this.#cells[i][j].piece = null;
            }
        }
    }

    constructor(canvas, rows, columns, cells, cell_size, padding_left, padding_up, starting_x, starting_y) {
        super(padding_left, padding_up, starting_x, starting_y);
        this.#canvas = canvas;
        this.#cell_size = cell_size;
        this.#cells = cells;
        this.#columns = columns;
        this.#rows = rows;
    }
}