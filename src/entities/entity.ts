import { BoundingBox } from "../models/bounding-box";

export const enum EntityType {
    Player,
    Spaceship,
    Carrier,
    Bullet,
    Debug,
    PelletText
}

export interface Entity {
    position: BoundingBox;
    type: EntityType;

    update(): void;
    draw(): void;
    unload(): void;
}

export interface ColliderEntity extends Entity {
    collide(entity: Entity): void;
}