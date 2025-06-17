; document.addEventListener("DOMContentLoaded", init);

const DELTA_TIME = 500;
const COLUMNS = 11;
const MAX_PIECE_WIDTH = 5;
const MAX_PIECE_HEIGHT = 5;

const GUI_ELEMENTS_CLASSES = '.tablero, .text-info-rect';

let game_board;

function init() {
    const start_button = document.getElementById('start_button');
    const restart_button = document.getElementById('restart_button');

    start_button.addEventListener("click", startGame);
    restart_button.addEventListener("click", startGame);

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
    const gui_elements = document.querySelectorAll(GUI_ELEMENTS_CLASSES); 
    const canvas = document.getElementById('canvas');
    const div = document.querySelector('div.tablero');

    canvas.width = 500;
    canvas.height = 900;

    button.parentNode.style.display = 'none';

    const next_piece_canvas = document.getElementById('next-piece-canvas');

    next_piece_canvas.width = 150;
    next_piece_canvas.height = 150;

    for(let i = 0; i < gui_elements.length; i++){
        gui_elements.item(i).style.display = 'flex';
    }

    const npv = NextPieceVisualizer.createNextPieceVisualizer(next_piece_canvas);

    game_board = GameBoard.createBoard(canvas, npv);

    game_board.loadPieces();

    game_board.setTimers();

}