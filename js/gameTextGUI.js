class GameTextGUI{
    #points_label;
    #level_label;
    #lines_label;

    #fall_speed_label;
    #points_in_level_label;

    constructor(points_label, level_label, lines_label){
        this.#points_label = points_label;
        this.#lines_label = lines_label;
        this.#level_label = level_label; 
    }

    updateLinesCounter(lines){
        this.#lines_label.textContent = `Lines: ${lines}`;
    }

    updateLevelCounter(level){
        this.#level_label.textContent = `Level: ${level}`;
    }

    updatePointsCounter(points){
        this.#points_label.textContent = `Points: ${points}`;
    }
    
    updateGUICounters(lines, points, level){
        this.updateLinesCounter(lines);
        this.updatePointsCounter(points);
        this.updateLevelCounter(level);
    }

    loadDebugText(debug_labels){    
        this.#fall_speed_label = debug_labels.fall_speed;
        this.#points_in_level_label = debug_labels.points_in_level;
    }

    debugUpdateFallSpeedCounter(speed){
        this.#fall_speed_label.textContent = `Fall speed: ${speed}`;
    }

    debugUpdatePointsInLevelCounter(points){
        this.#points_in_level_label.textContent = `Points in level: ${points}`;
    }
    
    debugUpdateCounters(fall_speed, points_in_level){
        this.debugUpdateFallSpeedCounter(fall_speed);
        this.debugUpdatePointsInLevelCounter(points_in_level);
    }
}