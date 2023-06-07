const randomNumber = require("random-number-csprng");
const { createHmac } = require("crypto");
const { createECDH } = require("crypto");
const prompt = require("prompt-sync")({ sigint: true });
const Table = require('cli-table');

const ecdh = createECDH("secp256k1");
const secretKey = ecdh.generateKeys("hex");
const moves = process.argv.slice(2);

class showRules {

  getRules() {

    let request = "";

    while(true) {
      console.log( "Available moves: \n" +  moves.map((el, i) => `${i + 1} - ${el} `).join("\n") + `\n0 - exit \n? - help`);
      request = prompt("Please enter your choice: ");
      if(request === "?") {
        let table = new showTable();
        table.getTable();
      };

      if(+request <= moves.length) {
        break;
      }

      if (+request < 0) {
        break;
      }
    }
    return request;
  }

}

class showTable {

  getTable() {

    let results = [];

    for (let i = 0; i < moves.length; i++) {
      results[0] = "Draw";
      if (i > 0 && i < moves.length / 2) {
        results[i] = "Lose";
      } else if (i > moves.length / 2) {
        results[i] = "Win";
      }
    }

    let resultsVertical = [];

    for (let i = 0; i < moves.length; i++) {
      results.unshift(moves[i]);
      resultsVertical.push([...results]);
      results.shift();
      results.unshift(results.pop());
    }

    let newTable = new Table({
      head: [`v User/ PC >`, ...moves]
    });

    resultsVertical.map((item) => {
      newTable.push([item[0], ...item.slice(1)]);
    })

    console.log(newTable.toString());
  }

}

class Hmac{

  constructor(compMove) {
    this.compMove = compMove;
  }

  getHmac() {

    let hmac = createHmac("SHA3-256", secretKey).update(moves[this.compMove]).digest("hex");
    console.log(`HMAC: ${hmac}`);
    
  }

}

class RockPaperScissors {

  async game() {

    if (moves.length < 3 || moves.length % 2 === 0) {
      console.log("Insufficient or even amount of moves");
      return;
    }

    const duplicates = moves.filter((item, index) => index !== moves.indexOf(item));

    if (duplicates.length > 0) {
      console.log("There should be no duplicate values !");
      return;
    }

    const compMove = await randomNumber(0, moves.length - 1);
  
    let comp = new Hmac(compMove);
    comp.getHmac();

    const playerMove = new showRules().getRules();

    if(+playerMove === 0) {
      return;
    }

    console.log(`Your move: ${moves[playerMove - 1]}`);
    console.log(`Computer move: ${moves[compMove]}`);

    if(+playerMove - 1 === compMove) {
      console.log("Draw!");
    } else if (
      (+playerMove - 1 - compMove > 0 &&
        +playerMove - 1 - compMove < moves.length / 2) ||
      (compMove - +playerMove + 1 > 0 &&
        compMove - +playerMove + 1 > moves.length / 2)
    ) {
      console.log("You Win!");
    } else {
      console.log("You Lose!");
    }
    console.log(`HMAC key: ${secretKey}`);

  }

}

new RockPaperScissors().game();