export default class Utility {
    static sleep(milliseconds: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    static setCharAt(str, index, chr) {
        if (index > str.length - 1 || index < 0) return str;
        return str.substr(0, index) + chr + str.substr(index + 1);
    }
    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static replaceAll(find, replace, str) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
    static contains(x, min, max) {
        return x >= min && x <= max;
    }

    static format(x: number, digits: number = 0) {
        return Number(x).toLocaleString('en-US', {
            minimumFractionDigits: digits
        });
    }

    static isiPad() {
        return navigator.userAgent.match(/iPad/i) != null;
    }
}
