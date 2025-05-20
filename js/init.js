; document.addEventListener("DOMContentLoaded", init);

const DELTA_TIME = 500;
const COLUMNS = 10;

let game_board;

function init() {
    const start_button = document.getElementById('start_button');

    start_button.addEventListener("click", startGame);

    document.addEventListener('keydown', (e) => {
        if (e.key == 'ArrowLeft') {
            game_board.sideArrowKeyPressed(-1);
        }
        else if (e.key == 'ArrowRight') {
            game_board.sideArrowKeyPressed(1);
        }
        else if (e.key == 'ArrowDown') {
            game_board.downArrowKeyPressed();
        }
    });
}

function startGame(e) {
    const button = e.target;
    const canvas = document.getElementById('canvas');
    const div = document.querySelector('div.tablero');

    canvas.width = 300;
    canvas.height = 300;

    button.parentNode.style.display = 'none';


    game_board = GameBoard.createBoard(canvas);

    game_board.loadPieces();

    game_board.setTimers();

}


class Piece {

    #shape;

    #name;

    color;

    #center;

    #rotatable;

    static possible_pieces = [
        /*{
            "name": 'Blue square',
            "color": ['0', '0', '255'],
            "shape": [
                ['X', 'X'],
                ['X', 'X']
            ]
        },
        {
            "name": 'Red L',
            "color": ['255', '0', '0'],
            "shape": [
                ['X'],
                ['X', 'C', 'X']
            ]
        },*/
        {
            "name": 'Light Blue Line',
            "color": ['0', '150', '255'],
            "shape": [
                ['X', 'C', 'X']
            ]
        },
        {
            "name": 'Light Green Line',
            "color": ['0', '255', '150'],
            "shape": [
                ['X'],
                ['C'],
                ['X']
            ]
        }
    ]

    constructor(name, color, shape, center, rotatable) {
        this.#name = name;
        this.color = color;
        this.#center = center;
        this.#shape = shape;
        this.#rotatable = rotatable;
    }


    get name() {
        return this.#name;
    }

    get shape() {
        return this.#shape;
    }

    get rotatable() {
        return this.#rotatable;
    }

    get center() {
        return this.#center;
    }

    static loadPieces(starting_x) {
        const pieceArray = [];
        for (let index = 0; index < this.possible_pieces.length; index++) {
            const pieceData = this.possible_pieces[index];
            const name = pieceData.name;
            if (name == null)
                throw Error("All pieces must have a name");
            if (Array.isArray(pieceData.color) && pieceData.color.length === 3) {
                const color = new RGBColor(pieceData.color[0], pieceData.color[1], pieceData.color[2]);

                let shape = pieceData.shape;
                if (Array.isArray(shape)) {
                    shape = Piece.parseShape(shape, starting_x);
                    if (shape == null)
                        throw Error("Invalid shape format for piece: %s", pieceData.name);
                    const newPiece = { name: name, color: color, shape: shape.blocks, center: shape.center, rotatable: shape.rotatable };
                    pieceArray.push(newPiece);
                }
                else
                    throw Error("Invalid shape format for piece: %s", pieceData.name);

            }
            else
                throw Error("Invalid rgb color format for piece: %s", pieceData.name);
        }


        const seen = new Set();
        for (const obj of pieceArray) {
            const name = obj.name;
            if (seen.has(name)) {
                throw Error("All piece names must be unique!");
            }
            seen.add(name);
        }

        return pieceArray;
    }

    static parseShape(shape, starting_x) {
        const blocks = [];
        let center, x = 0, y = 0;
        for (const cells of shape) {
            if (!Array.isArray(cells))
                return null;
            y = 0;
            for (const singleCell of cells) {
                if (singleCell === 'X') {
                    blocks.push({ x, y });
                }
                else if (singleCell === 'C') {
                    center = { x, y };
                }
                else
                    return null;
                y++;
            }
            x++;
        }

        if (center) {
            const mapped_blocks = blocks.map(b => ({ x: b.x - center.x, y: b.y - center.y }))
            return {
                blocks: mapped_blocks,
                center: { x: starting_x, y: Math.abs(mapped_blocks[0].y) },
                rotatable: true
            };
        }
        else {
            return {
                blocks,
                center: { x: starting_x, y: blocks[0].y },
                rotatable: false
            };
        }
    }

    toJSON() {
        return {
            shape: this.#shape,
            name: this.#name,
            color: this.color,
            center: this.#center,
            rotatable: this.#rotatable
        };
    }

    static copy(b) {
        const s = JSON.parse(JSON.stringify(b));
        console.log(s);
        return s;
    }

