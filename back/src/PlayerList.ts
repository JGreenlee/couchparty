export class PlayerList<T> {

    names: string[];
    objs: T[];

    constructor() {
        this.names = [];
        this.objs = [];
    }

    add(n : string, p : T) {
        this.names.push(n);
        this.objs.push(p);
    }

    remove(index: number) {
        this.names.splice(index, 1);
        this.objs.splice(index, 1);
    }

    getByName(n: string): T | null {
        const i: number = this.names.indexOf(n);
        if (i >= 0) {
            return this.objs[i];
        } else {
            return null;
        }
    }

    removeByName(n: string) {
        const i: number = this.names.indexOf(n);
        this.names.splice(i, 1);
        this.objs.splice(i, 1);
    }
}
