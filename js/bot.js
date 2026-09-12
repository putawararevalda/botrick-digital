// js/bot.js

export function getBotPlay(hand, ledSuit, trickCards, botState, trumpSuit) {
    let validCards = [...hand];
    if (ledSuit) {
        const matchingSuit = hand.filter(c => c.suit === ledSuit);
        if (matchingSuit.length > 0) {
            validCards = matchingSuit;
        }
    }

    // Sort valid cards by value (ascending)
    validCards.sort((a, b) => a.value - b.value);

    // Simplistic heuristic:
    // If we have space in hangars (face-up < 3) we might want to win.
    // If we have 3 hangars, we want to lose to avoid negative points.
    
    // Check if Droco has played
    const drocoPlay = trickCards.find(c => c.player === 'droco');
    
    if (botState.hangars.length >= 3) {
        // We want to avoid winning. Play lowest valid card.
        return validCards[0];
    }

    if (drocoPlay) {
        // We might want to win Droco's card if it's high VP
        if (drocoPlay.card.vp >= 5) {
            // Try to win. Play highest valid card.
            return validCards[validCards.length - 1];
        } else {
            // Bad card, try to lose.
            return validCards[0];
        }
    }

    // Default: play lowest card to be safe
    return validCards[0];
}
