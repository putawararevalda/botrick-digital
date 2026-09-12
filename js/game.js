// js/game.js
import { Deck, AICards, SUITS } from './deck.js';
import { getDrocoPlay } from './droco.js';
import { getBotPlay } from './bot.js';
import * as UI from './ui.js';

class PlayerState {
    constructor(id) {
        this.id = id;
        this.hand = [];
        this.hangars = []; // face-up cards (max 3)
        this.faceDown = [];
        this.score = 0;
    }
}

export class Game {
    constructor() {
        this.round = 1;
        this.trick = 1;
        this.players = {
            player: new PlayerState('player'),
            bot1: new PlayerState('bot1'),
            bot2: new PlayerState('bot2'),
            droco: new PlayerState('droco')
        };
        this.deck = null;
        this.trumpCard = null;
        this.currentAiCard = AICards[0]; // Using standard AI for now
        this.trickCards = []; // { player: id, card: Card }
        this.ledSuit = null;
        this.turnOrder = [];
        this.currentTurnIdx = 0;
        
        this.passingMode = false;
        this.cardsToPass = [];
    }

    startRound() {
        this.deck = new Deck();
        this.deck.shuffle();
        
        // Pick Trump
        this.trumpCard = this.deck.draw();
        document.getElementById('trump-card').innerHTML = '';
        document.getElementById('trump-card').appendChild(UI.createCardElement(this.trumpCard));
        
        // Discard 3
        this.deck.draw(); this.deck.draw(); this.deck.draw();
        
        // Deal 12 each
        this.players.player.hand = [];
        this.players.bot1.hand = [];
        this.players.bot2.hand = [];
        this.players.droco.hand = [];
        
        this.players.player.hangars = [];
        this.players.bot1.hangars = [];
        this.players.bot2.hangars = [];
        
        this.players.player.faceDown = [];
        this.players.bot1.faceDown = [];
        this.players.bot2.faceDown = [];
        
        this.trickCards = [];
        
        for (let i = 0; i < 12; i++) {
            this.players.droco.hand.push(this.deck.draw());
            this.players.bot1.hand.push(this.deck.draw());
            this.players.player.hand.push(this.deck.draw());
            this.players.bot2.hand.push(this.deck.draw());
        }

        // Sort player hand
        this.players.player.hand.sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) || a.value - b.value);
        
        // Pick random AI card
        const randomAiIndex = Math.floor(Math.random() * AICards.length);
        this.currentAiCard = AICards[randomAiIndex];
        
        this.updateAllUI();
        
        // Setup AI card UI
        document.getElementById('active-ai-card').innerHTML = `
            <strong>Round ${this.round} - ${this.currentAiCard.name}</strong><br>
            Lead: ${this.currentAiCard.rules.lead.primary} ${this.currentAiCard.rules.lead.secondary ? '(' + this.currentAiCard.rules.lead.secondary + ')' : ''}<br>
            Follow: ${this.currentAiCard.rules.follow.primary} ${this.currentAiCard.rules.follow.secondary ? '(' + this.currentAiCard.rules.follow.secondary + ')' : ''}<br>
            Unfollow: ${this.currentAiCard.rules.unfollow.primary} ${this.currentAiCard.rules.unfollow.secondary ? '(' + this.currentAiCard.rules.unfollow.secondary + ')' : ''}
        `;
        document.getElementById('ai-card-img').src = this.currentAiCard.image;

        this.startPassingPhase();
    }

    updateAllUI() {
        try {
            UI.renderDrocoHand(this.players.droco.hand);
            UI.updateStats('bot1', this.players.bot1.hand.length, this.players.bot1.hangars, this.players.bot1.faceDown);
            UI.updateStats('bot2', this.players.bot2.hand.length, this.players.bot2.hangars, this.players.bot2.faceDown);
            UI.updateStats('player', this.players.player.hand.length, this.players.player.hangars, this.players.player.faceDown);
            
            document.getElementById('round-num').innerText = this.round;
            document.getElementById('trick-num').innerText = this.trick;
            
            if (!this.passingMode) {
                UI.renderHand('player-hand', this.players.player.hand, this.handlePlayerClick.bind(this), this.isCardDisabled.bind(this));
            }
        } catch (e) {
            UI.showMessage(e.toString());
            console.error(e);
        }
    }

    startPassingPhase() {
        this.passingMode = true;
        this.cardsToPass = [];
        UI.showMessage("Select 2 cards to pass to the left (Bot 1).");
        
        const modal = document.getElementById('pass-cards-modal');
        modal.classList.remove('hidden');
        
        const renderPassHand = () => {
            UI.renderHand('pass-hand-display', this.players.player.hand, (card, el) => {
                if (this.cardsToPass.includes(card)) {
                    this.cardsToPass = this.cardsToPass.filter(c => c !== card);
                    el.classList.remove('selected-to-pass');
                } else if (this.cardsToPass.length < 2) {
                    this.cardsToPass.push(card);
                    el.classList.add('selected-to-pass');
                }
                document.getElementById('confirm-pass-btn').disabled = this.cardsToPass.length !== 2;
            });
        };
        
        renderPassHand();
        
        document.getElementById('confirm-pass-btn').onclick = () => {
            modal.classList.add('hidden');
            this.executePass();
        };
    }

    executePass() {
        // Player passes to Bot1, Bot1 to Bot2, Bot2 to Player. (Droco is skipped)
        // Simplification for bots: pick lowest 2 cards.
        
        const bot1Pass = this.players.bot1.hand.sort((a,b) => a.value - b.value).slice(0, 2);
        const bot2Pass = this.players.bot2.hand.sort((a,b) => a.value - b.value).slice(0, 2);
        
        // Remove cards
        this.players.player.hand = this.players.player.hand.filter(c => !this.cardsToPass.includes(c));
        this.players.bot1.hand = this.players.bot1.hand.filter(c => !bot1Pass.includes(c));
        this.players.bot2.hand = this.players.bot2.hand.filter(c => !bot2Pass.includes(c));
        
        // Add cards
        this.players.bot1.hand.push(...this.cardsToPass);
        this.players.bot2.hand.push(...bot1Pass);
        this.players.player.hand.push(...bot2Pass);
        
        this.players.player.hand.sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) || a.value - b.value);
        
        this.passingMode = false;
        this.startTrick('droco'); // Droco leads first trick
    }

    startTrick(leaderId) {
        this.trickCards = [];
        this.ledSuit = null;
        UI.clearTrickSlots();
        
        // Determine turn order (clockwise: Droco -> Bot1 -> Player -> Bot2)
        const allPlayers = ['droco', 'bot1', 'player', 'bot2'];
        const startIdx = allPlayers.indexOf(leaderId);
        this.turnOrder = [];
        for (let i = 0; i < 4; i++) {
            this.turnOrder.push(allPlayers[(startIdx + i) % 4]);
        }
        
        this.currentTurnIdx = 0;
        this.updateAllUI();
        this.nextTurn();
    }

    nextTurn() {
        if (this.currentTurnIdx >= 4) {
            this.resolveTrick();
            return;
        }

        const currentPlayerId = this.turnOrder[this.currentTurnIdx];
        const state = this.players[currentPlayerId];
        
        UI.showMessage(`${currentPlayerId}'s turn...`);

        if (currentPlayerId === 'player') {
            // Wait for user interaction
            this.updateAllUI();
            return;
        }

        // AI turns
        setTimeout(() => {
            let playCard = null;
            if (currentPlayerId === 'droco') {
                playCard = getDrocoPlay(state.hand, this.ledSuit, this.currentAiCard);
            } else {
                playCard = getBotPlay(state.hand, this.ledSuit, this.trickCards, state, this.trumpCard.suit);
            }
            
            this.executePlay(currentPlayerId, playCard);
        }, 1000); // 1s delay for better UX
    }

    isCardDisabled(card) {
        if (this.turnOrder[this.currentTurnIdx] !== 'player') return true;
        if (!this.ledSuit) return false; // Can lead anything
        
        const hasLedSuit = this.players.player.hand.some(c => c.suit === this.ledSuit);
        if (hasLedSuit && card.suit !== this.ledSuit) return true; // Must follow suit
        
        return false;
    }

    handlePlayerClick(card) {
        if (this.isCardDisabled(card)) return;
        this.executePlay('player', card);
    }

    executePlay(playerId, card) {
        const state = this.players[playerId];
        state.hand = state.hand.filter(c => c.id !== card.id);
        
        if (this.trickCards.length === 0) {
            this.ledSuit = card.suit;
        }
        
        this.trickCards.push({ player: playerId, card: card });
        
        const isLeader = (this.trickCards.length === 1);
        UI.renderTrickCard(playerId, card, isLeader);
        
        if (playerId === 'droco') {
            UI.renderDrocoHand(state.hand);
        } else if (playerId === 'player') {
            this.updateAllUI();
        } else {
             UI.updateStats(playerId, state.hand.length, state.hangars, state.faceDown);
        }

        this.currentTurnIdx++;
        this.nextTurn();
    }

    resolveTrick() {
        UI.showMessage("Resolving trick...");
        
        setTimeout(() => {
            let winner = null;
            let highestVal = -1;
            
            // Check for Trump
            const trumps = this.trickCards.filter(tc => tc.card.suit === this.trumpCard.suit);
            
            if (trumps.length > 0) {
                trumps.forEach(tc => {
                    if (tc.card.value > highestVal) {
                        highestVal = tc.card.value;
                        winner = tc.player;
                    }
                });
            } else {
                // No Trump, check led suit
                const ledCards = this.trickCards.filter(tc => tc.card.suit === this.ledSuit);
                ledCards.forEach(tc => {
                    if (tc.card.value > highestVal) {
                        highestVal = tc.card.value;
                        winner = tc.player;
                    }
                });
            }

            UI.showMessage(`${winner} wins the trick!`);

            // Apply card capturing rules
            const drocoPlay = this.trickCards.find(tc => tc.player === 'droco').card;
            
            if (winner === 'droco') {
                // Everyone's card goes face down to themselves. Droco's card discarded.
                this.trickCards.forEach(tc => {
                    if (tc.player !== 'droco') {
                        this.players[tc.player].faceDown.push(tc.card);
                    }
                });
            } else {
                // Winner takes Droco's card.
                const winnerState = this.players[winner];
                if (winnerState.hangars.length < 3) {
                    winnerState.hangars.push(drocoPlay);
                } else {
                    winnerState.faceDown.push(drocoPlay);
                }
            }
            
            this.updateAllUI();
            
            // Wait before next trick
            setTimeout(() => {
                this.trick++;
                if (this.trick > 12) {
                    this.endRound();
                } else {
                    this.startTrick(winner);
                }
            }, 2000);

        }, 1500);
    }

    endRound() {
        // Calculate scores
        let details = "";
        ['player', 'bot1', 'bot2'].forEach(p => {
            const state = this.players[p];
            const pos = state.hangars.reduce((sum, c) => sum + c.vp, 0);
            const neg = state.faceDown.reduce((sum, c) => sum + c.vp, 0);
            const roundScore = pos - neg;
            state.score += roundScore;
            details += `<p>${p}: +${pos} (Hangars) - ${neg} (FaceDown) = ${roundScore} (Total: ${state.score})</p>`;
        });

        document.getElementById('player-score').innerText = this.players.player.score;
        document.getElementById('score-details').innerHTML = details;
        document.getElementById('score-modal').classList.remove('hidden');
        
        document.getElementById('next-round-btn').onclick = () => {
            document.getElementById('score-modal').classList.add('hidden');
            this.round++;
            if (this.round > 3) {
                alert("Game Over! Check console/UI for final scores.");
            } else {
                this.trick = 1;
                this.startRound();
            }
        };
    }
}
