export class Point {
    constructor(
        public x: number,
        public y: number
    ) {}

    equals(point: Point): boolean {
        return this.x == point.x && this.y == point.y;
    }

    toString(): string {
        return this.x + "," + this.y;
    }
}