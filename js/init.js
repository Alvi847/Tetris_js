; document.addEventListener("DOMContentLoaded", init);

const DELTA_TIME = 50; // Tiempo que transcurre entre cada frame (depende del ordenador pero como es un tetris se puede asumir así)
const INITIAL_PIECE_FALL_FACTOR = 30; // Cada cuantos frames cae la pieza hacia abajo en el nivel más fácil

/**
 * 1000ms/DELTA_TIME = FRAMES_PER_SECOND
 */

const GAME_VERSION = 'alpha 0.4.3'; // Versión del juego

const COLUMNS = 11;
const MAX_PIECE_WIDTH = 5;
const MAX_PIECE_HEIGHT = 5;

const INNER_SQUARE_SIZE = 5;
const PIECE_BORDER_COLOR = { r: -50, g: -50, b: -50, a: 1 };

const GRID_COLOR = { r: 47, g: 47, b: 51, a: 1 };
const GRID_WIDTH = 2;

const GUI_BACKGROUND_COLOR = { r: 13, g: 13, b: 53, a: 1 };

const CELL_SIZE_REDUCTION = 1;

const PIECE_PROJECTION_ALPHA = 0.1;

const GUI_GAME_INFO_CLASSES = '.tablero, .text_info_rect:not(#debug_info_rect)';

const GUI_GAME_MENUS_IDS = ['#edit_rect', '#pause_rect', '#game_over_rect']; // Array de los ids html de cada menú del juego A EXCEPCIÓN DEL MENÚ PRINCIPAL

const DEFAULT_NEW_PIECE = {
    "name": '',
    "color": ['0', '0', '255'],
    "shape": [
        ['X', 'X'],
        ['X', 'X']
    ],
    "weight": '10'
};


const DEBUG_MODE = false; //Activate debug mode

// Debug Constants
const DEBUG_INSPECTED_CELL_COLOR = { r: 255, g: 255, b: 255, a: 1 };
const DEBUG_RED_CROSS_COLOR = { r: 255, g: 0, b: 0, a: 1 };
const DEBUG_DRAW_WAIT = 100;


let game_board;
let double_click;
let timeout;
let game_paused;
let game_started;

function init() {
    const start_buttons = document.getElementsByClassName('start_button');
    const edit_buttons = document.getElementsByClassName('edit_button');
    const restart_buttons = document.getElementsByClassName('restart_button');
    const pause_buttons = document.getElementsByClassName('pause_button');
    const exit_buttons = document.getElementsByClassName('exit_button');

    const add_piece_button = document.getElementsByClassName('add_piece_button');
    add_piece_button.item(0).addEventListener("click", addPiece);

    const resume_button = document.getElementById('resume_button');
    resume_button.addEventListener("click", resumeGame);

    const version_span = document.getElementById('version_span');

    version_span.textContent = `Version: ${GAME_VERSION}`;

    if (DEBUG_MODE)
        version_span.textContent += '_debug';

    for (const start_button of start_buttons) {
        start_button.addEventListener("click", startGame);
    }

    for (const edit_button of edit_buttons) {
        edit_button.addEventListener("click", openEditMenu);
    }

    for (const restart_button of restart_buttons) {
        restart_button.addEventListener("click", (e) => {
            document.getElementById('game_over_rect').style.visibility = 'hidden';
            startGame(e);
        });
    }

    for (const pause_button of pause_buttons) {
        pause_button.addEventListener("click", pauseGame);
    }

    for (const exit_button of exit_buttons) {
        exit_button.addEventListener("click", goToMainMenu);
    }

    const close_game_button = document.getElementById('close_game_button');
    close_game_button.addEventListener("click", setNullGame);

    document.addEventListener('keydown', (e) => {
        if (game_board) {
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
            else if (e.key == 'Escape') {
                if (game_paused && game_started)
                    resumeGame();
                else if (game_started)
                    pauseGame();
            }
        }
    });
}

