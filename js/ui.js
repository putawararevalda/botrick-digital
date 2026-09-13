// js/ui.js

export function createCardElement(card, faceDown = false) {
    const el = document.createElement('div');
    el.classList.add('card');
    
    if (faceDown || !card) {
        el.classList.add('face-down');
        return el;
    }

    el.dataset.suit = card.suit;
    el.dataset.value = card.value;
    el.dataset.id = card.id;

    el.innerHTML = `
        <div class="val-main val-left">${card.value}</div>
        <div class="val-main val-right">${card.value}</div>
        <div class="vp vp-top">${card.vp}</div>
        <div class="vp vp-left">${card.vp}</div>
        <div class="vp vp-right">${card.vp}</div>
    `;

    return el;
}

export function renderHand(containerId, cards, onCardClick = null, disableCheck = null) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    cards.forEach(card => {
        const el = createCardElement(card);
        
        if (disableCheck && disableCheck(card)) {
            el.classList.add('disabled');
        } else if (onCardClick) {
            el.classList.add('playable');
            el.addEventListener('click', () => onCardClick(card, el));
        }
        
        container.appendChild(el);
    });
}

export function renderDrocoHand(hand) {
    ['A', 'B', 'C', 'D'].forEach(suit => {
        const col = document.getElementById(`droco-col-${suit}`);
        col.innerHTML = '';
        const suitCards = hand.filter(c => c.suit === suit).sort((a, b) => b.value - a.value); // Descending
        suitCards.forEach(c => {
            col.appendChild(createCardElement(c));
        });
    });
}

export function updateStats(playerId, handCount, hangars, faceDown) {
    if (document.getElementById(`${playerId}-hand-count`)) {
        document.getElementById(`${playerId}-hand-count`).innerText = handCount;
    }
    
    const hangarsContainer = document.getElementById(`${playerId}-hangars`);
    hangarsContainer.innerHTML = '';
    hangars.forEach(c => hangarsContainer.appendChild(createCardElement(c)));

    const fdContainer = document.getElementById(`${playerId}-fd`);
    if (fdContainer) {
        fdContainer.innerHTML = '';
        faceDown.forEach(c => {
            if (playerId === 'player') {
                // Show face up for player
                const el = createCardElement(c);
                el.style.opacity = '0.7'; // Dim slightly to indicate it's a negative point card
                fdContainer.appendChild(el);
            } else {
                // Show face down for bots
                fdContainer.appendChild(createCardElement(c, true));
            }
        });
    }
}

export function clearTrickSlots() {
    ['trick-droco', 'trick-bot1', 'trick-bot2', 'trick-player'].forEach(id => {
        document.getElementById(id).innerHTML = '';
    });
}

export function renderTrickCard(playerId, card, isLeader = false) {
    const slot = document.getElementById(`trick-${playerId}`);
    slot.innerHTML = '';
    slot.appendChild(createCardElement(card));
    
    if (isLeader) {
        const leaderIcon = document.createElement('div');
        leaderIcon.className = 'leader-icon';
        leaderIcon.innerText = '🚩 Lead';
        slot.appendChild(leaderIcon);
    }
}

export function showMessage(msg) {
    document.getElementById('action-msg').innerText = msg;
}
