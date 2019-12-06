const {ApiPromise, WsProvider} = require('@polkadot/api');
const Keyring = require('@polkadot/keyring').default;
const {hexToU8a} = require('@polkadot/util/hex');
const {createType} = require("@polkadot/types/codec/create");
const {TypeRegistry} = require('@polkadot/types/codec/create/registry');
// const tools = require(__dirname + "/../util/tools");
const rTypes =
    {
        "Bloom": "[u8; 256]",
        "EpochDuration": "u64",
        "EraIndex": "u32",
        "TimeStamp": "u64",
        "RingBalanceOf": "u128",
        "KtonBalanceOf": "u128",
        "ExtendedBalance": "u128",
        "EthBlockNumber": "u64",
        "StakingBalance": {
            "_enum": {
                "Ring": "RingBalanceOf",
                "Kton": "KtonBalanceOf"
            }
        },
        "IndividualExposure": {
            "who": "AccountId",
            "value": "ExtendedBalance"
        },
        "Exposure": {
            "total": "ExtendedBalance",
            "own": "ExtendedBalance",
            "others": "Vec<IndividualExposure>"
        },
        "ValidatorPrefs": {
            "node_name": "Vec<u8>",
            "unstake_threshold": "Compact<u32>",
            "validator_payment_ratio": "Compact<u32>"
        },
        "StakingLedger": {
            "stash": "AccountId",
            "active_ring": "Compact<RingBalanceOf>",
            "active_deposit_ring": "Compact<RingBalanceOf>",
            "active_kton": "Compact<KtonBalanceOf>",
            "deposit_items": "Vec<TimeDepositItem>",
            "ring_staking_lock": "StakingLock",
            "kton_staking_lock": "StakingLock"
        },
        "TimeDepositItem": {
            "value": "Compact<RingBalanceOf>",
            "start_time": "Compact<Moment>",
            "expire_time": "Compact<Moment>"
        },
        "BalanceLock": {
            "id": "LockIdentifier",
            "withdraw_lock": "WithdrawLock",
            "reasons": "WithdrawReasons"
        },
        "WithdrawLock": {
            "_enum": {
                "Normal": "NormalLock",
                "WithStaking": "StakingLock"
            }
        },
        "NormalLock": {
            "amount": "u128",
            "until": "Moment"
        },
        "StakingLock": {
            "staking_amount": "u128",
            "unbondings": "Vec<NormalLock>"
        },
        "EthHeader": {
            "parent_hash": "H256",
            "timestamp": "u64",
            "number": "EthBlockNumber",
            "auth": "H160",
            "transaction_root": "H256",
            "uncles_hash": "H256",
            "extra_data": "Bytes",
            "state_root": "H256",
            "receipts_root": "H256",
            "log_bloom": "Bloom",
            "gas_used": "U256",
            "gas_limit": "U256",
            "difficulty": "U256",
            "seal": "Vec<Bytes>",
            "hash": "Option<H256>"
        },
        "BestBlock": {
            "height": "EthBlockNumber",
            "hash": "H256",
            "total_difficulty": "U256"
        },
        "H64": {
            "_struct": "[u8; 8]"
        },
        "BlockDetails": {
            "height": "EthBlockNumber",
            "hash": "H256",
            "total_difficulty": "U256"
        },
        "LogEntry": {
            "address": "H160",
            "topics": "Vec<H256>",
            "data": "Bytes"
        },
        "Receipt": {
            "gas_used": "U256",
            "log_bloom": "Bloom",
            "logs": "Vec<LogEntry>",
            "outcome": "TransactionOutcome"
        },
        "TransactionOutcome": {
            "_enum": {
                "Unknown": null,
                "StateRoot": "H256",
                "StatusCode": "u8"
            }
        },
        "ActionRecord": {
            "index": "u64",
            "proof": "Vec<u8>",
            "header_hash": "H256"
        },
    };

let registry = new TypeRegistry();
registry.register(rTypes);
const keypair = new Keyring({type: 'ed25519'});
const account = keypair.addFromSeed(hexToU8a("0xb4ea691931096da6abb57b6695a0465bdf8bb265e509eab3340d96d25165f5a1"));

async function checkReceipt(param) {
    const app = async () => {
        try {
            const endpoint = process.env.CHAIN_WS_ENDPOINT || 'ws://35.234.35.49:9944/';
            const provider = new WsProvider(endpoint);
            let data = JSON.parse(param);
            console.log(data)
            const proof_record = (0, createType)(registry, 'ActionRecord', data);
            const api = await ApiPromise.create({provider: provider, registry: registry});
            const ex = api.tx.ethRelay.checkReceipt(proof_record);
            let tx = (await ex.signAndSend(account, {})).toHex();
            await api.disconnect();
            console.log("tx", tx)
            return tx
        } catch (e) {
            console.error(e)

        }
    };
    return app()
}


module.exports = {
    checkReceipt: checkReceipt,
};
