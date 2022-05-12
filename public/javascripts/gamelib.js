const width = 1000;
const height = 400;

var playerId;
var scoreBoard;

const CARDSPACE = 100;
var hand = [];
const HANDX = 50;
const HANDY = 250;
var table = [];
const TABLEX = 400;
const TABLEY = 250;
var opponent = [];
const OPX = 400;
const OPY = 50;

function preload() {

}

async function setup() {
    noLoop();
    let canvas = createCanvas(width, height);
    canvas.parent('game');
    let p1 = await requestPlayerMatchInfo(playerMatchId);
    let p2 = await requestPlayerMatchInfo(opponentMatchId);
    playerId = p1.ply_id;
    scoreBoard = new ScoreBoard(p1.ply_name, p2.ply_name, p1.pm_hp, p2.pm_hp, p1.pms_name, p2.pms_name); // we need to change the HP later
    await loadCards();
    setCardsState();
    loop();
}

function setCardsState() {
    for(let card of hand) card.disable();
    for(let card of table) card.disable();
    for(let card of opponent) card.disable();

    if (scoreBoard.getPlayerState() === "PlayCard") {
        for(let card of hand) card.enable();
    } else if (scoreBoard.getPlayerState() === "Attack") {
        for(let card of table) 
           if (!card.hasAttacked()) card.enable();
        if (returnSelected(table)) {
            for(let card of opponent) 
                if (card.getHp() > 0) card.enable();
        }
    }   
}



async function loadCards() {
    let myCards = await requestPlayerMatchDeck(playerId, playerMatchId);
    let opCards = await requestPlayerMatchDeck(playerId, opponentMatchId);
    let handPos = 0;
    hand = [];
    let tablePos = 0;
    table = [];
    let opPos = 0;
    opponent = [];
    for (let card of myCards) {
        if (card.cp_name === "Hand") {
            hand.push(new Card(card.deck_id,card.crd_name, card.deck_card_hp, false,
                HANDX + CARDSPACE * handPos, HANDY));
            handPos++;
        } else {
            table.push(new Card(card.deck_id,card.crd_name, card.deck_card_hp,
                card.cp_name === "TablePlayed",
                TABLEX + CARDSPACE * tablePos, TABLEY));
            tablePos++;
        }
    }
    for (let card of opCards) {
        opponent.push(new Card(card.deck_id,card.crd_name, card.deck_card_hp,
            card.cp_name === "TablePlayed",
            OPX + CARDSPACE * opPos, OPY));
        opPos++;
    }
}

function draw() {
    background(220);
    scoreBoard.draw();
    for (let card of table) card.draw();
    for (let card of hand) card.draw();
    for (let card of opponent) card.draw();

}
function mouseClicked() {
    let card;
    
    card = returnSelected(table);
    if (card) card.clicked(mouseX, mouseY);
    else for (let card of table) card.clicked(mouseX, mouseY);
    
    card = returnSelected(hand);
    if (card) card.clicked(mouseX, mouseY);
    else for (let card of hand) card.clicked(mouseX, mouseY);
    
    card = returnSelected(opponent);
    if (card) card.clicked(mouseX, mouseY);
    else for (let card of opponent) card.clicked(mouseX, mouseY);

    setCardsState();
}

function returnSelected(cardList) {
    for(let card of cardList) {
        if (card.isSelected()) return card;
    }
    return null;
}
