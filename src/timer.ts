export class Timer {
    private timeout: number;
    private expected: number;
    private running: boolean = false;

    constructor(
        public onTick: Function,
        public interval: number
    ) {

    }

    start(): void {
        if (!this.running) {
            this.running = true;
            this.expected = performance.now() + this.interval;
            this.timeout = setTimeout(this.step.bind(this), this.interval);
        }
    }

    stop(): void {
        this.running = false;
        clearTimeout(this.timeout);
    }

    step(): void {
        const drift = performance.now() - this.expected;
        // if (drift > this.interval) {
             // You could have some default stuff here too...
        //     if (errorFunc) errorFunc();
        // }
        this.onTick();
        this.expected += this.interval;

        if (this.running) {
            this.timeout = setTimeout(this.step.bind(this), Math.max(0, this.interval - drift));
        }
    }
}