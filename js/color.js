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
}