class DrawableBoard{


    padding_left;
    padding_up;

    static initBoardValues(width, height, columns){

        const cell_size = Math.floor(width / columns) - CELL_SIZE_REDUCTION;
        const rows = Math.floor(height / cell_size);

        const cells = [];
        for (let i = 0; i < columns; i++) {
            cells[i] = [];
            for (let j = 0; j < rows; j++) {
                cells[i][j] = new Cell();
            }
        }

        const padding_left = Math.floor((CELL_SIZE_REDUCTION * columns) / 2);

        const padding_up = Math.floor((CELL_SIZE_REDUCTION * rows) / 2);

        return {rows, cell_size, cells, columns, padding_left, padding_up}

    }

    draw(canvas, columns, rows, cells, cell_size) {
        if (canvas.getContext) {
            const ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height) // Se borra todo el tablero

            this.drawGrid(ctx, columns, rows, cell_size);

            for (let i = 0; i < columns; i++) {
                for (let j = 0; j < rows; j++) {
                    cells[i][j].draw(ctx, i * cell_size + this.padding_left, j * cell_size + this.padding_up, cell_size);
                }
            }
        }
    }

    drawGrid(ctx, columns, rows, cell_size) {
        ctx.fillStyle = RGBColor.buildRGB(GRID_COLOR);
        for (let i = 0; i <= columns; i++) {
            ctx.fillRect(i * cell_size + this.padding_left, this.padding_up, 2, rows * cell_size);
        }

        for (let i = 0; i <= rows; i++) {
            ctx.fillRect(this.padding_left, i * cell_size + this.padding_up, columns * cell_size, 2);
        }

        ctx.fillStyle = '#000';
    }

    constructor(padding_left, padding_up){
        this.padding_left = padding_left;
        this.padding_up = padding_up;
    }
}