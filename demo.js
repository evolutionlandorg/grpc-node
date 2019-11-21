const {ApiPromise, WsProvider} = require('@polkadot/api');
const {createType} = require('@polkadot/types');
const Keyring = require('@polkadot/keyring').default;
const {hexToU8a} = require('@polkadot/util/hex');

const tools = require(__dirname + "/util/tools");



let Sign = async function app() {
    const provider = new WsProvider("ws://121.199.60.87:9944/");
    const api = await ApiPromise.create({
        provider: provider,
    });
    const keypair = new Keyring({type: 'ed25519'});
    const account = keypair.addFromSeed(hexToU8a("0xa63f5e789ff7970da49e423dd66ae1b18c399a08e66c65734472c7db755d95cc"));
    const signedBlock = await api.rpc.chain.getBlock();
    const currentHeight = signedBlock.block.header.number.toBn().subn(1);
    const exERA = createType('ExtrinsicEra', {current: currentHeight, period: 10});

    let ex = tools.trigger(api.tx, ["balances", "transfer"], ["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", 1]);
    // const ex = api.tx.balances.transfer("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", 1);

    // let tx = await ex.signAndSend(keyring.alice, {
    //     blockHash: signedBlock.block.header.parentHash,
    //     era: exERA
    // }, logEvents.logEvents(done, api))

    let tx = (await ex.signAndSend(account, {
        blockHash: signedBlock.block.header.parentHash,
        era: exERA
    })).toHex();
    await api.disconnect();
    return tx
};


Sign().then(function (tx) {
    console.log("Get extrinsic Tx", tx)
});

