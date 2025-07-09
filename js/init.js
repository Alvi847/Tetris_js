; document.addEventListener("DOMContentLoaded", init);

const DELTA_TIME = 50; // Tiempo que transcurre entre cada frame (depende del ordenador pero como es un tetris se puede asumir así)
const INITIAL_PIECE_FALL_FACTOR = 20; // Cada cuantos frames cae la pieza hacia abajo en el nivel más fácil

/**
 * 1000ms/DELTA_TIME = FRAMES_PER_SECOND
 */

const COLUMNS = 11;
const MAX_PIECE_WIDTH = 5;
const MAX_PIECE_HEIGHT = 5;

const INNER_SQUARE_SIZE = 5;
const PIECE_BORDER_COLOR = { r: -50, g: -50, b: -50, a: 1 };

const GRID_COLOR = { r: 47, g: 47, b: 51, a: 1 };
const GUI_BACKGROUND_COLOR = { r: 13, g: 13, b: 53, a: 1 };

const CELL_SIZE_REDUCTION = 1;

const PIECE_PROJECTION_ALPHA = 0.1;

const GUI_ELEMENTS_CLASSES = '.tablero, .text-info-rect';


const DEBUG_MODE = false; //Activate debug mode

// Debug Constants
const DEBUG_INSPECTED_CELL_COLOR = { r: 255, g: 255, b: 255, a: 1 };
const DEBUG_RED_CROSS_COLOR = { r: 255, g: 0, b: 0, a: 1 };

let game_board;
let double_click;
let timeout;

function init() {
    const start_button = document.getElementById('start_button');
    const edit_button = document.getElementById('edit_button');
    const restart_button = document.getElementById('restart_button');

    start_button.addEventListener("click", startGame);
    restart_button.addEventListener("click", startGame);
    edit_button.addEventListener("click", openEditMenu);

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
        else if (e.key == 'ArrowUp') {
            game_board.upArrowKeyPressed();
        }
    });
}

function startGame(e) {
    const button = e.target;
    const gui_elements = document.querySelectorAll(GUI_ELEMENTS_CLASSES);
    const canvas = document.getElementById('canvas');

    canvas.width = 500;
    canvas.height = 900;

    button.parentNode.style.display = 'none';

    const next_piece_canvas = document.getElementById('next-piece-canvas');

    next_piece_canvas.width = 150;
    next_piece_canvas.height = 150;

    for (let i = 0; i < gui_elements.length; i++) {
        gui_elements.item(i).style.display = 'flex';
        gui_elements.item(i).style.backgroundColor = RGBColor.buildRGB(RGBColor.createColorObject(GUI_BACKGROUND_COLOR.r, GUI_BACKGROUND_COLOR.g, GUI_BACKGROUND_COLOR.b));
    }

    const points_manager = getPointsGUI();

    const npv = PieceVisualizer.createPieceVisualizer(next_piece_canvas); //npv == Next Piece Visualizer

    game_board = GameBoard.createBoard(canvas, npv, points_manager);

    if (DEBUG_MODE)
        game_board.setDebugManager();

    game_board.loadPieces();

    game_board.setTimers();

}

function getPointsGUI() {
    const lines = document.querySelector('.text-info-rect > [name="lines"]');
    const level = document.querySelector('.text-info-rect > [name="level"]');
    const points = document.querySelector('.text-info-rect > [name="points"]');

    return new Points(points, level, lines);
}

function openEditMenu() {
    const pieces_div = document.querySelector(".options_rect .container #available_pieces");

    const pieces_array = Piece.loadPieces(0);

    for (let i = 0; i < pieces_array.length; i++) {

        const piece = pieces_array[i].piece;

        const div = document.createElement('div');

        div.className = 'edit_piece_entry';
        div.id = `${i}`;

        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = canvas.width;

        div.style.backgroundColor = RGBColor.buildRGB(GUI_BACKGROUND_COLOR);
        div.style.transition = 'filter 0.2s ease';
        div.appendChild(canvas);
        div.addEventListener("click", editPiece);

        const piece_visualizer = PieceVisualizer.createPieceVisualizer(canvas);
        piece_visualizer.drawPiece(piece);
        canvas.piece_visualizer = piece_visualizer;

        pieces_div.appendChild(div);
    }

    document.querySelector("#edit_rect").style.visibility = 'visible';
    document.querySelector("#start_rect").style.visibility = 'hidden';
}

