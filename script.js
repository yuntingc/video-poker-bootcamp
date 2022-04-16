// ===== GLOBAL VARIABLES =====

let playerCredits = 100;
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
let gotRowHighlight = false;
let gotColumnHighlight = false;
let canFlipCard = true;
let cardFacingUp = false;


let payoutTableRowNum;
let payoutTableColumnNum;
let payoutTableColumn;

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

const payoutInfoKeys = Object.keys(payoutInfo);

// Getting DOM elements
const winningCombinationDisplay = document.getElementById("winning-combination");
const cardContainer = document.getElementById("card-container");
const gameMessage = document.getElementById("game-message");
const creditsInserted = document.getElementById("credits-inserted");
const creditsWon = document.getElementById("credits-won");
const creditsLeft = document.getElementById("credits-left");
const payoutTableContainer = document.getElementById("payout-table-container");

const addCreditBtn = document.getElementById("addcredit");
const minusCreditBtn = document.getElementById("minuscredit");
const creditsToInsert = document.getElementById("creditstoinsert");
const dealButton = document.getElementById("dealbutton");
const drawButton = document.getElementById("drawbutton");

// ===== HELPER FUNCTIONS =====

// display cards on screen
/*const displayCards = (cards) => {
  for (let i = 0; i < cards.length; i += 1) {
    let pngCardName = `${cards[i].name}_of_${cards[i].suit}.png`
    let pngCardSrc = "<img src=cards_png/" + pngCardName + ">"
    cardContainer.innerHTML += pngCardSrc;
  }
}*/

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
  canFlipCard = true;

  /*
  if (cardFacingUp) {
    for (let i = 0; i < 5; i += 1) {
    const flipCard = document.querySelector(`#card-container > div:nth-child(${i+1}) > div.card > div`)
    flipCard.classList.remove('turncard');
     }
    }*/

    for (let i = 0; i < 5; i += 1) {
    const holdMessage = document.querySelector(`#card-container > div:nth-child(${i+1}) > div.hold-message`)
    holdMessage.innerText = "";
     }


}

const generatePayoutTable = () => {

  let tableContainer = document.createElement("table");
  let tableContainerHead = document.createElement("thead");
  let tableContainerBody = document.createElement("tbody");
  let theadRow = document.createElement("tr");

  tableContainer.appendChild(tableContainerHead);
  tableContainer.appendChild(tableContainerBody);
  
  tableContainerHead.appendChild(theadRow);

  const tableHeaders = ["Winning Combinations", 1, 2, 3, 4, 5];
  for (let i = 0; i < tableHeaders.length; i += 1) {
    let tableHeader = document.createElement("th");
    tableHeader.innerText = tableHeaders[i];
    theadRow.append(tableHeader);

    if (i === 0) {
      tableHeader.classList.add("betCombinations");
      //tableHeader.classList.add("betCombinations" + i);
    } else {
      tableHeader.classList.add("betWinnings");
      //tableHeader.classList.add("betCombinations" + i);
    }

    //tableHeader.classList.add(i);

  }

  let payoutInfoKeys = Object.keys(payoutInfo);


  for (let i = 0; i < payoutInfoKeys.length; i += 1) {
    let tableRow = document.createElement("tr");
    tableRow.classList = payoutInfoKeys[i];

    for(let j = 0; j < 6; j += 1) {
      let tableColumn = document.createElement("td");
      if (j === 0) {
        tableColumn.innerText = payoutInfoKeys[i];
        tableColumn.classList.add("betCombinations");
        //tableColumn.classList.add("betCombinations" + j);
      } else {
        tableColumn.innerText = payoutInfo[payoutInfoKeys[i]] * j;

        if ( payoutInfoKeys[i] === "Royal Flush" && j === 5) {
          tableColumn.innerText = 4000;
        }
        
        tableColumn.classList.add("betWinnings");
        //tableColumn.classList.add("betWinnings" + j);
      }
      //tableColumn.classList.add(j);
      tableRow.appendChild(tableColumn);
    }

    tableContainerBody.appendChild(tableRow);
  }
  payoutTableContainer.appendChild(tableContainer);
}

const highlightRow = () => {
  gotRowHighlight = true;
  payoutTableRowNum = payoutInfoKeys.indexOf(winningCombination) + 1
  document.querySelector(`#payout-table-container > table > tbody > tr:nth-child(${payoutTableRowNum})`).classList.add("amt-bet-table") ;
}

const highlightAddColumn = () => {
  
  payoutTableColumn = creditDisplay -1 ;

  for (let i = 0; i < 11; i += 1) {
    let payoutTableColumnNum = i * 5 + payoutTableColumn;
    document.getElementsByClassName("betWinnings")[payoutTableColumnNum].classList.add("amt-bet-table");

    if (creditDisplay > 1) {
      let prevPayoutTableColumnNum = payoutTableColumnNum - 1
      document.getElementsByClassName("betWinnings")[prevPayoutTableColumnNum].classList.remove("amt-bet-table");}
    }
}

