export class BoundingBox {
    constructor(
        public x: number,
        public y: number,
        public width: number = 1,
        public height: number = 1
    ) {}

    equals(boundingBox: BoundingBox): boolean {
        return this.x == boundingBox.x && this.y == boundingBox.y;
    }

    toString(): string {
        return this.x + "," + this.y;
    }

    intersets(other: BoundingBox) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}