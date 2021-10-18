const fs = require("fs");
const csv = require("csv-parser");
const BigNumber = require('bignumber.js');
const {createObjectCsvWriter} = require('csv-writer');

var results = [];
let wallets = [];

const resultData = 'sorted_data.csv';
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

fs.createReadStream("filtered_data.csv")
.pipe(csv())
.on("data", (data) => {
    if(wallets.includes(data.wallet)) {
        console.log('loi trung nhau ', data.wallet);
    } else {
        results.push(data)
        wallets.push(data.wallet);
    }
})
.on("end", async () => {
    for(i=0; i< results.length; i++) {
        for(j=0; j<results.length; j++) {
            let a = new BigNumber(results[i].amount);
            let b = new BigNumber(results[j].amount);
            // console.log(a.minus(b).s);
            if(a.minus(b).s == 1) {
                let tmp = results[j];
                results[j] = results[i];
                results[i] = tmp;
            }
        }
    }

    // console.log(results);
    for (const data of results) {
        await writeToResultCSV(data.wallet, data.amount);
    }
});