const highlightMinusColumn = () => {
  
  if (creditDisplay === 0) {
    payoutTableColumn = 0
  } else {
  payoutTableColumn = creditDisplay -1 ;}

  for (let i = 0; i < 11; i += 1) {
  
    let payoutTableColumnNum = i * 5 + payoutTableColumn;
  
    document.getElementsByClassName("betWinnings")[payoutTableColumnNum].classList.add("amt-bet-table");

    if (creditDisplay < 5) {
      let prevPayoutTableColumnNum;
      if (creditDisplay === 0) {
        prevPayoutTableColumnNum = i * 5 
    
      } else {
        prevPayoutTableColumnNum = payoutTableColumnNum + 1
      }
  
      document.getElementsByClassName("betWinnings")[prevPayoutTableColumnNum].classList.remove("amt-bet-table");}
    }
}

const removeColumnHighlight = () => {
  for (let i = 0; i < 11; i += 1) {
    let z = i * 5 + payoutTableColumn
   document.getElementsByClassName("betWinnings")[z].classList.remove("amt-bet-table");
  }

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
      let fullCardName = `${rankCounter}`;

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
const createEmptyCardElement= () => {
  cardContainer.innerHTML = "";

  for (let i = 0; i < 5; i += 1) {

    const indivCardContainer = document.createElement('div');
    indivCardContainer.classList.add('indiv-card-container');

    const holdMessage = document.createElement('div');
    holdMessage.classList.add('hold-message');
    holdMessage.innerHTML = '';
    
    const card = document.createElement('div');
    card.classList.add('card');

    const flipCard = document.createElement('div');
    flipCard.classList.add('flipcard');
    
    const backOfCard = document.createElement('div');

    let pngCardBack = "back_of_card.png"
    let pngCardBackSrc = "<img src=cards_png/" + pngCardBack + ">"
    backOfCard.innerHTML += pngCardBackSrc;
    backOfCard.classList.add('cardback');
    flipCard.appendChild(backOfCard);
    card.appendChild(flipCard);

    const frontOfCard = document.createElement('div');
    frontOfCard.classList.add('cardfront');
    flipCard.appendChild(frontOfCard);

    indivCardContainer.appendChild(holdMessage);
    indivCardContainer.appendChild(card);

    cardContainer.appendChild(indivCardContainer);

  }
}

const createCardElement= () => {
  
  for (let i = 0; i < 5; i += 1) {

    const frontOfCard = document.querySelector(`#card-container > div:nth-child(${i+1}) > div.card > div > div.cardfront`);
    frontOfCard.innerHTML = "";
 
    let pngCardFront = `${playerHand[i].fullname}_of_${playerHand[i].suit}.png`;
    let pngCardFrontSrc = "<img src=cards_png/" + pngCardFront + ">" ;
    frontOfCard.innerHTML += pngCardFrontSrc;
    
    const card = document.querySelector(`#card-container > div:nth-child(${i+1}) > div.card`);

    const holdMessage = document.querySelector(`#card-container > div:nth-child(${i+1}) > div.hold-message`);

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
  highlightRow(); 
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
    
    /*
    if (canFlipCard) {
      for (let i = 0; i < 5; i += 1) {
      const flipCard = document.querySelector(`#card-container > div:nth-child(${i+1}) > div.card > div`)
      flipCard.classList.add('turncard');
      cardFacingUp = true;
      }
    } else if (canFlipCard && cardFacingUp) {

      for (let i = 0; i < 5; i += 1) {
      const flipCard = document.querySelector(`#card-container > div:nth-child(${i+1}) > div.card > div`)
      flipCard.classList.add('turncard');
      }
    }*/


      for (let i = 0; i < 5; i += 1) {
        const flipCard = document.querySelector(`#card-container > div:nth-child(${i+1}) > div.card > div`)
      flipCard.classList.toggle('turncard');
    }



  winningCombinationDisplay.innerText = "Select cards to hold and press draw";
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

  if (gotRowHighlight) {
    document.querySelector(`#payout-table-container > table > tbody > tr:nth-child(${payoutTableRowNum})`).classList.remove("amt-bet-table");
  }

  if (creditDisplay < 5 && canClickCreditsBtn && (playerCredits-creditDisplay > 0)) {
    creditDisplay += 1;
    creditsToInsert.innerText = creditDisplay + " credits";
    
    if (gotColumnHighlight) { // this help to cap column highlight at 5
      removeColumnHighlight();
      gotColumnHighlight = false;
    }

    gotColumnHighlight = true;
    highlightAddColumn();

  } else if (creditDisplay < 5 && canClickCreditsBtn && (playerCredits-creditDisplay === 0) && playerCredits !== 0) {
    displayGameMessage("not enough credits");
  } else if (playerCredits === 0) {
    displayGameMessage("no credits left")
  }

})

minusCreditBtn.addEventListener('click', () => {

  if (gotColumnHighlight) {
    removeColumnHighlight();
    gotColumnHighlight = false;
  }

  if (gotRowHighlight) {
    document.querySelector(`#payout-table-container > table > tbody > tr:nth-child(${payoutTableRowNum})`).classList.remove("amt-bet-table");
  }

  if (creditDisplay > 0 && canClickCreditsBtn) {
    creditDisplay -= 1;
    creditsToInsert.innerText = creditDisplay + " credits";
    highlightMinusColumn();
    displayGameMessage("insert credits to begin");
  }

  if (creditDisplay === 0) {
    displayGameMessage("insert credits to begin");
  }
})


// ====== INIT GAME =====
generatePayoutTable();
createEmptyCardElement();
