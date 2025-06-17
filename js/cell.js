class Cell {

    piece;
    block_num;

    constructor() {
        this.block_num = 0;
    }

    isPiece(piece) {
        if (!this.piece)
            return false;
        return this.piece != piece;
    }

    draw(ctx, x, y, size) {
        ctx.fillStyle = RGBColor.buildRGB(this.piece.color);
        ctx.fillRect(x, y, size, size);
    }

    static addCoords(...args) {
        return args.reduce((accum, current_value) => ({
            x: accum.x + current_value.x,
            y: accum.y + current_value.y,
        }), { x: 0, y: 0 });
    }
}