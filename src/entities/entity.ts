import { Point } from "../point";

export const enum EntityType {
    Player,
    Spaceship,
    Carrier,
    Bullet,
    PelletText
}

export interface Entity {
    position: Point;
    type: EntityType;

    update(): void;
    draw(): void;
    unload(): void;
}