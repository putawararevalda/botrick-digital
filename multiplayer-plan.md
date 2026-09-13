# Multiplayer Architecture Plan for Robotrick

## Overview
To support multiplayer gameplay where humans replace the simulated bots (Bot 1 and Bot 2), the architecture must shift from a standalone client-side application to a client-server model. The server will act as the authoritative source of truth for game state and logic, while the clients will be responsible for rendering the UI and sending player actions.

## Stack Recommendation
*   **Backend:** Node.js with Express (for basic HTTP and serving static files if needed)
*   **Real-time Communication:** Socket.IO (handles WebSockets with automatic reconnection and fallback polling)
*   **Frontend:** Keep existing Vanilla JS, HTML, CSS, but refactor to communicate via Socket.IO.

## 1. Core Server-Side Components
The server must be authoritative to prevent cheating. No client should ever receive data they aren't supposed to see (e.g., opponents' hand cards or face-down piles).

*   **Lobby Manager (`lobby.js`):**
    *   Handles creating rooms (generating a unique 4-letter/digit code).
    *   Manages players joining/leaving rooms.
    *   Assigns roles when the game starts: e.g., if 3 humans join, they are assigned to Player, Bot 1, and Bot 2 slots. Bot slots that are empty are filled by AI instances.
*   **Game State Engine (`gameState.js`):**
    *   Holds the current state of every active game room.
    *   Tracks:
        *   Turn order and current player.
        *   Round number (1-3) and Trick state (cards played, led suit).
        *   Player data: IDs, names, hands (hidden from clients), hangars, and scores.
        *   Trump card and Droco's AI card.
*   **Game Logic Controller (`gameLogic.js`):**
    *   Validates all moves received from clients (e.g., ensuring a player follows suit if they can).
    *   Evaluates the winner of a trick based on Robotrick rules.
    *   Executes `droco.js` (Droco's AI) on the server when it is Droco's turn.
    *   Executes `bot.js` on the server for any slots not filled by human players.

## 2. Refactoring the Frontend
The current frontend logic (`game.js`) will be drastically reduced. It will shift from executing game rules to merely being a view layer.

*   **Socket Listener (`network.js`):**
    *   Listens for server events: `gameStart`, `yourTurn`, `trickUpdate`, `roundEnd`, `gameOver`.
    *   When the server sends `trickUpdate`, the client calls `ui.js` to visually place the cards on the table.
*   **Action Dispatcher:**
    *   When a player clicks a card in their hand, instead of resolving the play locally, it sends a Socket.IO event: `socket.emit('playCard', { cardId: 'H7' })`.
*   **UI Adjustments:**
    *   Add a main menu screen for "Create Game" or "Join Game".
    *   Add a lobby waiting screen.
    *   Add visual indicators for "Waiting for Opponent...".

## 3. Communication Protocol (Socket Events)
A standardized set of events will orchestrate the game.

**Client to Server:**
*   `createRoom`
*   `joinRoom(roomCode)`
*   `playCard(cardId)`
*   `passCards(cardIds)` (For the passing phase at the start of a round)

**Server to Client:**
*   `roomState(state)`: Updates players in the lobby.
*   `gameInit(data)`: Sends the initial game state, but **only sends the specific player's hand**, the Trump card, and Droco's revealed hand.
*   `gameStateUpdate(data)`: Sent whenever a card is played or a trick resolves. Contains public info (hangars, table cards, scores, whose turn it is).
*   `error(message)`: E.g., "Invalid play: Must follow suit."

## 4. Handling Droco and Bots
*   **Droco:** Since Droco is fully deterministic and doesn't have hidden information (his hand is face-up), his logic `droco.js` is moved to the server. When it's Droco's turn, the server instantly calculates his move, updates the state, and broadcasts the play.
*   **Empty Seats (Bots):** If a room is started with 2 human players, the 3rd seat is filled by a bot. The server will instantiate a bot using `bot.js`. When it is that seat's turn, the server executes the bot heuristic and processes the move exactly as it would for a human.

## 5. Development Phases

**Phase 1: Basic Node/Socket Server Setup**
*   Initialize Node.js project (`npm init`, install `express`, `socket.io`).
*   Create a simple lobby system where players can connect, join a room, and see each other's names.

**Phase 2: Porting Logic to Backend**
*   Move `deck.js` to the server. Have the server generate and shuffle the deck, then send hands to the clients.
*   Move `droco.js` and `bot.js` to the server.
*   Migrate the trick-taking and validation logic from the client's `game.js` to the server's `gameLogic.js`.

**Phase 3: Frontend Refactor**
*   Remove state mutation from the frontend.
*   Wire up the frontend to render purely based on `gameStateUpdate` events from the server.
*   Add the necessary waiting states and lobby UI.

**Phase 4: Testing & Edge Cases**
*   Handle disconnections (what happens if someone leaves mid-game).
*   Thoroughly test hidden state to ensure no one can inspect their browser network tab to see opponents' cards.
