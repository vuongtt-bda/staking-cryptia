const fs = require("fs");
const csv = require("csv-parser");
const BigNumber = require('bignumber.js');
const {createObjectCsvWriter} = require('csv-writer');

var results = {};
let wallets = [];

const resultData = 'filtered_data.csv';
const pathResult = `./${resultData}`;

const csvWriter = createObjectCsvWriter({
    path: pathResult,
    header: [{id: 'wallet', title: 'wallet'}, {id: 'amount', title: 'amount'}],
    alwaysQuote: false,
    // append: true
})

async function writeToResultCSV(wallet, amount) {
    let row = [{wallet: wallet, amount: amount}];
    await csvWriter.writeRecords(row);
}

fs.createReadStream("total.csv")
.pipe(csv())
.on("data", (data) => {
    // console.log(data.wallet);
    if(wallets.includes(data.wallet)) {
        let a = new BigNumber(results[data.wallet]);
        let b = new BigNumber(data.amount);
        results[data.wallet] = a.plus(b).toFixed();
        // console.log(data.wallet);
    } else {
        results[data.wallet] = data.amount;
        wallets.push(data.wallet);
    }
})
.on("end", async () => {
    for (const [key, value] of Object.entries(results)) {
        // console.log(`${key}: ${value}`);
        await writeToResultCSV(key, value);
    }
    // console.log('edn');
});