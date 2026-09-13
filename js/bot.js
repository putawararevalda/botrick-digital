// js/bot.js

// Helper to determine the current winning card of the trick
function getCurrentWinningCard(trickCards, ledSuit, trumpSuit) {
    if (trickCards.length === 0) return null;
    
    let winner = null;
    let highestVal = -1;
    
    const trumps = trickCards.filter(tc => tc.card.suit === trumpSuit);
    if (trumps.length > 0) {
        trumps.forEach(tc => {
            if (tc.card.value > highestVal) {
                highestVal = tc.card.value;
                winner = tc.card;
            }
        });
        return winner;
    }
    
    const ledCards = trickCards.filter(tc => tc.card.suit === ledSuit);
    ledCards.forEach(tc => {
        if (tc.card.value > highestVal) {
            highestVal = tc.card.value;
            winner = tc.card;
        }
    });
    return winner;
}

export function getBotPlay(hand, ledSuit, trickCards, botState, trumpSuit, difficulty = 'normal') {
    let validCards = [...hand];
    if (ledSuit) {
        const matchingSuit = hand.filter(c => c.suit === ledSuit);
        if (matchingSuit.length > 0) {
            validCards = matchingSuit;
        }
    }

    // Sort valid cards by value (ascending)
    validCards.sort((a, b) => a.value - b.value);
    const lowestCard = validCards[0];
    const highestCard = validCards[validCards.length - 1];

    if (difficulty === 'easy') {
        // EASY MODE: The original logic
        const drocoPlay = trickCards.find(c => c.player === 'droco');
        if (botState.hangars.length >= 3) return lowestCard;
        if (drocoPlay) {
            if (drocoPlay.card.vp >= 5) return highestCard;
            else return lowestCard;
        }
        return lowestCard;
    }

    // --- NORMAL & HARD MODE LOGIC ---
    
    // 1. Identify the current state of the trick
    const winningCard = getCurrentWinningCard(trickCards, ledSuit || highestCard.suit, trumpSuit);
    const drocoPlay = trickCards.find(c => c.player === 'droco');
    
    // Calculate total VP currently in the trick
    const trickVp = trickCards.reduce((sum, tc) => sum + tc.card.vp, 0);

    // Is someone else guaranteed to win with a massive card?
    // User requested: if Droco plays a high number (like 13), don't counter with a 12.
    let canBeatWinner = false;
    if (!winningCard) {
        canBeatWinner = true; // We are leading
    } else {
        const winSuit = winningCard.suit;
        canBeatWinner = validCards.some(c => {
            if (c.suit === trumpSuit && winSuit !== trumpSuit) return true;
            if (c.suit === winSuit && c.value > winningCard.value) return true;
            return false;
        });
    }

    // 2. Decide if we WANT to win
    let wantToWin = false;
    if (botState.hangars.length < 3) {
        // We have room for more hangars. Are the points worth it?
        if (trickVp > 0 || (drocoPlay && drocoPlay.card.vp >= 5)) {
            wantToWin = true;
        }
        // In Hard Mode, if we have 2 hangars, we are very careful.
        if (difficulty === 'hard' && botState.hangars.length === 2 && trickVp < 10) {
            wantToWin = false; // Only risk the 3rd hangar for a big payoff
        }
    } else {
        // Hangars are full. We DO NOT want to win to avoid negative points.
        wantToWin = false;
    }

    // 3. Execute play based on strategy
    
    // Situation A: We can't beat the winner anyway
    if (!canBeatWinner) {
        // Since we can't win, minimize waste.
        // Always throw the absolute lowest card to minimize the pain (sloughing).
        return lowestCard;
    }

    // Situation B: We CAN beat the winner
    if (wantToWin) {
        if (!winningCard) return highestCard; // Leading? play high to win.
        
        const winSuit = winningCard.suit;
        const winningOptions = validCards.filter(c => {
            if (c.suit === trumpSuit && winSuit !== trumpSuit) return true;
            if (c.suit === winSuit && c.value > winningCard.value) return true;
            return false;
        });
        
        if (winningOptions.length > 0) {
            if (difficulty === 'hard') {
                return winningOptions[0]; // Lowest winning card (efficient winning)
            } else {
                return winningOptions[winningOptions.length - 1]; // Normal mode throws high
            }
        }
    } else {
        // We DON'T want to win, but we have cards that could win.
        // We must "duck" (play lower than the winning card if possible).
        if (!winningCard) return lowestCard; // Leading? play low to lose.

        if (difficulty === 'hard') {
            // Find the highest card that is STRICTLY LOWER than the winning card.
            // This safely bleeds high cards out of the hand.
            const safeCards = validCards.filter(c => {
                if (winningCard.suit === trumpSuit) {
                    if (c.suit === trumpSuit && c.value > winningCard.value) return false;
                    return true;
                } else {
                    if (c.suit === trumpSuit) return false; // Trump will always win if no trump was led
                    if (c.suit === winningCard.suit && c.value > winningCard.value) return false;
                    return true;
                }
            });
            
            if (safeCards.length > 0) {
                return safeCards[safeCards.length - 1]; // Highest safe card
            }
        }
        
        return lowestCard;
    }

    return lowestCard;
}
