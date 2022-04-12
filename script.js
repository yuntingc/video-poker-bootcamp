// ===== GLOBAL VARIABLES =====

let playerCredits = 1;
let playerHand = [];
let shuffledDeck = [];
let heldCardsIndex = [];
var cardNameTally = {};
var suitNameTally = {};
let creditDisplay = 0;
let betPlaced = 0;
let winnings = 0;
let winningCombination = "";

let canClickDealBtn = true;
let canClickDrawBtn = false;
let canClickCreditsBtn = true;
let canClickHold = false;

const payoutInfo = { 
  "Royal Flush": 250, 
  "Straight Flush": 50,
  "Four-of-a-Kind": 25,
  "Full House": 9,
  "Flush": 6,
  "Straight": 4,
  "Three-of-a-Kind": 3,
  "Two Pairs": 2,
  "Jacks or Better": 1,
  "All Other": 0
}

// Getting DOM elements
const winningCombinationDisplay = document.getElementById("winning-combination");
const cardContainer = document.getElementById("card-container");
const gameMessage = document.getElementById("game-message");
const creditsInserted = document.getElementById("credits-inserted");
const creditsWon = document.getElementById("credits-won");
const creditsLeft = document.getElementById("credits-left");

const addCreditBtn = document.getElementById("addcredit");
const minusCreditBtn = document.getElementById("minuscredit");
const creditsToInsert = document.getElementById("creditstoinsert");
const dealButton = document.getElementById("dealbutton");
const drawButton = document.getElementById("drawbutton");

// ===== HELPER FUNCTIONS =====

// display cards on screen
const displayCards = (cards) => {
  for (let i = 0; i < cards.length; i += 1) {
    let pngCardName = `${cards[i].name}_of_${cards[i].suit}.png`
    let pngCardSrc = "<img src=cards_png/" + pngCardName + ">"
    cardContainer.innerHTML += pngCardSrc;
  }
}

const displayGameMessage = (message) => {
  gameMessage.innerText = message;
}

const displayWinningCombination = (message) => {
  winningCombinationDisplay.innerText = message;
}

const toggleHold = (card, holdMessage, index) => {

  if (holdMessage.innerHTML === '') {
    holdMessage.innerText = 'hold';
    heldCardsIndex.push(index);
  } else {
    holdMessage.innerText = "";
    const removeIndex = heldCardsIndex.indexOf(index);
    heldCardsIndex.splice(removeIndex, 1);
  }  
}

const resetGame = () => {
  playerHand = [];
  shuffledDeck = [];
  heldCardsIndex = [];
  cardNameTally = {};
  suitNameTally = {};
  creditDisplay = 0;
  betPlaced = 0;
  winnings = 0;
  winningCombination = "";

  canClickDealBtn = true;
  canClickDrawBtn = false;
  canClickCreditsBtn = true;

}

// ===== GAME LOGIC =====
const createDeck = () => {
  const deck = [];
  const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
  
  for (let suitIndex = 0; suitIndex < suits.length; suitIndex += 1) {
    let currentSuit = suits[suitIndex];
    let currentSymbol;

    if (suits[suitIndex] === 'spades') {
      currentSymbol = '♠️';
    } else if (suits[suitIndex] === 'hearts') {
      currentSymbol = '♥️';
    } else if (suits[suitIndex] === 'clubs') {
      currentSymbol = '♣️';
    } else {
      currentSymbol = '♦️';
    }
    
    for (let rankCounter = 1; rankCounter <= 13; rankCounter += 1) {
      let cardName = `${rankCounter}`;

      if (cardName == 1) {
        cardName = 'A';
        fullCardName = 'ace';
      } else if (cardName == 11) {
        cardName = 'J';
        fullCardName = 'jack';
      } else if (cardName == 12) {
        cardName = 'Q';
        fullCardName = 'queen';
      } else if (cardName == 13) {
        cardName = 'K';
        fullCardName = 'king';
      }

      const card = {
        name: cardName,
        fullname: fullCardName,
        suit: currentSuit,
        rank: rankCounter,
        symbol: currentSymbol
      }

      deck.push(card);
    }
  }
  return deck;
}

