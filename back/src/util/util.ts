export function getRandFrom(arr: string[], howMany: number): string[] {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, howMany);
}


// TODO check if code is already taken
export function generateRoomCode() {
    const list = "BCDFGHJLMNPQRSTVWXZ"; // no vowels, nor Y or K
    let res = "";
    for (let i = 0; i < 4; i++) {
        let rnd = Math.floor(Math.random() * list.length);
        res = res + list.charAt(rnd);
    }
    res = "TEST" // TODO remove this line if not testing
    return res;
}