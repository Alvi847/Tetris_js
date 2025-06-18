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

    isOtherPiece(piece) {
        if (!this.#piece)
            return false;
        return this.#piece != piece;
    }

    isPiece(){
        return this.#piece != null
    }

    draw(ctx, x, y, size) {
        if(this.#piece){
            ctx.fillStyle = RGBColor.buildRGB(RGBColor.correctValues(RGBColor.addRGB(this.#piece.color, PIECE_BORDER_COLOR)));
            ctx.fillRect(x, y, size, size);
            
            ctx.fillStyle = RGBColor.buildRGB(this.#piece.color);
            ctx.fillRect(x + INNER_SQUARE_SIZE, y + INNER_SQUARE_SIZE, size - 2 * INNER_SQUARE_SIZE, size - 2 * INNER_SQUARE_SIZE);
        }
    }

    static addCoords(...args) {
        return args.reduce((accum, current_value) => ({
            x: accum.x + current_value.x,
            y: accum.y + current_value.y,
        }), { x: 0, y: 0 });
    }
}