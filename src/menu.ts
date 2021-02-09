import { XQuest } from "./game";
import { SFX } from "./sfx";

export class Menu {
    constructor(
        private game: XQuest
    ) { }
    
    enterMenu() {
        console.log("ENTER");
        SFX.Menu.play();
    }

    leaveMenu() {
        SFX.Menu.stop();
    }
}