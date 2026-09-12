// js/deck.js

export const SUITS = ['A', 'B', 'C', 'D'];

export class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
        
        // VP rules as specified: 13 = 15 VP, 11 & 12 = 10 VP. 
        // We assume 1-10 = their face value based on screenshots.
        if (value === 13) this.vp = 15;
        else if (value === 12 || value === 11) this.vp = 10;
        else this.vp = value;
        
        this.id = `${suit}${value}`;
    }
}

export class Deck {
    constructor() {
        this.cards = [];
        this.build();
    }

    build() {
        this.cards = [];
        for (let suit of SUITS) {
            for (let v = 1; v <= 13; v++) {
                this.cards.push(new Card(suit, v));
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        return this.cards.pop();
    }
}

export const AICards = [
    {
        id: '01',
        name: "AI Card 01",
        image: "bot_cards/photo_2026-09-12_21-45-51.jpg",
        rules: {
            follow: { primary: 'low', secondary: null },
            unfollow: { primary: 'long', secondary: 'low' },
            lead: { primary: 'high', secondary: 'short' }
        }
    },
    {
        id: '02',
        name: "AI Card 02",
        image: "bot_cards/photo_2026-09-12_21-45-54.jpg",
        rules: {
            follow: { primary: 'low', secondary: null },
            unfollow: { primary: 'low', secondary: 'long' },
            lead: { primary: 'short', secondary: 'high' }
        }
    },
    {
        id: '03',
        name: "AI Card 03",
        image: "bot_cards/photo_2026-09-12_21-45-56.jpg",
        rules: {
            follow: { primary: 'low', secondary: null },
            unfollow: { primary: 'low', secondary: 'long' },
            lead: { primary: 'high', secondary: 'short' }
        }
    }
];
