class Piece {

    #shape;

    #name;

    color;

    #center;

    #rotatable;

    weight;

    static parsed_pieces = []; // Array de piezas ya parseadas
    static possible_pieces = [
        {
            "name": 'Blue square',
            "color": ['0', '0', '255'],
            "shape": [
                ['X', 'X'],
                ['X', 'X']
            ],
            "weight": '10'
        },
        {
            "name": 'Red L',
            "color": ['255', '0', '0'],
            "shape": [
                ['X'],
                ['X', 'C', 'X']
            ],
            "weight": '35'
        },
        {
            "name": 'Light Blue Line',
            "color": ['0', '150', '255'],
            "shape": [
                ['X', 'C', 'X']
            ],
            "weight": '10'
        },
        {
            "name": 'Light Green Line',
            "color": ['0', '255', '150'],
            "shape": [
                ['X'],
                ['C'],
                ['X']
            ],
            "weight": '10'
        },
        {
            "name": 'Light Orange Long Line',
            "color": ['255', '140', '64'],
            "shape": [
                ['X'],
                ['X'],
                ['C'],
                ['X'],
                ['X']
            ],
            "weight": '5'
        },
        {
            "name": 'Purple Camila',
            "color": ['96', '54', '168'],
            "shape": [
                ['X', 'C', 'X'],
                ['X']
            ],
            "weight": '35'
        },
        {
            "name": 'Light blue ZigZag',
            "color": ['0', '255', '255'],
            "shape": [
                ['O', 'X', 'C', 'O'],
                ['O', 'O', 'X', 'X']
            ],
            "weight": '20'
        },
        {
            "name": 'T',
            "color": ['0', '255', '255'],
            "shape": [
                ['O', 'X', 'O'],
                ['X', 'C', 'X']
            ],
            "weight": '10'
        },
    ]

