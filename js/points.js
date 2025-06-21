class Points{
    #points;
    #level;
    #lines;

    constructor(points, level, lines){
        this.#points = points;
        this.#lines = lines;
        this.#level = level; 
    }

    updateLinesCounter(lines){
        this.#lines.textContent = `Lines ${lines}`;
    }
}