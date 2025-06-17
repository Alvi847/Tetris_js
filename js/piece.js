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
        },*/
        {
            "name": 'Red L',
            "color": ['255', '0', '0'],
            "shape": [
                ['X'],
                ['X', 'C', 'X']
            ]
        },
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
        },
        {
            "name": 'Purple Camila',
            "color": ['96', '54', '168'],
            "shape": [
                ['X', 'C', 'X'],
                ['X']
            ]
        },
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

    moveToCoords(newCoords){
        this.#center = newCoords;
    }

    spawnInNextPieceVisualizer(center, cells){
        this.#center = center;

        cells[center.x][center.y].piece = this;

        for (let i = this.#shape.length - 1; i >= 0; i--) {
            const block = this.#shape[i];
            const block_coords = Cell.addCoords(Cell.addCoords(this.#center, block));
            cells[block_coords.x][block_coords.y].piece = this;
        }
    }
}