require('dotenv').config();
const {createObjectCsvWriter} = require('csv-writer');
const util = require('util');
const waitFor = util.promisify(setTimeout);
const BigNumber = require('bignumber.js');

const Web3 = require('web3');
const web3 = new Web3('https://speedy-nodes-nyc.moralis.io/f3fa9d801f9599933b8466d9/bsc/mainnet');
// const web3 = new Web3('https://bsc-dataseed.binance.org/');

const abi  = require('./locked.json');
const addr = process.env.ADDR;
const contract = new web3.eth.Contract(abi, addr);

const resultData = 'collected_data.csv';
const errorData = 'errorCollectWallet.csv';
const pathResult = `./${resultData}`;
const pathErr = `./${errorData}`;

let wallets = {};
let tx = [];

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

const csvWriterErr = createObjectCsvWriter({
    path: pathErr,
    header: [{id: 'wallet', title: 'wallet'}],
    alwaysQuote: false,
})

async function writeToErrorCSV(wallet_address) {
    await csvWriterErr.writeRecords([{wallet: wallet_address}])
}

async function processStakingEvent(blockStart, blockEnd) {
    // console.log('\tScan from ', blockStart, ' to ', blockEnd)
    const pastEvents = await contract.getPastEvents('Deposit', {
        fromBlock: blockStart,
        toBlock: blockEnd
    })

    if (pastEvents == null || pastEvents.length == 0) {
        // console.log('\tDont have Deposit event from ', blockStart, ' to ', blockEnd);
        return;
    }

    for (const pastEvent of pastEvents) {
        // console.log(pastEvent);
        console.log('EXIST AT: ' , pastEvent.transactionHash);
        // // await writeToResultCSV(pastEvent.returnValues.user, pastEvent.returnValues.amount);
        if(!tx.includes(pastEvent.transactionHash)) {
            if( pastEvent.returnValues.user in wallets ) {
                let a = new BigNumber(wallets[pastEvent.returnValues.user]);
                let b = new BigNumber(pastEvent.returnValues.amount);
                wallets[pastEvent.returnValues.user] = a.plus(b).toFixed();
            } else {
                wallets[pastEvent.returnValues.user] = new BigNumber(pastEvent.returnValues.amount).toFixed();
            }
        }
        tx.push(pastEvent.transactionHash);
    }
}

async function scan() {
    let blockStart = parseInt(process.env.BLOCK_START);
    let blockStop  = parseInt(process.env.BLOCK_STOP);
    // let blockStart = 11819374;
    // let blockStop  = 11824680;

    while (true) {
        try {
            // console.log('*************************************************************')
            // console.log('Block start: ' + blockStart);

            const blockEnd = Math.min(blockStop, blockStart + 800);
            // console.log('Block end: ' + blockEnd);

            await processStakingEvent(blockStart, blockEnd)

            await waitFor(1000);

            blockStart = blockEnd;
            if (blockStart === blockStop) {
                break;
            }
        } catch (e) {
            console.error(e.message)
        }
    };

    for (const [key, value] of Object.entries(wallets)) {
        // console.log(`${key}: ${value}`);
        await writeToResultCSV(key, value);
    }
}

scan();