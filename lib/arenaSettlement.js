const TronWeb = require('tronweb');
const HttpProvider = TronWeb.providers.HttpProvider;
let TronRpc = process.env.TronRpc || 'https://api.shasta.trongrid.io';
const fullNode = new HttpProvider(TronRpc);
const solidityNode = new HttpProvider(TronRpc);
const eventServer = TronRpc;
let ArenaAddress = process.env.GRPC_ENV === "production" ? "416f4960bbfb07b65169f0c12d592c323de9641532" : "410ff43e8c833793024ed86ce02f1e29848ca28fb6";

function settleGame(chain, privateKey) {
    switch (chain) {
        case "Tron":
            return settleGameTron(privateKey);
        default:
            return ""
    }
}

function settleGameTron(privateKey) {
    const app = async () => {
        const tronWeb = new TronWeb(
            fullNode,
            solidityNode,
            eventServer,
            privateKey
        );

        tronWeb.setDefaultBlock('latest');

        const nodes = await tronWeb.isConnected();
        const connected = !Object.entries(nodes).map(([name, connected]) => {
            if (!connected)
                console.error(`Error: ${name} is not connected`);
            return connected;
        }).includes(false);
        if (!connected)
            return "";
        let ArenaContract = await tronWeb.contract().at(ArenaAddress);
        let round = await ArenaContract.getLastRound().call();
        try {
            let winner = round[1];
            if (winner !== "410000000000000000000000000000000000000000") {
                return "settle complete"
            }
        } catch (e) {
            return "err"
        }
        return await ArenaContract.startLastBattleTwoParty().send({
            feeLimit: 1000000,
            callValue: 0,
            shouldPollResponse: false
        });
    };
    return app()
}


module.exports = {
    settleGame
};