const getRandomNum = (max) => {
  return Math.floor(Math.random() * max);
}

const shuffleCards = (cards) => {
  for (let currentIndex = 0; currentIndex < cards.length; currentIndex += 1) {
    const randomIndex = getRandomNum(cards.length);
    const randomCard = cards[randomIndex];
    const currentCard = cards[currentIndex];

    cards[currentIndex] = randomCard;
    cards[randomIndex] = currentCard;
  }

  return cards;
}

const dealCards = () => {
  let deck = createDeck();
  shuffledDeck = shuffleCards(deck);

  for (let i = 0; i < 5; i += 1) {
    let cardDrawn = shuffledDeck.pop();
    playerHand.push(cardDrawn);
  }
}

const drawCards = () => {
  const finalHand = [];
  for (let i = 0; i < playerHand.length; i += 1) {
    if (heldCardsIndex.includes(i)) {
      finalHand.push(playerHand[i]);
    } else {
      finalHand.push(shuffledDeck.pop());
    }
  }
  return finalHand;
}

const calcHandScore = (playerHand) => {

  for (let i = 0; i < playerHand.length; i += 1) {
    let cardName = playerHand[i].name;
    let suitName = playerHand[i].suit;

    if (cardName in cardNameTally) {
      cardNameTally[cardName] += 1;
    } else {
      cardNameTally[cardName] = 1;
    }

    if (suitName in suitNameTally) {
      suitNameTally[suitName] += 1;
    } else {
      suitNameTally[suitName] = 1;
    }
  }

  // determining winning score
  if (isConsecutiveNum(cardNameTally) && isSameSuit(suitNameTally) && Object.keys(cardNameTally).includes('A') && Object.keys(cardNameTally).includes('K')) {
    winningCombination = "Royal Flush";
  } else if (isConsecutiveNum(cardNameTally) && isSameSuit(suitNameTally)) {
    winningCombination = "Straight Flush";
  } else if (Object.values(cardNameTally).includes(4)) {
    winningCombination = "Four-of-a-Kind";
  } else if (Object.values(cardNameTally).includes(3) && Object.values(cardNameTally).includes(2)) {
    winningCombination = "Full House";
  } else if (isSameSuit(suitNameTally)) {
    winningCombination = "Flush";
  } else if (isConsecutiveNum(cardNameTally)) {
    winningCombination = "Straight";
  } else if (Object.values(cardNameTally).includes(3) && !(Object.values(cardNameTally).includes(2))) {
    winningCombination = "Three-of-a-Kind";
  } else if (Object.values(cardNameTally).includes(2) && Object.values(cardNameTally).length === 3) {
    winningCombination = "Two Pairs";
  } else if ( cardNameTally['J'] === 2 || cardNameTally['Q'] === 2 || cardNameTally['K'] === 2 || cardNameTally['A'] === 2) {
    winningCombination = "Jacks or Better";
  } else {
    winningCombination = "All Other";
  }

  return winningCombination;
}

const isConsecutiveNum = (cardNameTally) => {

  let consecutiveNumCount = 1;

  const playerHandCopy = [...playerHand];
  playerHandCopy.sort(function(a, b) {
    return a.rank - b.rank;
  })

  // for A-10-J-Q-K, there are 4 consecutive numbers
  if (Object.keys(cardNameTally).includes('A') && Object.keys(cardNameTally).includes('K')) {
    for (let i = 1; i < playerHandCopy.length - 1; i += 1) {
      if (playerHandCopy[i].rank + 1 === playerHandCopy[i+1].rank) {
      consecutiveNumCount += 1;
      }
    }
    if (consecutiveNumCount === 4) {
      return true;
    }
  } else {
    // all other combinations will have 5 consecutive numbers
      for (let i = 0; i < playerHandCopy.length - 1; i += 1) {
        if (playerHandCopy[i].rank + 1 === playerHandCopy[i+1].rank) {
         consecutiveNumCount += 1;
        }
      }
      if (consecutiveNumCount === 5) {
        return true;
      }
  } 
  return false;
}

