export type SFXFile = 'drop.mp3'|'ding_soft.mp3'|'ding_bad.wav'|'death_bell.wav'|'scan.mp3'|'squish_pop.mp3'|'squish_suck.mp3'|'baby_squeak.wav'|'mhmm.mp3';
export type SFX = 'drop'|'happiness'|'unhappiness'|'love'|'hate'|'death'|'scan'|'wash_in'|'wash_out'|'squeak'|'mhmm';

const SFXToFile: {[sfx in SFX]: SFXFile} = {
    drop: "drop.mp3",
    love: "ding_soft.mp3",
    happiness: "ding_soft.mp3",
    unhappiness: "ding_bad.wav",
    hate: "ding_bad.wav",
    death: "death_bell.wav",
    scan: 'scan.mp3',
    wash_in: 'squish_pop.mp3',
    wash_out: 'squish_suck.mp3',
    squeak: 'baby_squeak.wav',
    mhmm: 'mhmm.mp3',
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
            aud.volume = this.volume;
            aud.play();
            this.buffer.push(aud);
        }
    }
}
export class WorldSound{
    private lib: SFXMap = {
        'drop': new SoundBuffer(SFXToFile['drop'], 0.2),
        'love': new SoundBuffer(SFXToFile['happiness']),
        'happiness': new SoundBuffer(SFXToFile['happiness']),
        'unhappiness': new SoundBuffer(SFXToFile['unhappiness']),
        'hate': new SoundBuffer(SFXToFile['unhappiness']),
        'death': new SoundBuffer(SFXToFile['death']),
        'scan': new SoundBuffer(SFXToFile['scan'], 0.3),
        'wash_in': new SoundBuffer(SFXToFile['wash_in']),
        'wash_out': new SoundBuffer(SFXToFile['wash_out']),
        'squeak': new SoundBuffer(SFXToFile['squeak'], 0.3),
        'mhmm': new SoundBuffer(SFXToFile['mhmm'], 0.5),
    }

    public play(sfx: SFX){
        this.lib[sfx].play();
    }
}