function editPiece(e) {
    const index = Number(this.id);
    const editor_div = document.querySelector('#edit_rect .container .editor');

    editor_div.replaceChildren();
    editor_div.id = index;

    let piece;
    if (Piece.parsed_pieces.length > index) {
        piece = Piece.parsed_pieces[index].piece;
        piece.weight = Piece.parsed_pieces[index].weight;
    }
    else
        piece = {};

    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = canvas.width;
    canvas.addEventListener("click", processEditPieceClick);

    const div = document.createElement('div');
    div.className = 'edit_piece_visualizer';
    div.style.backgroundColor = RGBColor.buildRGB(GUI_BACKGROUND_COLOR);

    const piece_visualizer = PieceVisualizer.createPieceVisualizer(canvas);
    piece_visualizer.drawPiece(piece);

    canvas.piece_visualizer = piece_visualizer;

    div.appendChild(canvas);

    const edit_form = document.createElement('form');
    const edit_fieldset = document.createElement('fieldset');

    createField('name', piece.name, 'Name:', edit_fieldset);
    createField('weight', piece.weight, 'Weight:', edit_fieldset);
    //createField('rotatable', piece.rotatable, 'Rotatable:', edit_fieldset, 'checkbox');

    const buttons_div = document.createElement('div');

    buttons_div.className = 'buttons_div';

    const save_button = document.createElement('button');
    save_button.textContent = 'Save';
    save_button.type = 'button';
    save_button.addEventListener("click", savePiece);

    const exit_button = document.createElement('button');
    exit_button.textContent = 'Exit';
    exit_button.type = 'button';
    exit_button.addEventListener("click", goToMainMenu);

    buttons_div.appendChild(save_button);
    buttons_div.appendChild(exit_button);
    

    edit_form.appendChild(edit_fieldset);

    editor_div.appendChild(div);
    editor_div.appendChild(edit_form);
    editor_div.appendChild(buttons_div);
}

function createField(input_name, input_value, label_value, fieldset, type = 'text') {
    const field_div = document.createElement('div');
    field_div.className = 'fieldset_group';

    const field_label = document.createElement('label');
    field_label.htmlFor = input_name; //input_name se usa para el id del input tambien
    field_label.textContent = label_value;

    const field_input = document.createElement('input');
    field_input.name = input_name;
    field_input.id = input_name;
    if(type != 'checkbox' && type != 'radio')
        field_input.value = (input_value || '');
    else
        field_input.checked = (input_value || false);
    field_input.type = type;

    field_div.appendChild(field_label);
    field_div.appendChild(field_input);

    fieldset.appendChild(field_div);
}

function processEditPieceClick(e) {

    setTimeout({
        
    }, 500);

    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cell = canvas.piece_visualizer.getCellByCoords({ x, y });
    if (cell) {
        canvas.piece_visualizer.toggleCell(cell);
    }

}

function isEmptyObj(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function savePiece() { // TODO: Poner lógica y método para definir el centro de una pieza
    const index = Number(document.querySelector('#edit_rect .container .editor').id);

    const canvas = document.querySelector('.edit_piece_visualizer canvas');
    const form = document.querySelector('#edit_rect .container .editor form');

    const formData = new FormData(form);
    const pieceData = Object.fromEntries(formData.entries());

    const piece_shape = canvas.piece_visualizer.scanShape();

    const piece = { name: pieceData.name, weight: pieceData.weight, color: ['0', '0', '255'], shape: piece_shape}; //TODO: cambiar el color
    const parsed_color = new RGBColor(0, 0, 255);


    try { //TODO: Comprobar que la pieza es un grafo Hamiltoniano (No tiene partes separadas)
        if (Piece.possible_pieces.length > index) {
            updatePieceInVisualizer(index, piece_shape, piece.name, piece.weight, parsed_color);
            Piece.possible_pieces[index] = piece;
        }
        else {
            parsePieceShape(piece_shape); //TODO cambiar en el futuro??
            Piece.possible_pieces.push(piece);
        }
    }
    catch(e){
        console.log(e.message);
    }
}

function updatePieceInVisualizer(index, piece_shape, name, weight, color) {
    const piece_entry_visualizer = document.querySelector(`.edit_piece_entry[id='${index}'] canvas`).piece_visualizer;

    const {blocks, center, rotatable} = parsePieceShape(piece_shape);
    const piece = new Piece(name, color, blocks, center, rotatable);
    piece_entry_visualizer.drawPiece(piece);
    Piece.parsed_pieces[index] = {piece, weight};
}

function parsePieceShape(piece_shape) {
    const {blocks, center, rotatable} = Piece.parseShape(piece_shape, 0);

    if (blocks != null) {
        return {blocks, center, rotatable};
    }
    else
        throw Error('Invalid piece shape');
}

function goToMainMenu(){
    document.querySelector("#edit_rect").style.visibility = 'hidden';
    document.querySelector("#start_rect").style.visibility = 'visible';
}