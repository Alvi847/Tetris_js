; document.addEventListener("DOMContentLoaded", init);

const DELTA_TIME = 500;
const COLUMNS = 10;

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
    const canvas = document.getElementById('canvas');
    const div = document.querySelector('div.tablero');

    canvas.width = 300;
    canvas.height = 300;

    button.parentNode.style.display = 'none';


    game_board = GameBoard.createBoard(canvas);

    game_board.loadPieces();

    game_board.setTimers();

}