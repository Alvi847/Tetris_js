class Level{

    level;
    fall_speed;
    points_in_level;

    static LEVEL_0 = { // Nivel 0, define los valores por defecto
        "points_per_line": 10,
        "speed_increase": 1
    }

    static LEVEL_TABLE = {
        "max_level": 4, // El número del último nivel
        "levels": [
            // Nivel 1
            {
                "points": 10, // Puntos con respecto al nivel anterior, se asume que el nivel 1 está en 0 puntos
                "speed_increase": 1.2, // El número por el que se multiplica la velocidad con respecto al nivel anterior, 1 si no se quieren cambios en la velocidad
                "points_per_line": 40, // Puntos que vale cada línea en este nivel. No es obligatorio que esté, ya que por defecto son 10
            },
            // Nivel 2
            {
                "points": 10,
                "speed_increase": 1, 
            },
            // Nivel 3
            {
                "points": 50, 
                "speed_increase": 2, 
            },
            // Nivel 4
            {
                "points": 50, 
                "speed_increase": 1.5, 
            },
        ]
    }

    static pointsPerLine(level){
        if(level > 0 && level <= Level.LEVEL_TABLE.max_level){
            return (Level.LEVEL_TABLE.levels[level - 1].points_per_line || Level.LEVEL_0.points_per_line);
        }
        else if (level === 0)
            return Level.LEVEL_0.points_per_line;
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
    static changeLevel(current_level, current_fall_speed, level_points_obtained){
        if(current_level < Level.LEVEL_TABLE.max_level){
            let i = current_level;
            let new_level = current_level;
            let new_speed = current_fall_speed;
            let points = level_points_obtained;
            let overkill_points = 0; // Puntos que el jugador ha obtenido por encima del requisito para subir de nivel

            while(points > 0 && i < Level.LEVEL_TABLE.max_level){
                points -= Level.LEVEL_TABLE.levels[i].points;
                if(points >= 0){
                    new_level++;
                    new_speed /= Math.round(Level.LEVEL_TABLE.levels[i].speed_increase);
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

    constructor(level, speed, points){
        this.level = level;
        this.fall_speed = speed;
        this.points_in_level = points;
    }
}