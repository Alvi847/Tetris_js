class Cell {

    #piece;
    #block_num;

    is_projection;
    projection_color;

    constructor() {
        this.#block_num = 0;
    }

    get block_num() {
        return this.#block_num;
    }

    set block_num(new_block_num) {
        this.#block_num = new_block_num;
    }

    set piece(new_piece) {
        this.#piece = new_piece;
    }

    get piece() {
        return this.#piece;
    }

    isOtherPiece(piece) {
        if (!this.#piece)
            return false;
        return this.#piece != piece;
    }

    isPiece() {
        return this.#piece != null
    }

    draw(ctx, x, y, size) {
        if (this.#piece) {
            this.paintBlocksWithColor(ctx, x, y, size, this.#piece.color, PIECE_BORDER_COLOR);
        }
        else if (this.is_projection) {
            this.paintBlocksWithColor(ctx, x, y, size, this.projection_color, new RGBColor(PIECE_BORDER_COLOR.r, PIECE_BORDER_COLOR.g, PIECE_BORDER_COLOR.b, this.projection_color.a));
        }
    }

    paintBlocksWithColor(ctx, x, y, size, color, border_color) {
        ctx.fillStyle = RGBColor.buildRGB(RGBColor.correctValues(RGBColor.addRGBA(color.a, color, border_color)));
        ctx.fillRect(x, y, size, size);

        ctx.fillStyle = RGBColor.buildRGB(color);
        ctx.fillRect(x + INNER_SQUARE_SIZE, y + INNER_SQUARE_SIZE, size - 2 * INNER_SQUARE_SIZE, size - 2 * INNER_SQUARE_SIZE);
    }

    setProjection(color) {
        this.is_projection = true;
        const projection_color = RGBColor.createColorObject(color.r, color.g, color.b);
        projection_color.setAlpha(PIECE_PROJECTION_ALPHA);
        this.projection_color = projection_color;
    }

    removeProjection() {
        this.is_projection = false;
    }

    static addCoords(...args) {
        return args.reduce((accum, current_value) => ({
            x: accum.x + current_value.x,
            y: accum.y + current_value.y,
        }), { x: 0, y: 0 });
    }

    static rotateCoords(coords, direction){ // Derecha 90º => direction = 1, izquierda 90º => direction = -1
        return {x: -direction * coords.y, y: direction * coords.x};

    }
}