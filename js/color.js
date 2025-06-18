class RGBColor {

    r;

    g;

    b;

    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    static buildRGB(color){
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    static addRGB(...args){
        return args.reduce((accum, current_value) => ({
            r: Number(accum.r) + Number(current_value.r),
            g: Number(accum.g) + Number(current_value.g),
            b: Number(accum.b) + Number(current_value.b)
        }), { r: 0, g: 0 , b: 0});
    }

    static createColorObject(r, g, b){
        if(Number.isInteger(r) && Number.isInteger(g) && Number.isInteger(b)){
            if(r < 256 && r >= 0, g < 256 && g >= 0, b < 256 && b >= 0){
                return new RGBColor(r, g, b);
            }
            else
                throw Error(`Invalid color format, values must be between 0 and 255 (${r}, ${g}, ${b})`);
        }
        else
            throw Error(`Invalid color format, values must be integer numbers (${r}, ${g}, ${b})`);
    }

    static correctValues(color){
        if(color.r < 0)
            color.r = 0
        else if(color.r > 255)
            color.r = 255;
    
        if(color.g < 0)
            color.g = 0
        else if(color.g > 255)
            color.g = 255;

        if(color.b < 0)
            color.b = 0
        else if(color.b > 255)
            color.b = 255;

        return new RGBColor(color.r, color.g, color.b);
    }
}