    move(game_board, direction) {
        for (let i = this.#shape.length - 1; i >= 0; i--) {
            const block = this.#shape[i];
            game_board.leaveCell(Cell.addCoords(this.#center, block));
            game_board.occupyCell(Cell.addCoords(this.#center, direction, block), this);
        }
        game_board.leaveCell(this.#center);
        game_board.occupyCell(Cell.addCoords(this.#center, direction), this);
        this.#center = Cell.addCoords(this.#center, direction);
    }

    moveLateralIfAble(game_board, direction) {
        if (this.checkCollisions(game_board, direction)) {
            this.move(game_board, direction);
            return true;
        }
        return false;
    }

    checkCollisions(game_board, direction) {
        let i = 0;
        while (i < this.#shape.length && !game_board.isMovementEnd(Cell.addCoords(this.#center, direction, this.#shape[i]), this)) i++;
        return i == this.#shape.length;
    }
}

class GameBoard {
    #columns;
    #rows;
    #canvas;
    #cell_size;

    #cells;

    draw_timer;

    seed;

    next_piece;

    falling_piece;

    pieces;

    can_fall_piece;

    lines;
    
    static createBoard(canvas) {

        const cell_size = canvas.width / COLUMNS;
        const rows = canvas.height / cell_size;

        const cells = [];
        for (let i = 0; i < COLUMNS; i++) {
            cells[i] = [];
            for (let j = 0; j < rows; j++) {
                cells[i][j] = new Cell();
            }
        }

        return new GameBoard(canvas, rows, COLUMNS, cells, cell_size);
    }

    loadPieces() {
        this.pieces = Piece.loadPieces(this.#columns / 2);
        this.falling_piece = this.pickRandomPiece();
    }

    pickRandomPiece() {
        const index = Math.floor(Math.random() * this.pieces.length);
        //return Piece.copy(this.pieces[index]);
        return new Piece(this.pieces[index].name, this.pieces[index].color, this.pieces[index].shape, this.pieces[index].center, this.pieces[index].rotatable);
    }

    gameLoop() {
        // Se elige la siguiente pieza
        if (!this.next_piece) {
            this.next_piece = this.pickRandomPiece();
        }
        if (this.can_fall_piece) {
            this.can_fall_piece = false;

            // Se mueve la pieza actual
            this.falling_piece.move(this, { x: 0, y: 1 });

            // Se calculan colisiones
            if (!this.falling_piece.checkCollisions(this, { x: 0, y: 1 })) {
                this.falling_piece = this.next_piece;
                this.next_piece = null;
                this.checkForLines();
            }
        }
        // Se dibuja el tablero
        this.draw();
    }

    draw() {
        if (this.#canvas.getContext) {
            const ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height) // 0, 0???

            for (let i = 0; i < COLUMNS; i++) {
                for (let j = 0; j < this.#rows; j++) {
                    if (this.#cells[i][j].isPiece())
                        this.#cells[i][j].draw(ctx, i * this.#cell_size, j * this.#cell_size, this.#cell_size);
                }
            }
        }
    }

    sideArrowKeyPressed(key) {
        const direction = { x: key, y: 0 };
        if (this.falling_piece.moveLateralIfAble(this, direction)) {
            if (!this.falling_piece.checkCollisions(this, { x: 0, y: 1 })) {
                this.falling_piece = this.next_piece;
                this.next_piece = null;
            }
        }
    }

    downArrowKeyPressed() {
        while (this.falling_piece.checkCollisions(this, { x: 0, y: 1 })) {
            this.falling_piece.move(this, { x: 0, y: 1 });
        }

        this.falling_piece = this.next_piece;
        this.next_piece = null;
        this.checkForLines();
    }

    setTimers() {
        this.draw_timer = setInterval(() => this.gameLoop(), DELTA_TIME);
        this.can_fall_piece = setInterval(() => { this.can_fall_piece = true }, DELTA_TIME * 2);
    }

    checkForLines() {
        let lines = 0;
        for (let j = 0; j < this.#rows; j++) {
            let isLine = true;
            for (let i = 0; i < this.#columns; i++) {
                if (!this.#cells[i][j].isPiece())
                    isLine = false;
            }
            if (isLine == true) {
                lines++;
                for (let i = 0; i < this.#columns; i++) {
                    this.#cells[i][j].block_num = 0;
                    this.#cells[i][j].piece = null;
                }
            }
        }
        if (lines > 0) {
            for (let j = this.#rows - 1 - lines; j > 0; j--) {
                for (let i = 0; i < this.#columns; i++) {
                    const piece = this.#cells[i][j].piece
                    if (piece) {
                        this.leaveCell({ x: i, y: j });
                        this.occupyCell({ x: i, y: j + 1 }, piece);
                    }
                }
            }
            this.lines += lines
            console.log("Líneas: ", this.lines);
        }
        return lines;
    }

    leaveCell(coords) {
        this.#cells[coords.x][coords.y].block_num--;
        if (this.#cells[coords.x][coords.y].block_num <= 0) {
            this.#cells[coords.x][coords.y].piece = null;
            this.#cells[coords.x][coords.y].block_num = 0;
        }
    }

    occupyCell(coords, piece) {
        this.#cells[coords.x][coords.y].piece = piece;
        this.#cells[coords.x][coords.y].block_num++;
    }

    isMovementEnd(coords, piece) {
        return this.isOut(coords) || this.#cells[coords.x][coords.y].isPiece(piece);
    }

    isOut(coords) {
        return coords.y > this.#rows - 1 || coords.x < 0 || coords.x > this.#columns - 1;
    }

    constructor(canvas, rows, columns, cells, cell_size) {
        this.#canvas = canvas;
        this.#rows = rows;
        this.#columns = columns;
        this.#cells = cells;
        this.#cell_size = cell_size;
        this.lines = 0;
    }

    /*get columns(){
        return this.#columns;
    }
    get rows(){
        return this.#rows;
    }
    get canvas(){
        return this.#canvas;
    }
    get cells(){
        return this.#cells;
    }*/
}

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
        ctx.fillStyle = `rgb(${this.piece.color.r}, ${this.piece.color.g}, ${this.piece.color.b})`;
        ctx.fillRect(x, y, size, size);
    }

    static addCoords(...args) {
        return args.reduce((accum, current_value) => ({
            x: accum.x + current_value.x,
            y: accum.y + current_value.y,
        }), { x: 0, y: 0 });
    }
}

class RGBColor {

    r;

    g;

    b;

    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}