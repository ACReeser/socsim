import { BuildingTypes } from "../simulation/Geography";
import { Trait } from "../World";

export const keyToName: { [key in Trait | BuildingTypes]: string } = {
    state: 'Collectivist', ego: 'Independent',
    trad: 'Elitist', prog: 'Progressive',
    circle: 'Brunette', square: 'Blonde', triangle: 'Redhead',
    rocket: 'Futuristic', dragon: 'Mythical', music: 'Dramatic', noFaith: 'Nihilistic',
    starving: 'Starving', hungry: 'Hungry', sated: 'Sated', stuffed: 'Stuffed',
    homeless: 'Homeless', sleepy: 'Sleepy', awake: 'Awake', rested: 'Rested',
    sick: 'Sick', sickly: 'Sickly', bruised: 'Bruised', fresh: 'Robust',
    sane: 'Sane', stressed: 'Confused', disturbed: 'Disturbed', 'psychotic': 'Psychotic',
    housed: 'Housed', 
    graveyard: 'Graveyard',
    house: 'House', hospital: 'Hospital', farm: 'Farm', theater: 'Theater', church: 'Church', jail: 'Jail', park: 'Park', nature: 'Elysian Scenery'
  };