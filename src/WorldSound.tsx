export type SFXFile = 'drop.mp3'|'ding_soft.mp3'|'ding_bad.wav';
export type SFX = 'drop'|'happiness'|'unhappiness';

const SFXToFile: {[sfx in SFX]: SFXFile} = {
    drop: "drop.mp3",
    happiness: "ding_soft.mp3",
    unhappiness: "ding_bad.wav"
};

type SFXMap = {[sfx in SFX]: SoundBuffer};

class SoundBuffer{
    constructor(private file: SFXFile, private volume: number = 1){}

    private buffer: HTMLAudioElement[] = [];
    play(){
        if (this.buffer.length > 0 && this.buffer[0].ended){
            const audio = this.buffer.shift();
            audio?.play();
            if (audio)
                this.buffer.push(audio);
        } else {
            const aud = new Audio(process.env.PUBLIC_URL+'/'+this.file);
            aud.play();
            this.buffer.push(aud);
        }
    }
}
export class WorldSound{
    private lib: SFXMap = {
        'unhappiness': new SoundBuffer(SFXToFile['unhappiness']),
        'happiness': new SoundBuffer(SFXToFile['happiness']),
        'drop': new SoundBuffer(SFXToFile['drop'], 0.2),
    }

    public play(sfx: SFX){
        this.lib[sfx].play();
    }
}