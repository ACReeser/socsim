export class WorldSound{
    public ding = {
        'drop': new Audio(process.env.PUBLIC_URL+"/drop.mp3"),
        'happiness': new Audio(process.env.PUBLIC_URL+"/ding_soft.mp3"),
        'unhappiness': new Audio(process.env.PUBLIC_URL+'/ding_bad.wav') 
    }
}