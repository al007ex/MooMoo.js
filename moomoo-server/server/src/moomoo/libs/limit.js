
export class ConnectionLimit {

    constructor(max) {
        this.max = max;
    }

    connections = new Map;

    up(addr) {

        if (this.connections.has(addr)) {
            this.connections.set(addr, this.connections.get(addr) + 1);
            return;
        }

        this.connections.set(addr, 1);

    }

    down(addr) {

        if (!this.connections.has(addr)) return;

        const count = this.connections.get(addr) - 1;

        if (count <= 0) {
            this.connections.delete(addr);
            return;
        }

        this.connections.set(addr, count);

    }

    check(addr) {

        return (this.connections.get(addr) ?? 0) >= this.max;

    }

}