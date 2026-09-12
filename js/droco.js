// js/droco.js
import { SUITS } from './deck.js';

export function getDrocoPlay(hand, ledSuit, aiCard) {
    let validCards = [];
    let situation = '';

    if (!ledSuit) {
        situation = 'lead';
        validCards = [...hand];
    } else {
        const matchingSuit = hand.filter(c => c.suit === ledSuit);
        if (matchingSuit.length > 0) {
            situation = 'follow';
            validCards = matchingSuit;
        } else {
            situation = 'unfollow';
            validCards = [...hand];
        }
    }

    const rules = aiCard.rules[situation];
    
    // Apply primary
    validCards = applyCriterion(validCards, rules.primary, hand);
    
    // Apply secondary if still more than 1
    if (validCards.length > 1 && rules.secondary) {
        validCards = applyCriterion(validCards, rules.secondary, hand);
    }

    // Apply type tie-breaker A > B > C > D
    if (validCards.length > 1) {
        validCards.sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit));
    }

    // Return the selected card
    return validCards[0];
}

function applyCriterion(cards, criterion, fullHand) {
    if (!criterion || cards.length <= 1) return cards;

    if (criterion === 'high') {
        const maxVal = Math.max(...cards.map(c => c.value));
        return cards.filter(c => c.value === maxVal);
    } 
    else if (criterion === 'low') {
        const minVal = Math.min(...cards.map(c => c.value));
        return cards.filter(c => c.value === minVal);
    }
    else if (criterion === 'long' || criterion === 'short') {
        // Count suits in FULL hand
        const suitCounts = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
        fullHand.forEach(c => suitCounts[c.suit]++);
        
        // Find counts only for the suits present in 'cards'
        const presentSuits = [...new Set(cards.map(c => c.suit))];
        const counts = presentSuits.map(s => suitCounts[s]);
        
        const targetCount = criterion === 'long' ? Math.max(...counts) : Math.min(...counts);
        const targetSuits = presentSuits.filter(s => suitCounts[s] === targetCount);
        
        return cards.filter(c => targetSuits.includes(c.suit));
    }

    return cards;
}
