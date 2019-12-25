const {ApiPromise, WsProvider} = require('@polkadot/api');
const Keyring = require('@polkadot/keyring').default;
const {hexToU8a} = require('@polkadot/util/hex');
const {createType} = require("@polkadot/types/codec/create");
const {TypeRegistry} = require('@polkadot/types/codec/create/registry');
const rTypes =
    {
        "EpochDuration": "u64",
        "BalanceLock": {
            "id": "LockIdentifier",
            "withdraw_lock": "WithdrawLock",
            "reasons": "WithdrawReasons"
        },
        "NormalLock": {
            "amount": "Balance",
            "until": "Moment"
        },
        "StakingLock": {
            "staking_amount": "Balance",
            "unbondings": "Vec<NormalLock>"
        },
        "WithdrawLock": {
            "_enum": {
                "Normal": "NormalLock",
                "WithStaking": "StakingLock"
            }
        },
        "EthReceiptProof": {
            "index": "u64",
            "proof": "Bytes",
            "header_hash": "H256"
        },
        "BestBlock": {
            "height": "EthBlockNumber",
            "hash": "H256",
            "total_difficulty": "U256"
        },
        "BlockDetails": {
            "height": "EthBlockNumber",
            "hash": "H256",
            "total_difficulty": "U256"
        },
        "Bloom": {
            "_struct": "[u8; 256]"
        },
        "EthAddress": "H160",
        "EthBlockNumber": "u64",
        "EthHeader": {
            "parent_hash": "H256",
            "timestamp": "u64",
            "number": "EthBlockNumber",
            "auth": "EthAddress",
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
        "EthTransactionIndex": "(H256, u64)",
        "H64": {
            "_struct": "[u8; 8]"
        },
        "LogEntry": {
            "address": "EthAddress",
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
        "EraIndex": "u32",
        "Exposure": {
            "total": "Compact<Power>",
            "own": "Compact<Power>",
            "others": "Vec<IndividualExposure>"
        },
        "IndividualExposure": {
            "who": "AccountId",
            "value": "Compact<Power>"
        },
        "Kton": "Balance",
        "NominatorReward": {
            "who": "AccountId",
            "amount": "Compact<Balance>"
        },
        "Power": "Balance",
        "Ring": "Balance",
        "SlashJournalEntry": {
            "who": "AccountId",
            "amount": "Compact<Power>",
            "own_slash": "Compact<Power>"
        },
        "StakingBalances": {
            "_enum": {
                "Ring": "Balance",
                "Kton": "Balance"
            }
        },
        "StakingLedger": {
            "stash": "AccountId",
            "active_ring": "Compact<Balance>",
            "active_deposit_ring": "Compact<Balance>",
            "active_kton": "Compact<Balance>",
            "deposit_items": "Vec<TimeDepositItem>",
            "ring_staking_lock": "StakingLock",
            "kton_staking_lock": "StakingLock"
        },
        "TimeDepositItem": {
            "value": "Compact<Balance>",
            "start_time": "Compact<Moment>",
            "expire_time": "Compact<Moment>"
        },
        "ValidatorPrefs": {
            "node_name": "Bytes",
            "validator_payment_ratio": "Compact<u32>"
        },
        "ValidatorReward": {
            "who": "AccountId",
            "amount": "Compact<Balance>",
            "nominators_reward": "Vec<NominatorReward>"
        }
    };

let registry = new TypeRegistry();
registry.register(rTypes);
const keypair = new Keyring({type: 'ed25519'});
const account = keypair.addFromSeed(hexToU8a("0x126ea2cc4f0c554a860455d1689839f5b53f8efa4d1cecef6dc56ea915d579b6"));

async function checkReceipt(param) {
    const app = async () => {
        try {
            const endpoint = process.env.CHAIN_WS_ENDPOINT || 'ws://35.234.35.49:9944/';
            const provider = new WsProvider(endpoint);
            let data = JSON.parse(param);
            console.log(data)
            const proof_record = (0, createType)(registry, 'EthReceiptProof', data);
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
