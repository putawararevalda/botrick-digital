# Robotrick - Technical Implementation Plan

## Architecture Overview
A pure frontend implementation using Vanilla JavaScript, HTML5, and CSS3. No build tools (like Webpack or Vite) are required to keep it simple, but modern ES6 modules will be used for organization.

## Directory Structure
```text
D:\Portfolios\robotrick\
├── index.html       # Main UI layout
├── style.css        # Styling and animations
├── js/
│   ├── main.js      # Initialization and DOM bindings
│   ├── game.js      # Core game loop and state management
│   ├── deck.js      # Card and Deck generation
│   ├── droco.js     # Droco's deterministic AI logic
│   ├── bot.js       # Simulated human opponent logic
│   └── ui.js        # DOM manipulation functions
```

## 1. State Management (`game.js`)
The game state will track:
*   **Round Information:** Current round (1-3), Trump card, Current AI card.
*   **Trick Information:** Cards played in current trick, Leading suit, Current turn order.
*   **Players:** Array of 4 entities (Player, Bot 1, Bot 2, Droco).
    *   Each has: `hand` (array of cards), `hangars` (face-up captured cards), `faceDown` (face-down captured cards), `score`.

## 2. Core Game Loop
1.  **Round Setup:** Generate deck -> pick Trump -> deal hands -> reveal Droco's hand -> card passing (human & bots pass 2 cards).
2.  **Trick Loop:** 
    *   Determine leader.
    *   Iterate through players in clockwise order.
    *   If Player: Wait for UI click (validate if it follows suit).
    *   If Bot: Calculate best valid move (see Bot Logic).
    *   If Droco: Calculate deterministic move (see Droco Logic).
3.  **Resolve Trick:** Compare cards -> determine winner -> award Droco's card -> move other cards to face-down piles.
4.  **End of Round:** Calculate scores. Repeat until 3 rounds are finished.

## 3. Logic Modules

### Droco Logic (`droco.js`)
Droco is fully deterministic based on the active AI card.
*   **Inputs:** AI Card, Trick state (Led suit), Droco's hand.
*   **Process:** 
    1. Determine context: `Lead`, `Follow`, or `Unfollow`.
    2. Apply `Primary` criterion (e.g., Highest, Lowest, Long suit, Short suit).
    3. If tied, apply `Secondary` criterion.
    4. If still tied, use type priority (A > B > C > D).

### Bot Logic (`bot.js`)
Simulated humans need basic heuristics. They aren't purely random, otherwise the game isn't fun.
*   **Constraint:** Must follow suit if they have it.
*   **Heuristic 1 (Winning):** If Droco's card is good (high VP) and the bot has < 3 hangars, try to play the highest valid card to win.
*   **Heuristic 2 (Evading):** If Droco's card is bad (low VP) OR the bot already has 3 hangars, play the lowest valid card to try and lose the trick.

## 4. User Interface (`index.html` & `ui.js`)
*   **Droco's Area (Top):** Displays the active AI card rules. Shows Droco's 12 cards laid out in 4 columns (A, B, C, D) sorted by strength, visible to everyone.
*   **Bot Areas (Left/Right):** Shows number of cards in hand, 3 slots for Hangars (face-up), and a pile for face-down cards.
*   **Play Area (Center):** Shows the Trump card and the 4 cards played in the current trick.
*   **Player Area (Bottom):** Shows the player's hand as clickable cards. Automatically disables (greys out) cards that are illegal to play (e.g., not following suit). Shows the player's hangars and face-down piles.

## Next Steps
1.  Set up the base `index.html` and `style.css` for the board layout.
2.  Implement `deck.js` to create the 52 cards and 10 AI cards.
3.  Implement `game.js` state and dealing logic.
4.  Build Droco's logic engine (`droco.js`).
