class GameTextGUI{
    #points_label;
    #level_label;
    #lines_label;

    constructor(points_label, level_label, lines_label){
        this.#points_label = points_label;
        this.#lines_label = lines_label;
        this.#level_label = level_label; 
    }

    updateLinesCounter(lines){
        this.#lines_label.textContent = `Lines ${lines}`;
    }

    updateLevelCounter(level){
        this.#level_label.textContent = `Level ${level}`;
    }

    updatePointsCounter(points){
        this.#points_label.textContent = `Points ${points}`;
    }


    updateGUICounters(lines, points, level){
        this.updateLinesCounter(lines);
        this.updatePointsCounter(points);
        this.updateLevelCounter(level);
    }
}