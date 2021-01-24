import { Point } from "./point";
import { Char } from "./char";

export const enum EntityType {
    Player,
    Enemy,

    Projectile
}

export interface Entity {
    position: Point;
    char: Char;
    type: EntityType;

    act(): Promise<any>;
}