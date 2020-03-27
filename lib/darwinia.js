const {ApiPromise, WsProvider} = require('@polkadot/api');
const {TypeRegistry} = require('@polkadot/types/create/registry');
const Keyring = require('@polkadot/keyring');
const {hexToU8a} = require('@polkadot/util/hex');
const tools = require("../util/tools");
const testKeyring = require("@polkadot/keyring/testingPairs").default;
const rTypes =
    {
        "RingBalance": "Balance",
        "KtonBalance": "Balance",
        "MomentT": "Moment",
        "Power": "u32",
        "DepositId": "U256",
        "StakingBalanceT": "StakingBalance",
        "StakingBalance": {
            "_enum": {
                "RingBalance": "Balance",
                "KtonBalance": "Balance"
            }
        },
        "StakingLedgerT": "StakingLedger",
        "StakingLedger": {
            "stash": "AccountId",
            "active_ring": "Compact<Balance>",
            "active_deposit_ring": "Compact<Balance>",
            "active_kton": "Compact<Balance>",
            "deposit_items": "Vec<TimeDepositItem>",
            "ring_staking_lock": "StakingLock",
            "kton_staking_lock": "StakingLock",
            "total": "Compact<Balance>",
            "active": "Compact<Balance>",
            "unlocking": "Vec<UnlockChunk>"
        },
        "TimeDepositItem": {
            "value": "Compact<Balance>",
            "start_time": "Compact<Moment>",
            "expire_time": "Compact<Moment>"
        },
        "RewardDestination": {
            "_enum": {
                "Staked": "Staked",
                "Stash": null,
                "Controller": null
            }
        },
        "Staked": {
            "promise_month": "Moment"
        },
        "Exposure": {
            "own_ring_balance": "Compact<Balance>",
            "own_kton_balance": "Compact<Balance>",
            "own_power": "Power",
            "total_power": "Power",
            "others": "Vec<IndividualExposure>"
        },
        "IndividualExposure": {
            "who": "AccountId",
            "ring_balance": "Compact<Balance>",
            "kton_balance": "Compact<Balance>",
            "power": "Power"
        },
        "FullIdentification": "Exposure",
        "ValidatorReward": {
            "who": "AccountId",
            "amount": "Compact<Balance>",
            "nominators_reward": "Vec<NominatorReward>"
        },
        "NominatorReward": {
            "who": "AccountId",
            "amount": "Compact<Balance>"
        },
        "RK": {
            "r": "Balance",
            "k": "Balance"
        },
        "RKT": "RK",
        "BalanceLock<Balance, BlockNumber>": {
            "id": "LockIdentifier",
            "lock_for": "LockFor",
            "lock_reasons": "LockReasons"
        },
        "LockFor": {
            "_enum": {
                "Common": "Common",
                "Staking": "StakingLock"
            }
        },
        "Common": {
            "amount": "Balance"
        },
        "StakingLock": {
            "staking_amount": "Balance",
            "unbondings": "Vec<Unbonding>"
        },
        "LockReasons": {
            "_enum": {
                "Fee": null,
                "Misc": null,
                "All": null
            }
        },
        "Unbonding": {
            "amount": "Balance",
            "moment": "BlockNumber"
        },
        "AccountData": {
            "free_ring": "Balance",
            "free_kton": "Balance",
            "reserved_ring": "Balance",
            "reserved_kton": "Balance",
            "free": "Balance",
            "reserved": "Balance",
            "misc_frozen": "Balance",
            "fee_frozen": "Balance"
        },
        "EthBlockNumber": "u64",
        "EthAddress": "H160",
        "EthTransactionIndex": "(H256, u64)",
        "HeaderInfo": {
            "total_difficulty": "U256",
            "parent_hash": "H256",
            "number": "EthBlockNumber"
        },
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
        "Bloom": "[u8; 256]",
        "Receipt": {
            "gas_used": "U256",
            "log_bloom": "Bloom",
            "logs": "Vec<LogEntry>",
            "outcome": "TransactionOutcome"
        },
        "EthReceiptProof": {
            "index": "u64",
            "proof": "Bytes",
            "header_hash": "H256"
        },
        "RedeemFor": {
            "_enum": {
                "Ring": "EthReceiptProof",
                "Kton": "EthReceiptProof",
                "Deposit": "EthReceiptProof"
            }
        },
        "AddressT": "EthereumAddress",
        "TronAddress": "EthereumAddress",
        "OtherSignature": {
            "_enum": {
                "Eth": "EcdsaSignature",
                "Tron": "EcdsaSignature"
            }
        },
        "OtherAddress": {
            "_enum": {
                "Eth": "EthereumAddress",
                "Tron": "EthereumAddress"
            }
        },
        "H": "Hash",
        "MerkleMountainRangeRoot": {
            "data": "Hash"
        },
        "DigestItem": {
            "_enum": {
                "Other": "Bytes",
                "AuthoritiesChange": "Vec<AuthorityId>",
                "ChangesTrieRoot": "Hash",
                "SealV0": "SealV0",
                "Consensus": "Consensus",
                "Seal": "Seal",
                "PreRuntime": "PreRuntime",
                "Unknown7": "Bytes",
                "Unknown8": "Bytes",
                "Unknown9": "Bytes",
                "Unknown10": "Bytes",
                "Unknown11": "Bytes",
                "Unknown12": "Hash",
                "Unknown13": "Bytes",
                "Unknown14": "Bytes",
                "Unknown15": "Bytes",
                "Unknown16": "Bytes",
                "Unknown17": "Bytes",
                "MerkleMountainRangeRoot": "Hash"
            }
        },
        "ValidatorPrefs": {
            "commission": "Compact<Balance>"
        }
    }

let registry = new TypeRegistry();
registry.register(rTypes);
const account = testKeyring().alice; //5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
// const keypair = new Keyring.default({type: 'ed25519'});
// const account = keypair.addFromSeed(hexToU8a(""));
const endpoint = process.env.CHAIN_WS_ENDPOINT || 'ws://35.234.9.96:9944';

let api;
let provider;

async function start() {
    api = await ApiPromise.create({provider: provider, registry: registry});
}

let module_map = {
    "ethBacking": "RedeemFor",
    "ethRelay": "EthHeader",
};

async function substrateSend(module, method, params) {
    const app = async () => {
        try {
            provider = new WsProvider(endpoint);
            let data = JSON.parse(params[0]);
            const data_params = registry.createType(module_map[module], data);
            await start();
            let args = [data_params];
            if (method === "resetGenesisHeader" && params.length > 1) {
                args.push(params[1])
            }
            const ex = tools.trigger(api.tx, [module, method], args);
            let tx = await ex.signAndSend(account, {});
            console.log("tx", tx.toHex());
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
