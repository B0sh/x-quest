import { Char } from "./char";

export const enum TileType {
    Floor,
    Box,
    Corpse,
    UpStair,
    DownStair
}

export class Tile {
    static readonly floor = new Tile(TileType.Floor, true, new Char("."));
    static readonly wall = new Tile(TileType.Box, false, new Char("#", "#654321"));
    static readonly corpse = new Tile(TileType.Corpse, false, new Char("O"));
    static readonly upStair = new Tile(TileType.UpStair, true, new Char(">", "#0000FF", "#444"));
    static readonly downStair = new Tile(TileType.DownStair, true, new Char("<", "#008000", "#444"));

    constructor(
        public readonly type: TileType,
        public readonly walkable: boolean,
        public readonly char: Char,
    ) { }
}