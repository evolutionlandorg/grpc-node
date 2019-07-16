'use strict';
let sigUtil = require('eth-sig-util');
const ethUtil = require('ethereumjs-util');
const createKeccakHash = require('keccak');
const secp256k1 = require('secp256k1');

function signRetFromHex(signHex) {
    let signRaw = ethUtil.rlp.decode(signHex);
    let ret = {};
    ret.v = signRaw[0][0];
    ret.r = signRaw[1];
    ret.s = signRaw[2];
    return ret;
}

function generateAddress(publicKey) {
    return "0x" + createKeccakHash('keccak256').update(publicKey.slice(1)).digest('hex').slice(-40);
}

function recovery(r, s, v, msg) {
    let signature = Buffer.concat([Buffer.from(r), Buffer.from(s)], 64);
    let recovery = v - 27;
    if (recovery !== 0 && recovery !== 1) {
        throw new Error('Invalid signature v value')
    }
    let hash = createKeccakHash('keccak256').update(msg).digest();
    let senderPubKey = secp256k1.recover(hash, signature, recovery);
    return secp256k1.publicKeyConvert(senderPubKey, false);
}

module.exports = {
    ethSignTypedData(params, private_key) {
        try {
            let data = JSON.parse(params);
            const msgParams = {
                "data": data
            };
            return sigUtil.signTypedData(ethUtil.toBuffer(private_key), msgParams);
        } catch (err) {
            return ""
        }
    },
    ethRecoverTypedSign(params, signed) {
        try {
            let data = JSON.parse(params);
            const msgParams = {
                "data": data,
                "sig": signed
            };
            return sigUtil.recoverTypedSignature(msgParams);
        } catch (err) {
            return ""
        }
    },

    ethRecoverPersonalSign(params, signed) {
        try {
            if (signed.length === 140) {
                let signRet = signRetFromHex(signed);
                let pubKeyBuffer = recovery(signRet.r, signRet.s, signRet.v, params);
                return generateAddress(pubKeyBuffer)
            } else {
                const msgParams = {
                    "data": params,
                    "sig": signed
                };
                return sigUtil.recoverPersonalSignature(msgParams);
            }
        } catch (err) {
            return ""
        }
    },


};
