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
        if (this.running) {
            const drift = performance.now() - this.expected;
            this.expected += this.interval;

            this.onTick();
            this.timeout = setTimeout(this.step.bind(this), Math.max(0, this.interval - drift));
        }
    }
}