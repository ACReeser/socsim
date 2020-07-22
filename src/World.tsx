import * as React from 'react';

export interface City {
    name: string;
}
export interface World {
    cities: City[];
    
}


export interface Tile {
    name?: string, 
    url: string, 
    type: string,
    key: number
}

export interface PoliticalEffect {
    key: 'state'|'ego'|'prog'|'trad', 
    mag: number;
}
export interface Policy {
    key: string; 
    fx: PoliticalEffect[];
    axis?: string;
}