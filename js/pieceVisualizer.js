class PieceVisualizer extends DrawableBoard {

    #canvas
    #rows;
    #columns;
    #cell_size;
    #cells;
    #current_piece;

    piece_center; // Esto es lo que se me ha ocurrido usar para cambiar el centro de las piezas en el menú de edición
    show_piece_center;
    piece_has_center;

    get current_piece() {
        return this.#current_piece;
    }

    static createPieceVisualizer(canvas, show_piece_center = false) {
        const { rows, cells, cell_size, padding_left, padding_up, starting_x, starting_y } = DrawableBoard.initBoardValues(canvas.width, canvas.height, MAX_PIECE_WIDTH);

        return new PieceVisualizer(canvas, rows, MAX_PIECE_WIDTH, cells, cell_size, padding_left, padding_up, starting_x, starting_y, show_piece_center);
    }

    drawPiece(piece) {

        this.clearCells();

        if (!isEmptyObj(piece)) {
            const pieceCopy = new Piece(piece.name, piece.color, piece.shape, piece.center, piece.rotatable, piece.weight);
            pieceCopy.spawnInPieceVisualizer(this.calculateStartingDrawCoords(piece), this.#cells, this.#columns, this.#rows);
            this.#current_piece = pieceCopy;
            this.piece_center = pieceCopy.center;
            this.piece_has_center = pieceCopy.rotatable;
        }

        this.draw(this.#canvas, this.#columns, this.#rows, this.#cells, this.#cell_size);
    }

    // TODO: Habría que mejorar esto para colocar las piezas correctamente según su tamaño y centro
    calculateStartingDrawCoords(piece){
        if(piece.rotatable)
            return {x: this.starting_x, y: this.starting_y};
        else
            return {x: Math.floor(Math.abs(piece.shape[piece.shape.length - 1].x / 2)), y: Math.floor(Math.abs(piece.shape[piece.shape.length - 1].y / 2))};
    }

    getCellByCoords(coords) {
        const column = Math.floor(coords.x / this.#cell_size);
        const row = Math.floor(coords.y / this.#cell_size);

        if (column >= this.#columns || row >= this.#rows || row < 0 || column < 0)
            return null;
        else
            return { column, row };
    }

    draw(canvas, columns, rows, cells, cell_size) {
        super.draw(canvas, columns, rows, cells, cell_size);


        if (this.piece_has_center && this.show_piece_center) {
            const color = cells[this.piece_center.x][this.piece_center.y].piece.color
            const ctx = canvas.getContext('2d');

            ctx.strokeStyle = RGBColor.buildRGB(RGBColor.correctValues(RGBColor.addRGBA(color.a, color, GUI_EDIT_CENTER_COLOR)));

            const x = this.padding_left + this.piece_center.x * cell_size + cell_size / 2;
            const y = this.padding_up + this.piece_center.y * cell_size + cell_size / 2;

            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.arc(x, y, cell_size / 3, Math.PI / 2, 3 * (Math.PI / 2), false);
            ctx.stroke();
        }
    }

    toggleCell(cell, center_select_mode) {
        const board_cell = this.#cells[cell.column][cell.row];
        if (!board_cell.isPiece()) {
            //const piece_to_paint = (this.#current_piece || new Piece()) // TODO: color???
            if (!center_select_mode)
                board_cell.piece = this.#current_piece;
        }
        else {
            if (center_select_mode) {
                this.selectCenter(cell.column, cell.row);
            }
            else {
                if (this.piece_has_center && this.piece_center.x == cell.column && this.piece_center.y == cell.row) // No se si vale con poner solo this.piece_center != cell
                    this.deselectCenter();
                board_cell.piece = null;
            }
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

                if (!cell.isPiece())
                    shape_row.push('O');
                else {
                    if ((this.piece_has_center) && (this.piece_center.x == column && this.piece_center.y == row))
                        shape_row.push('C');
                    else
                        shape_row.push('X');
                    row_has_blocks = true;
                }

            }
            if (row_has_blocks) {
                shape.push(shape_row);
            }
        }

        return shape;
    }

    selectCenter(x, y) {
        this.piece_center = { x, y };
        this.piece_has_center = true;
    }

    deselectCenter() {
        this.piece_center = { x: 0, y: 0 };
        this.piece_has_center = false;
    }

    update() {
        this.draw(this.#canvas, this.#columns, this.#rows, this.#cells, this.#cell_size);
    }

    clearCells() {
        for (let i = 0; i < this.#columns; i++) {
            for (let j = 0; j < this.#rows; j++) {
                this.#cells[i][j].piece = null;
            }
        }
    }

    constructor(canvas, rows, columns, cells, cell_size, padding_left, padding_up, starting_x, starting_y, show_piece_center = false) {
        super(padding_left, padding_up, starting_x, starting_y);
        this.#canvas = canvas;
        this.#cell_size = cell_size;
        this.#cells = cells;
        this.#columns = columns;
        this.#rows = rows;
        this.show_piece_center = show_piece_center;
    }
}