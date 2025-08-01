class DebugManager {

    #game_board;
    #columns;
    #rows;
    #canvas;
    #next_piece_visualizer;
    #cell_size;

    #cells;

    debug_confirm;

    debugConfirm() {
        this.debug_confirm = true;
    }

    waitForConfirm() {
        return new Promise((resolve) => {
            const listener = (e) => {
                if(e.key == 'd'){
                    document.removeEventListener("keydown", listener);
                    resolve();
                }
            }
            document.addEventListener("keydown", listener);
        });
    }

    async debugDraw(operationObj, ...cells) {
        switch (operationObj.type) {
            case 'CELL_INSPECTION':
                cells.forEach((cell) => {
                    cell.draw(this.#canvas.getContext('2d'), operationObj.x * this.#cell_size + this.#game_board.padding_left, operationObj.y * this.#cell_size + this.#game_board.padding_up,
                        this.#cell_size, DEBUG_INSPECTED_CELL_COLOR);
                });
                break;
            case 'NO_LINE_CELL':
                cells.forEach((cell) => {
                    const origin = { x: operationObj.x * this.#cell_size + this.#game_board.padding_left, y: operationObj.y * this.#cell_size + this.#game_board.padding_up }
                    const ctx = this.#canvas.getContext('2d');
                    cell.draw(ctx, origin.x, origin.y,
                        this.#cell_size, DEBUG_INSPECTED_CELL_COLOR);
                    this.drawCross(ctx, DEBUG_RED_CROSS_COLOR, origin, 5);
                });
                break;
            case 'DEFAULT_DRAW':
                cells.forEach((cell) => {
                    cell.draw(this.#canvas.getContext('2d'), operationObj.x * this.#cell_size + this.#game_board.padding_left, operationObj.y * this.#cell_size + this.#game_board.padding_up,
                        this.#cell_size);
                });
                break;

        }
        await this.waitForConfirm();
    }

    drawCross(ctx, color, origin, width) {
        ctx.strokeStyle = RGBColor.buildRGB(color);
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(origin.x + this.#cell_size, origin.y + this.#cell_size);
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(origin.x + this.#cell_size, origin.y);
        ctx.lineTo(origin.x, origin.y + this.#cell_size);
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.strokeStyle = 'black';
    }

    constructor(game_board, columns, rows, canvas, next_piece_visualizer, cell_size, cells) {
        this.#game_board = game_board;
        this.#columns = columns;
        this.#rows = rows;
        this.#canvas = canvas;
        this.#next_piece_visualizer = next_piece_visualizer;
        this.#cell_size = cell_size;
        this.#cells = cells;
    }

}