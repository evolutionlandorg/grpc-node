const {createType} = require('@polkadot/types');
const Keyring = require('@polkadot/keyring').default;
const {hexToU8a} = require('@polkadot/util/hex');
const {ApiPromise, WsProvider} = require('@polkadot/api');
const tools = require(__dirname + "/../util/tools");
const signerSecretSeed = "0xa63f5e789ff7970da49e423dd66ae1b18c399a08e66c65734472c7db755d95cc"; //todo
const keyPair = new Keyring({type: 'ed25519'});
const account = keyPair.addFromSeed(hexToU8a(signerSecretSeed));

async function SignAndSign(method, param) {
    const app = async () => {
        try {
            const endpoint = process.env.CHAIN_WS_ENDPOINT || 'wss://crayfish.darwinia.network/';
            const provider = new WsProvider(endpoint);
            const api = await ApiPromise.create({
                provider: provider,
            });
            const signedBlock = await api.rpc.chain.getBlock();
            const currentHeight = signedBlock.block.header.number.toBn().subn(1);
            const exERA = createType('ExtrinsicEra', {current: currentHeight, period: 10});
            const ex = tools.trigger(api.tx, method, param);
            // const ex = api.tx.balances.transfer("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", 12345);
            let tx = (await ex.signAndSend(account, {
                blockHash: signedBlock.block.header.parentHash,
                era: exERA
            })).toHex();
            await api.disconnect();
            return tx
        } catch (e) {
            console.error(e)

        }
    };
    return app()
}


module.exports = {
    SignAndSign: SignAndSign,
};
