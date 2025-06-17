class Cell {

    #piece;
    #block_num;

    constructor() {
        this.#block_num = 0;
    }

    get block_num(){
        return this.#block_num;
    }

    set block_num(new_block_num){
        this.#block_num = new_block_num;
    }

    set piece(new_piece){
        this.#piece = new_piece;
    }

    get piece(){
        return this.#piece;
    }

    isPiece(piece) {
        if (!this.#piece)
            return false;
        return this.#piece != piece;
    }

    draw(ctx, x, y, size) {
        ctx.fillStyle = RGBColor.buildRGB(this.#piece.color);
        ctx.fillRect(x, y, size, size);
    }

    static addCoords(...args) {
        return args.reduce((accum, current_value) => ({
            x: accum.x + current_value.x,
            y: accum.y + current_value.y,
        }), { x: 0, y: 0 });
    }
}