let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let fs  = require('fs');
let Web3 = require("web3");

let web3 = new Web3();

let app = express();


/* Begin convenience constants block */
const VOTER_1 = 1; // box for your stempas
const VOTER_2 = 2;
const VOTER_3 = 3;

const NOISE_1 = 4;
const NOISE_2 = 5;

const STEMPAS = 6;
const STEMBILJET = 7;

const BALLOT_offset = 7;
const BALLOT_1 = 1+ BALLOT_offset;
const BALLOT_2 = 2+ BALLOT_offset;
const BALLOT_3 = 3+ BALLOT_offset;

const CANDIDATE_offset = 10;

const CANDIDATE_1 = 11;
const CANDIDATE_2 = 12;

const BALLOTS = [BALLOT_1, BALLOT_2, BALLOT_3];
const CANDIDATES = [CANDIDATE_1, CANDIDATE_2];
const VOTERS = [VOTER_1, VOTER_2, VOTER_3];

let get_wallet = (idx) => { return web3.eth.accounts[idx+1]; };

let balance = (acct) => { return web3.fromWei(web3.eth.getBalance(acct), 'ether').toNumber()};

var stempas;
var stembiljet;

(function setup()  {
    app.use(cors());
    app.set('port', (process.env.PORT || 3000));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

    stempas = get_wallet(STEMPAS);
    stembiljet = get_wallet(STEMBILJET);
    //let stempas = get_wallet(STEMPAS);
    //let stembiljet = get_wallet(STEMBILJET);
    if (balance(stempas) <= 100){
        // assume that we started with a default initialised testrpc blockchain.
        for (var address of web3.eth.accounts) {
            let num = balance(address);
            console.log("bal of", address, num);
            web3.eth.sendTransaction({from: address, to:stempas, value: web3.toWei(num), gasLimit: 21000, gasPrice: 0});
            console.log("bal of", stempas, balance(stempas));
        }
        //let half_bal = balance(stempas)/2;
        //web3.eth.sendTransaction({from: stempas, to: stembiljet, value: web3.toWei(half_bal), gasLimit: 21000, gasPrice: 0});
        console.log("bal of stempas", stempas, balance(stempas));
        console.log("bal of stembiljet", stempas, balance(stembiljet));
    }

    //check funds:
})();

/* End convenience constants block */

app.post('/api/cashStempas', function (req, res) {
    // Exchange your valid stempas for a (anonymous :D)
    // stembiljet structure is:

    // stempas_id : 1 | 2 | 3 (or whatever you received from /verifyPerson)

    // tx: (would normally be a blind-signing raw tx to an actual address you
    // control), but for now we can just pass along a wallet idx that the client
    // can use. so for demo: BALLOT_1 | BALLOT_2 | BALLOT_3


    // response structure:
    // id: 1 | 2 | 3

    // TODO: Everything. Mostly the one-time blind signing, and administrating
    // your very own wallet.
    if (BALLOTS.includes(req.body.tx + BALLOT_offset) && VOTERS.includes(req.body.stempas_id)){
        let voter_wallet = get_wallet(req.body.stempas_id);
        let ballot_wallet = get_wallet(req.body.tx);

        // TODO integrate with contract
        //voter_wallet = get_wallet(req.body.id); // TODO should actually be certified by client in prod.
        web3.eth.sendTransaction({from: voter_wallet, to: stembiljet, value: web3.toWei(100), gasLimit: 21000, gasPrice: 0});
        // TODO: Validate the validity of the vote token.

        web3.eth.sendTransaction({from: stembiljet, to: ballot_wallet, value: web3.toWei(100), gasLimit: 21000, gasPrice: 0});
        // ^- this should be the blind signed transaction instead. It should
        // only be _signed_ server side, and then completed and uploaded to the
        // blockchain by the client/voter 
	      console.log('request user action', req.body);
	      res.send({id: req.body.tx});

    } else { // invalid ballot
        // oh noes
        console.error("inaccessable");
        res.status(500).send('You took a wrong turn somewhere...');
    }
	  console.log('request user action', req.body);
	  res.send('POST request to the user API');
});

app.post('/api/verifyPerson', function (req, res) {
    // Dummy call for now: someone just says they are a person and gets a
    // stempas.

    // structure (req.body) is:
    //  id: 1 | 2 | 3
    // response is:
    //  id: 1 | 2 | 3 (probably the same one XD, but this is your "signed" stempas)

	  console.log('request user action', req.body);
    if (VOTERS.includes(req.body.id)){
        voter_wallet = get_wallet(req.body.id); // TODO should actually be certified by client in prod.
        web3.eth.sendTransaction({from: stempas, to: voter_wallet , value: web3.toWei(100), gasLimit: 21000, gasPrice: 0});
	      res.send({id: req.body.id});
    } else {
        console.error("inaccessable");
        res.status(500).send('You took a wrong turn somewhere...');
    }
});

app.post('/api/vote', function (req, res) {
    // TODO: this would normally be a call from the client (voter) to a
    // smartcontract on the blockchain instead of involving filthy third parties
    /* A vote (body) is structured like:
       kandidaat: 1 | 2
       stembiljet_id: 1 | 2 | 3
       */
    if (BALLOTS.includes(req.body.stembiljet_id + BALLOT_offset) && CANDIDATES.includes(req.body.kandidaat + CANDIDATE_offset)){
        let ballot_wallet = get_wallet(req.body.stembiljet_id + BALLOT_offset);
        let candidate_wallet = get_wallet(req.body.kandidaat + CANDIDATE_offset);

        web3.eth.sendTransaction({from: ballot_wallet, to: candidate_wallet , value: web3.toWei(100), gasLimit: 21000, gasPrice: 0});
	      console.log('request user action', req.body);
	      res.send('YEAAAAAH');
    } else {
        console.error("inaccessable");
        res.status(500).send('You took a wrong turn somewhere...');
    }
});

app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});


