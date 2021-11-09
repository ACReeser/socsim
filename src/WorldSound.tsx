export type SFXFile = 'drop.mp3'|'ding_soft.mp3'|'ding_bad.wav'|'death_bell.wav'|'digital_beeping.mp3'|'squish_pop.mp3'|'squish_suck.mp3'|'baby_squeak.wav'|'mhmm.mp3'|'cow-moo.wav'|'pill-shake.wav'|'door-open.wav'|'teleport.wav'|'cash_ding.mp3'|'crazy_laugh.mp3'|'handcuffs_ratchet.wav';
export type SFX = 'drop'|'happiness'|'unhappiness'|'love'|'hate'|'death'|'scan'|'wash_in'|'wash_out'|'squeak'|'mhmm'|'moo'|'door'|'pills'|'teleport'|'cash'|'crazy_laugh'|'handcuffs';

const SFXToFile: {[sfx in SFX]: SFXFile} = {
    drop: "drop.mp3",
    love: "ding_soft.mp3",
    happiness: "ding_soft.mp3",
    unhappiness: "ding_bad.wav",
    hate: "ding_bad.wav",
    death: "death_bell.wav",
    scan: 'digital_beeping.mp3',
    wash_in: 'squish_pop.mp3',
    wash_out: 'squish_suck.mp3',
    squeak: 'baby_squeak.wav',
    mhmm: 'mhmm.mp3',
    pills: 'pill-shake.wav',
    moo: 'cow-moo.wav',
    door: 'door-open.wav',
    teleport: 'teleport.wav',
    cash: 'cash_ding.mp3',
    crazy_laugh: 'crazy_laugh.mp3',
    handcuffs: 'handcuffs_ratchet.wav'
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
        'moo': new SoundBuffer(SFXToFile['moo'], 1),
        'pills': new SoundBuffer(SFXToFile['pills'], 1),
        'door': new SoundBuffer(SFXToFile['door'], 1),
        'teleport': new SoundBuffer(SFXToFile['teleport'], 0.6),
        'cash': new SoundBuffer(SFXToFile['cash'], 0.23),
        'crazy_laugh': new SoundBuffer(SFXToFile['crazy_laugh'], 0.5),
        'handcuffs': new SoundBuffer(SFXToFile['handcuffs'], 0.95),
    }

    public play(sfx: SFX){
        this.lib[sfx].play();
    }
}

export const WorldSfxInstance = new WorldSound();