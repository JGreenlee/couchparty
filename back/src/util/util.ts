import * as crypto from 'crypto';

export function getRandFrom(arr: string[], howMany: number): string[] {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, howMany);
}

export function generateRoomCode(activeGames: string[]) {

    // generate 4-letter code, no vowels or K or Y
    const list = "BCDFGHJLMNPQRSTVWXZ";
    let res = "";
    for (let i = 0; i < 4; i++) {
        let rnd = Math.floor(Math.random() * list.length);
        res = res + list.charAt(rnd);
    }

    if (activeGames.includes(res)) {  // already taken
        return generateRoomCode(activeGames); // try again
    }
    if (process.env['NODE_ENV'] !== 'production') {
        // res = "TEST";
    }
    return res;
}

export function generateUid() {
    return crypto.randomUUID();
}

// must be UUID format, ex: a24a6ea4-ce75-4665-a070-57453082c256
export function isValidUid(uid: string) {
    const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    return regexExp.test(uid)
}