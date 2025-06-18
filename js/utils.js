class Utils{

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

}