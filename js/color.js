class RGBColor {

    r;

    g;

    b;

    a;

    constructor(r, g, b, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static buildRGB(color){
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    }

    static addRGB(...args){
        return args.reduce((accum, current_value) => ({
            r: Number(accum.r) + Number(current_value.r),
            g: Number(accum.g) + Number(current_value.g),
            b: Number(accum.b) + Number(current_value.b)
        }), { r: 0, g: 0 , b: 0});
    }

    static addRGBA(a, ...args){
        const rgb_sum = RGBColor.addRGB(...args);
        return {r: rgb_sum.r, g: rgb_sum.g, b: rgb_sum.b, a: a};
    }

    static createColorObject(r, g, b, a = 1){
        if(Number.isInteger(r) && Number.isInteger(g) && Number.isInteger(b) && Number.isFinite(a)){
            if(r < 256 && r >= 0, g < 256 && g >= 0, b < 256 && b >= 0 && a >= 0 && a <= 1){
                return new RGBColor(r, g, b, a);
            }
            else
                throw Error(`Invalid color format, RGB values must be between 0 and 255 with an alpha channel between 0 and 1 (${r}, ${g}, ${b}, ${a})`);
        }
        else
            throw Error(`Invalid color format, RGB values must be integer numbers and alpha channel must be a decimal number (${r}, ${g}, ${b}, ${a})`);
    }

    static hexToRGBColor(hex){
        let r, g, b;

        r = Number("0x" + hex[1] + hex[2]);
        g = Number("0x" + hex[3] + hex[4]);
        b = Number("0x" + hex[5] + hex[6]);

        if(Number.isInteger(r) && Number.isInteger(g) && Number.isInteger(b))
            return RGBColor.correctValues({r: r, g: g, b: b})
        else
            throw Error(`Invalid color format, hex value must be between 0 and FFFFFF (${hex})`);
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

        if(color.a < 0)
            color.a = 0
        else if(color.a > 1)
            color.a = 1;

        return new RGBColor(color.r, color.g, color.b, color.a);
    }

    setAlpha(alpha){
        this.a = alpha; 
    }
}