function setNullGame() {
    game_board = null; // Nos aseguramos de que aquí no hay ningún juego creado
    const canvas = document.getElementById('canvas')
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    //document.getElementById('main_canvas_div').innerHTML = ''; // Vaciamos el canvas del tablero para que no haya múltiples tableros dibujados
}

function startGame(e) {
    setNullGame();

    const button = e.target;
    const gui_elements = document.querySelectorAll(GUI_GAME_INFO_CLASSES);
    const canvas = document.getElementById('canvas');

    canvas.width = 500;
    canvas.height = 900;

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

    if (DEBUG_MODE) {
        debug_manager = game_board.setDebugManager();
        points_manager.loadDebugText(showAndGetDebugGUI());
    }

    game_board.loadPieces();

    hideMainMenu();
    document.getElementById('game_board_container').style.visibility = 'visible';
    game_board.startGame();

    game_started = true;
    game_paused = false;

}

function pauseGame() {
    if (game_board) { // Si se presiona el teclado se hace dos veces esta comprobación
        game_board.pauseGame();
        document.querySelector('#pause_rect').style.visibility = 'visible';
        game_paused = true;
    }
}

function resumeGame() {
    if (game_board) {
        game_board.resumeGame();
        document.querySelector('#pause_rect').style.visibility = 'hidden';
        game_paused = false;
    }
}

function getPointsGUI() {
    const lines = document.querySelector('.text_info_rect > [name="lines"]');
    const level = document.querySelector('.text_info_rect > [name="level"]');
    const points = document.querySelector('.text_info_rect > [name="points"]');

    return new GameTextGUI(points, level, lines);
}

function showAndGetDebugGUI() {
    const debug_labels = {};
    const debug_gui = document.querySelectorAll('#debug_info_rect');

    for (let i = 0; i < debug_gui.length; i++) { // Forma vaga de mostrar el cuadro de texto debug
        debug_gui.item(i).style.display = 'flex';
        debug_gui.item(i).style.backgroundColor = RGBColor.buildRGB(RGBColor.createColorObject(GUI_BACKGROUND_COLOR.r, GUI_BACKGROUND_COLOR.g, GUI_BACKGROUND_COLOR.b));
    }

    debug_labels.fall_speed = document.querySelector('.text_info_rect > [name="debug_fall_speed"]');
    debug_labels.points_in_level = document.querySelector('.text_info_rect > [name="debug_points_in_level"]');

    return debug_labels;
}

