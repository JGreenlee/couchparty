export function getRandFrom(arr: string[], howMany: number): string[] {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, howMany);
}

export function generateRoomCode(activeGames : string[]) {

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
    // res = "TEST" // TODO remove this line if not testing
    return res;
}