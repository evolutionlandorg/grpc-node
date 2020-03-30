const {ApiPromise, WsProvider} = require('@polkadot/api');
const {TypeRegistry} = require('@polkadot/types/create/registry');
// const Keyring = require('@polkadot/keyring');
// const {hexToU8a} = require('@polkadot/util/hex');
const tools = require('../util/tools');
const fs = require('fs');
const testKeyring = require('@polkadot/keyring/testingPairs').default;
const rTypes = JSON.parse(fs.readFileSync(__dirname + '/types.json', 'utf8'));


let registry = new TypeRegistry();
registry.register(rTypes);
const account = testKeyring().alice; //5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
// const keypair = new Keyring.default({type: 'ed25519'});
// const account = keypair.addFromSeed(hexToU8a(''));
const endpoint = process.env.CHAIN_WS_ENDPOINT || 'ws://35.234.9.96:9944';

let api;
let provider;

async function start() {
    api = await ApiPromise.create({provider: provider, registry: registry});
}

let module_map = {
    'ethBacking': 'RedeemFor',
    'ethRelay': 'EthHeader',
};

async function substrateSend(module, method, params) {
    const app = async () => {
        try {
            provider = new WsProvider(endpoint);
            let data = JSON.parse(params[0]);
            const data_params = registry.createType(module_map[module], data);
            await start();
            let args = [data_params];
            if (method === 'resetGenesisHeader' && params.length > 1) {
                args.push(params[1])
            }
            const ex = tools.trigger(api.tx, [module, method], args);
            let tx = await ex.signAndSend(account, {});
            console.log('tx', tx.toHex());
            // await api.disconnect();
            return tx.toHex()
        } catch (e) {
            console.error(e)

        }
    };
    return app()
}


module.exports = {
    substrateSend: substrateSend,
};
