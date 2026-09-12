# Agents in Robotrick Digital

This document outlines the behavior and logic of the non-human entities in the digital implementation of Robotrick.

## 1. Droco (The AI Player)
Droco operates strictly by the rules defined on the physical AI cards provided in the game. He does not use complex decision-making algorithms; instead, he follows a rigid, deterministic set of criteria.

### Logic Flow (`droco.js`)
When it is Droco's turn, the game engine evaluates his situation:
1.  **Lead**: Droco is leading the trick.
2.  **Follow**: Droco has cards matching the led suit.
3.  **Unfollow**: Droco does not have cards matching the led suit.

Based on the situation, Droco consults the **Active AI Card** for the current round and applies the criteria from top to bottom:
*   **Primary Criterion**: Selects the subset of valid cards matching this rule.
*   **Secondary Criterion**: If multiple cards tie under the primary criterion, this rule is used to break the tie.
*   **Type Tie-Breaker**: If cards are still tied, Droco always prioritizes the type (suit) strictly in alphabetical order: `A > B > C > D`.

### Criteria Definitions
*   **High**: The card(s) with the highest strength value.
*   **Low**: The card(s) with the lowest strength value.
*   **Long**: The card(s) belonging to the suit of which Droco holds the *most* total cards in his hand.
*   **Short**: The card(s) belonging to the suit of which Droco holds the *fewest* total cards in his hand.

## 2. Simulated Opponents (Bot 1 & Bot 2)
The simulated human players (Bots) use simple heuristic logic to simulate competent gameplay without being too predictable or computationally heavy.

### Logic Flow (`bot.js`)
1.  **Constraint Checking**: The bot first filters its hand to only include valid plays (must follow the led suit if possible).
2.  **Hangars Check (Avoid Negatives)**: If the bot already has 3 face-up cards (hangars full), any further captured cards will become negative points. In this case, the bot attempts to "duck" by playing its *lowest* valid card to avoid winning the trick.
3.  **Value Evaluation (Target Droco)**: If the bot has room in its hangars, it looks at the card Droco has played (if Droco has played already):
    *   If Droco played a high VP card (>= 5 VP), the bot attempts to win the trick by playing its *highest* valid card.
    *   If Droco played a low VP card, the bot attempts to avoid winning by playing its *lowest* valid card.
4.  **Default Action**: If no other heuristics trigger strongly, the bot plays its lowest valid card to play it safe.
