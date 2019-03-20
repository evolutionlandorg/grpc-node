const TronWeb = require('tronweb');
const HttpProvider = TronWeb.providers.HttpProvider;
let TronRpc = process.env.TronRpc || 'https://api.shasta.trongrid.io';
const fullNode = new HttpProvider(TronRpc);
const solidityNode = new HttpProvider(TronRpc);
const eventServer = TronRpc;
const ArenaAddress = "";

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
        return await ArenaContract.create().send({
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