function addEditPieceEntry(id, piece) {
    const pieces_div = document.querySelector(".options_rect .container #available_pieces");

    const div = document.createElement('div');

    div.className = 'edit_piece_entry';
    div.id = `${id}`;

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

function openEditMenu() {
    if (Piece.parsed_pieces.length == 0) {
        loadAvailablePieces();
    }

    document.querySelector("#edit_rect").style.visibility = 'visible';
    hideMainMenu();
}

function loadAvailablePieces() {
    const pieces_array = Piece.loadHardCodedPieces(0);

    for (let i = 0; i < pieces_array.length; i++) {
        addEditPieceEntry(i, pieces_array[i]);
    }
}

function reloadAvailablePieces(){
    document.querySelector('.container #available_pieces').replaceChildren();

    loadAvailablePieces();
}

function editPiece(e) {
    const index = Number(this.id);
    const editor_div = document.querySelector('#edit_rect .container .editor');

    editor_div.replaceChildren();
    editor_div.id = index;

    let piece;
    if (Piece.parsed_pieces.length > index) {
        piece = Piece.parsed_pieces[index];
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
    createField('color', RGBColor.RGBColortoHex(piece.color), 'Color:', edit_fieldset, 'color');
    //createField('rotatable', piece.rotatable, 'Rotatable:', edit_fieldset, 'checkbox');

    const buttons_div = document.createElement('div');

    buttons_div.className = 'buttons_div';

    const save_button = document.createElement('button');
    save_button.textContent = 'Save';
    save_button.type = 'button';
    save_button.addEventListener("click", savePiece);

    const delete_button = document.createElement('button');
    delete_button.textContent = 'Delete piece';
    delete_button.type = 'button';
    delete_button.addEventListener("click", deletePiece);

    buttons_div.appendChild(save_button);
    buttons_div.appendChild(delete_button);

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
    if (type != 'checkbox' && type != 'radio')
        field_input.value = (input_value || '');
    else
        field_input.checked = (input_value || false);
    field_input.type = type;

    field_div.appendChild(field_label);
    field_div.appendChild(field_input);

    fieldset.appendChild(field_div);
}

function processEditPieceClick(e) {

    //setTimeout({}, 500);

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

    const parsed_color = RGBColor.hexToRGBColor(pieceData.color);
    const piece = { name: pieceData.name, weight: pieceData.weight, color: [parsed_color.r, parsed_color.g, parsed_color.b], shape: piece_shape }; //TODO: cambiar el color


    try { //TODO: Comprobar que la pieza es un grafo Hamiltoniano (No tiene partes separadas)
        if (Piece.possible_pieces.length > index) {
            updatePieceInVisualizers(index, piece_shape, piece.name, piece.weight, parsed_color);
            Piece.possible_pieces[index] = piece;
        }
        else {
            parsePieceShape(piece_shape); //TODO cambiar en el futuro??
            Piece.possible_pieces.push(piece);
            updatePieceInVisualizers(index, piece_shape, piece.name, piece.weight, parsed_color);
        }
    }
    catch (e) {
        console.log(e.message);
    }
}

function deletePiece() {
    if (confirm("Are you sure you want to delete this piece?")) {
        const editor_div = document.querySelector('#edit_rect .container .editor');
        const index = Number(editor_div.id);

        Piece.possible_pieces.splice(index, 1);
        Piece.parsed_pieces.splice(index, 1);

        editor_div.replaceChildren();
        reloadAvailablePieces();
    }
}

function updatePieceInVisualizers(index, piece_shape, name, weight, color) {
    const piece_entry_visualizer = document.querySelector(`.edit_piece_entry[id='${index}'] canvas`).piece_visualizer;
    const edit_piece_visualizer = document.querySelector('.edit_piece_visualizer canvas').piece_visualizer;

    const { blocks, center, rotatable } = parsePieceShape(piece_shape);
    const piece = new Piece(name, color, blocks, center, rotatable, weight);

    piece_entry_visualizer.drawPiece(piece);
    edit_piece_visualizer.drawPiece(piece);

    Piece.parsed_pieces[index] = piece;
}

function parsePieceShape(piece_shape) {
    const { blocks, center, rotatable } = Piece.parseShape(piece_shape, 0);

    if (blocks != null) {
        return { blocks, center, rotatable };
    }
    else
        throw Error('Invalid piece shape');
}

function goToMainMenu() {
    document.querySelector("#other_container").style.display = 'none';
    document.querySelector("#main_menu_container").style.display = 'flex';

    // Para asegurarnos de que ningún menú se queda abierto en el juego los cerramos todos, menos el menú principal
    for (const menu_id of GUI_GAME_MENUS_IDS) {
        document.querySelector(menu_id).style.visibility = 'hidden';
    }

    document.querySelector(".editor").innerHTML = '';

    // Quitamos el tablero de la pantalla para que no aparezca detrás de algún menú fuera del juego
    document.getElementById('game_board_container').style.visibility = 'hidden';


}

function hideMainMenu() {
    document.querySelector("#main_menu_container").style.display = 'none';
    document.querySelector("#other_container").style.display = 'flex';
}

function addPiece() {
    const new_name = `Default piece ${Piece.parsed_pieces.length}`;
    const new_piece = { name: new_name, color: DEFAULT_NEW_PIECE.color, shape: DEFAULT_NEW_PIECE.shape, weight: DEFAULT_NEW_PIECE.weight }
    const piece_obj = Piece.loadPieceJSON(new_piece);

    Piece.parsed_pieces.push(piece_obj);

    addEditPieceEntry(Piece.parsed_pieces.length - 1, piece_obj);
}