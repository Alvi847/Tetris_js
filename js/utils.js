class Utils{
    static wait(ms) {
        return new Promise(res => setTimeout(res, ms));
    }
}