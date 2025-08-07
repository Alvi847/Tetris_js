class Level {

    level;
    fall_speed;
    points_in_level;

    static LEVEL_0 = { // Nivel 0, define los valores por defecto
        "points_per_line": 10,
        "speed_increase": 1,
        "combo_points": 5
    }


    /**
     * JSON que almacena los niveles del juego
     * 
     * El valor max_level debe ser el número del nivel más alto
     * 
     * levels es un array de ojetos que representan un nivel distinto cada uno
     * Un ejemplo de nivel:
     * 
     *  // Nivel 1
     *      {
     *          "points": 100, // Puntos con respecto al nivel anterior, se asume que el nivel 1 está en 0 puntos
     *          "speed_increase": 1, // El número por el que se multiplica la velocidad con respecto al nivel anterior, 1 si no se quieren cambios en la velocidad
     *          "points_per_line": 10, // Puntos que vale cada línea en este nivel. No es obligatorio que esté, ya que por defecto son 10
     *          "combo_points": 5 // Cuando se hacen varias líneas a la vez, son los puntos extra que da cada línea hecha después de la primera
     *      },
     */
    static LEVEL_TABLE = {
        "max_level": 20, // El número del último nivel
        "levels": [
            { points: 0, speed_increase: 1, points_per_line: 10 },  // Nivel 1
            { points: 100, speed_increase: 1.05, points_per_line: 10 },  // Nivel 2
            { points: 100, speed_increase: 1.05, points_per_line: 10 },  // Nivel 3
            { points: 100, speed_increase: 1.05, points_per_line: 10 },  // Nivel 4
            { points: 100, speed_increase: 1.05, points_per_line: 10 },  // Nivel 5
            { points: 100, speed_increase: 1.05, points_per_line: 10 },  // Nivel 6
            { points: 150, speed_increase: 1.1, points_per_line: 12, combo_points: 10 },  // Nivel 7
            { points: 150, speed_increase: 1.1, points_per_line: 12, combo_points: 10 },  // Nivel 8
            { points: 150, speed_increase: 1.1, points_per_line: 12, combo_points: 10 },  // Nivel 9
            { points: 150, speed_increase: 1.1, points_per_line: 12, combo_points: 10 },  // Nivel 10
            { points: 150, speed_increase: 1.1, points_per_line: 12, combo_points: 10 },  // Nivel 11
            { points: 150, speed_increase: 1.1, points_per_line: 12, combo_points: 10 },  // Nivel 12
            { points: 200, speed_increase: 1.15, points_per_line: 15, combo_points: 20 },  // Nivel 13
            { points: 200, speed_increase: 1.15, points_per_line: 15, combo_points: 20 },  // Nivel 14
            { points: 200, speed_increase: 1.15, points_per_line: 15, combo_points: 25 },  // Nivel 15
            { points: 200, speed_increase: 1.15, points_per_line: 15, combo_points: 25 },  // Nivel 16
            { points: 200, speed_increase: 1.15, points_per_line: 15, combo_points: 25 },  // Nivel 17
            { points: 300, speed_increase: 1.2, points_per_line: 20, combo_points: 35 },  // Nivel 18
            { points: 300, speed_increase: 1.2, points_per_line: 20, combo_points: 35 },  // Nivel 19
            { points: 300, speed_increase: 1.2, points_per_line: 25, combo_points: 40 }   // Nivel 20
        ]
    }

    static pointsPerLine(level) {
        if (level > 0 && level <= Level.LEVEL_TABLE.max_level) {
            return (Level.LEVEL_TABLE.levels[level - 1].points_per_line || Level.LEVEL_0.points_per_line);
        }
        else if (level === 0)
            return Level.LEVEL_0.points_per_line;
        else
            throw new Error(`Non existent level (${level})`);
    }

    static comboPoints(level){
        if (level > 0 && level <= Level.LEVEL_TABLE.max_level) {
            return (Level.LEVEL_TABLE.levels[level - 1].combo_points || Level.LEVEL_0.combo_points);
        }
        else if (level === 0)
            return Level.LEVEL_0.combo_points;
        else
            throw new Error(`Non existent level (${level})`);
    }

    /**
     * Devuelve el siguiente nivel y la velocidad de caída según los puntos obtenidos a partir del nivel actual
     * @param {int} current_level 
     * @param {int} current_fall_speed 
     * @param {int} level_points_obtained 
     * @returns {Level} Un objeto con el nuevo nivel y su velocidad de caída correspondiente
     */
    static changeLevel(current_level, current_fall_speed, level_points_obtained) {
        if (current_level < Level.LEVEL_TABLE.max_level) {
            let i = current_level;
            let new_level = current_level;
            let new_speed = current_fall_speed;
            let points = level_points_obtained;
            let overkill_points = 0; // Puntos que el jugador ha obtenido por encima del requisito para subir de nivel

            while (points > 0 && i < Level.LEVEL_TABLE.max_level) {
                points -= Level.LEVEL_TABLE.levels[i].points;
                if (points >= 0) {
                    new_level++;
                    new_speed = Math.floor(new_speed / Level.LEVEL_TABLE.levels[i].speed_increase);
                    overkill_points = points;
                    i++;
                }
            }

            return new Level(new_level, new_speed, overkill_points);
        }
        else if (current_level > Level.LEVEL_TABLE.max_level)
            return new Error(`Non existent level (${current_level})`);
        else
            return new Level(current_level, current_fall_speed);
    }

    constructor(level, speed, points) {
        this.level = level;
        this.fall_speed = speed;
        this.points_in_level = points;
    }
}