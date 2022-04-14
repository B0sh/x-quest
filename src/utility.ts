export default class Utility {
    static sleep(milliseconds: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    static padStart(num: number | string, size: number, padding: string = '0') {
        let str: string = (num ?? "").toString();
        while (str.length < size) {
            str = padding + str;
        }
        return str;
    }

    static padEnd(num: number | string, size: number, padding: string = '0') {
        let str: string = (num ?? "").toString();
        while (str.length < size) {
            str += padding;
        }
        return str;
    }

    static setCharAt(str, index, chr) {
        if (index > str.length - 1 || index < 0) return str;
        return str.substr(0, index) + chr + str.substr(index + 1);
    }

    static getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static replaceAll(find: string, replace: string, str: string) {
        return str?.replace(new RegExp(find, 'g'), replace);
    }

    static contains(x, min, max) {
        return x >= min && x <= max;
    }

    static format(x: number, digits: number = 0): string {
        return Number(x).toLocaleString('en-US', {
            minimumFractionDigits: digits
        });
    }

    static isiPad() {
        return navigator.userAgent.match(/iPad/i) != null;
    }
}