    constructor(name, color, shape, center, rotatable, weight) {
        this.#name = name;
        this.color = color;
        this.#center = center;
        this.#shape = shape;
        this.#rotatable = rotatable;
        this.weight = weight;
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

    static loadPiece(piece_data){
        if (piece_data.name == null)
            throw Error("All pieces must have a name");
        if (Array.isArray(piece_data.color) && piece_data.color.length === 3) {
            const color = RGBColor.createColorObject(Number(piece_data.color[0]), Number(piece_data.color[1]), Number(piece_data.color[2]));

            let shape = piece_data.shape;
            if (Array.isArray(shape)) {
                shape = Piece.parseShape(shape);
                if (shape == null)
                    throw Error("Invalid shape format for piece: %s", piece_data.name);

                let piece_weight = 1;
                const aux_weight = piece_data.weight;
                if (!Number.isNaN(aux_weight) && aux_weight > 1)
                    piece_weight = aux_weight;
                else
                    console.log(`Piece weight for piece ${piece_data.name} is not valid. It must be a number above 0!  Using default weight instead...`);
                return new Piece(piece_data.name, color, shape.blocks, shape.center, shape.rotatable, piece_weight);
            }
            else
                throw Error("Invalid shape format for piece: %s", piece_data.name);

        }
        else
            throw Error("Invalid rgb color format for piece: %s", piece_data.name);
    }

    static loadPieceJSON(piece_json){
        return this.loadPiece(piece_json);
    }

    static loadHardCodedPiece(index) {
        const piece_data = this.possible_pieces[index];

        return this.loadPiece(piece_data);
                
    }

    static loadHardCodedPieces() {
        const piece_array = [];
        for (let index = 0; index < this.possible_pieces.length; index++) {
            const new_piece = Piece.loadHardCodedPiece(index);
            piece_array.push(new_piece);
        }

        const seen = new Set();
        for (const obj of piece_array) {
            const name = obj.name;
            if (seen.has(name)) {
                throw Error("All piece names must be unique!");
            }
            seen.add(name);
        }

        Piece.parsed_pieces = piece_array;
        return piece_array;
    }

    static parseShape(shape) {
        const blocks = [];
        let center, x = 0, y = 0;
        for (const cells of shape) {
            if (!Array.isArray(cells))
                return null;
            y = 0;
            for (const singleCell of cells) {

                if (singleCell === 'X') {
                    blocks.push({ x: y, y: x });
                }
                else if (singleCell === 'C') {
                    center = { x: y, y: x };
                }
                else if (singleCell !== 'O')
                    return null;
                y++;

            }
            x++;
        }

        if (center) {
            const mapped_blocks = blocks.map(b => ({ x: b.x - center.x, y: b.y - center.y }))
            return {
                blocks: mapped_blocks,
                center: { x: 0, y: Math.abs(mapped_blocks[0].y) },
                rotatable: true
            };
        }
        else {
            center = { x: 0, y: blocks.shift().y };
            return {
                blocks,
                center,
                rotatable: false
            };
        }
    }

    static copy(piece) {
        const shape_copy = [];

        for (const block of piece.shape) {
            shape_copy.push(block);
        }

        return new Piece(piece.name, piece.color, shape_copy, piece.center, piece.rotatable, piece.weight);
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

    rotateIfAble(game_board, direction) {
        if (this.rotatable) {
            let can_rotate = true;
            const new_coords = [];
            let i = this.#shape.length - 1
            while (i >= 0 && can_rotate) {
                const block = this.#shape[i];

                const rotated_coords = Cell.rotateCoords(block, direction);

                if (game_board.isMovementEnd(Cell.addCoords(this.#center, rotated_coords), this))
                    can_rotate = false;
                else {
                    new_coords.push(rotated_coords);
                }
                i--;
            }
            if (can_rotate) {
                for (let j = this.#shape.length - 1; j >= 0; j--) {
                    const block = this.#shape[j];
                    game_board.leaveCell(Cell.addCoords(this.#center, block));
                    game_board.occupyCell(Cell.addCoords(this.#center, new_coords[j]), this);
                    this.#shape[j] = new_coords[j];
                }
            }
            return can_rotate;
        }
        else
            return false;
    }

    checkCollisions(game_board, direction) {
        let i = 0;
        while (i < this.#shape.length && !game_board.isMovementEnd(Cell.addCoords(this.#center, direction, this.#shape[i]), this)) i++;
        if (i == this.#shape.length) {
            return !game_board.isMovementEnd(Cell.addCoords(this.#center, direction), this)
        }
        else
            return false;
    }

    moveToCoords(new_coords) {
        this.#center = new_coords;
    }

    movementEnd() {
        for (let i = this.#shape.length - 1; i >= 0; i--) {
            const block = this.#shape[i];
            game_board.leaveCell(Cell.addCoords(this.#center, block));
            game_board.occupyCell(Cell.addCoords(this.#center, block), { color: this.color, name: this.#name });
        }
        game_board.leaveCell(this.#center);
        game_board.occupyCell(this.#center, { color: this.color, name: this.#name });
    }

    getLines() {
        const piece_lines = [];
        for (let i = this.#shape.length - 1; i >= 0; i--) {
            const block = this.#shape[i];
            //if (piece_lines.length == 0 || piece_lines[piece_lines.length - 1] > this.#center.y + block.y)
            if (!piece_lines.find((e) => { return e === this.#center.y + block.y }))
                piece_lines.push(this.#center.y + block.y);
        }
        if (!piece_lines.find((e) => {
            return e === this.#center.y;
        }))
            piece_lines.push(this.#center.y);
        return piece_lines;
    }

    spawnInPieceVisualizer(center, cells, columns, rows) {
        this.#center = center;

        cells[center.x][center.y].piece = this;

        for (let i = this.#shape.length - 1; i >= 0; i--) {
            const block = this.#shape[i];
            const block_coords = Cell.addCoords(this.#center, block);

            if (block_coords.x < columns && block_coords.y < rows) {
                cells[block_coords.x][block_coords.y].piece = this;
            }
        }
    }

    cellsForPosition(position) {
        const cells = [];
        for (let i = this.#shape.length - 1; i >= 0; i--) {
            const block = this.#shape[i];
            cells.push(Cell.addCoords(position, this.#center, block));
        }
        cells.push(Cell.addCoords(position, this.#center));
        return cells;
    }

    movePieceToSpawn(starting_x){
        this.#center.x = starting_x;
    }
}