const isSameSuit = (suitNameTally) => {
  if (suitNameTally['spades'] === 5 || suitNameTally['hearts'] === 5  || suitNameTally['clubs'] === 5 || suitNameTally['diamonds' === 5]) {
    return true;
  } else {
    return false;
  }
}

const getWinnings = (betPlaced) => {
  let winningsPerCredit = payoutInfo[winningCombination];
  winnings = betPlaced * winningsPerCredit;
  
  if (winnings > 0) {
    playerCredits += winnings + betPlaced;  
  }

  creditsWon.innerText = "credits won: " + winnings;
  creditsLeft.innerText = "credits left: " + playerCredits;
}

// ===== DOM FUNCTIONS =====

const createCardElement= () => {
  cardContainer.innerHTML = "";

  for (let i = 0; i < 5; i += 1) {

    const indivCardContainer = document.createElement('div');
    indivCardContainer.classList.add('indiv-card-container');

    const holdMessage = document.createElement('div');
    holdMessage.classList.add('hold-message');
    holdMessage.innerHTML = '';
    
    const card = document.createElement('div');
    card.classList.add('card');

    card.innerText = `${playerHand[i].name} ${playerHand[i].symbol}`;

    indivCardContainer.appendChild(holdMessage);
    indivCardContainer.appendChild(card);

    cardContainer.appendChild(indivCardContainer);

    card.addEventListener('click', (event) => {
      if (canClickHold) {
      toggleHold(event.currentTarget, holdMessage, i);
      canClickDeal = false;
      canClickDraw = true;
      }
    })

  }
}

drawButton.addEventListener('click', () => {
  canClickHold = false;
  if (canClickDrawBtn) {
  playerHand = drawCards();
  createCardElement();
  winningCombination = calcHandScore(playerHand);
  getWinnings(betPlaced);
  displayGameMessage("Game Over");
  displayWinningCombination(winningCombination);
  resetGame();
  } else {
    if (playerCredits == 0) {
      displayGameMessage("no credits left");
    } else {
      displayGameMessage("Insert credits to begin");
    }
  }
})

dealButton.addEventListener('click', () => {
  if (creditDisplay === 0 && canClickDealBtn === true) {
    if (playerCredits === 0) {
      displayGameMessage("no credits left");
    } else {
     displayGameMessage("Insert credits to begin");
    }
  } else if (canClickDealBtn === true) {
  winningCombinationDisplay.innerText = "";
  canClickCreditsBtn = false;
  betPlaced = creditDisplay;
  creditDisplay = 0;
  playerCredits -= betPlaced;

  creditsToInsert.innerText = creditDisplay + " credits"
  creditsInserted.innerText = "credits inserted: " + betPlaced;
  creditsLeft.innerText = "credits left: " + playerCredits;

  dealCards();
  createCardElement();
  displayGameMessage("Select cards to hold and press draw")
  canClickDealBtn = false;
  canClickDrawBtn = true;
  canClickHold = true;
  }
})

addCreditBtn.addEventListener('click', () => {

    if (creditDisplay < 5 && canClickCreditsBtn && (playerCredits-creditDisplay > 0)) {
    creditDisplay += 1;
    creditsToInsert.innerText = creditDisplay + " credits";
    } else if (creditDisplay < 5 && canClickCreditsBtn && (playerCredits-creditDisplay === 0) && playerCredits !== 0) {
      displayGameMessage("not enough credits");
    } else if (playerCredits === 0) {
      displayGameMessage("no credits left")
    }
})

minusCreditBtn.addEventListener('click', () => {
    if (creditDisplay > 0 && canClickCreditsBtn) {
    creditDisplay -= 1;
    creditsToInsert.innerText = creditDisplay + " credits";
    displayGameMessage("insert credits to begin")
    }
})

