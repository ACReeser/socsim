
export function shuffle<T>(array: Array<T>) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

export function MathClamp(input: number, min: number, max: number): number{
    return Math.max(Math.min(input, max), min)
}

export function groupBy<T>(list: T[], keyGetter: (val: T) => string|number): Map<string|number, T[]> {
    const map = new Map<string|number, T[]>();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}