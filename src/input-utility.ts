import Utility from "./utility";

export class InputUtility {
    private static processInputCallback: (event: KeyboardEvent) => any;
    private static resolve: (value?: any) => void;
    static heldKeys: any = {};

    constructor() {}

    static initListeners(handleInput: (event: KeyboardEvent) => boolean) {
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            // if you are active on a text area, don't process game characters.
            if (document.activeElement.nodeName == 'TEXTAREA' || document.activeElement.nodeName == 'INPUT')
                return true;

            if (this.heldKeys[event.code] == null || Utility.isiPad()) {
                this.heldKeys[event.code] = true;
                handleInput(event);
            }
        });

        window.addEventListener('keyup', (event: KeyboardEvent) => {
            this.heldKeys[event.code] = null;
        });
    }

    static removeListeners() {
        // window.removeEventListener('keyup');
        // window.removeEventListener('keydown');
    }

    static waitForInput(handleInput: (event: KeyboardEvent) => boolean): Promise<any> {
        return new Promise(resolve => {
            if (InputUtility.processInputCallback !== undefined) {
                InputUtility.stopProcessing();
            }

            InputUtility.resolve = resolve;
            InputUtility.processInputCallback = (event: KeyboardEvent) => InputUtility.processInput(event, handleInput);
            window.addEventListener("keydown", InputUtility.processInputCallback);
        });
    }

    private static processInput(event: KeyboardEvent, handleInput: (event: KeyboardEvent) => boolean): void {
        if (handleInput(event)) {
            InputUtility.stopProcessing();
        }
    }

    private static stopProcessing(): void {
        window.removeEventListener("keydown", InputUtility.processInputCallback);
        InputUtility.processInputCallback = undefined;
        InputUtility.resolve();
    }
}


