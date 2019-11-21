let PROTO_PATH = __dirname + '/protos/web3.proto';
let grpc = require('grpc');
let eth_sign = require(__dirname + '/lib/eth_sign');
let addressVerify = require(__dirname + '/lib/ethDerivedAddressVerify');
let land = require(__dirname + '/lib/land');
let arena = require(__dirname + '/lib/arenaSettlement');
const tx = require(__dirname + "/lib/sendAndSign");
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const readlineSync = require('readline-sync');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, false);
const web3_proto = grpc.loadPackageDefinition(packageDefinition).web3;
let GameSettlePrivateKey = "2948cdb483f925b8ac4516820277a142b3e75d5966fbae2c653b3afb84945fbe";

function SignedTypeMsg(call, callback) {
    callback(null, {message: eth_sign.ethSignTypedData(call.request.msg, call.request.private_key)});
}

function RecoverSignedTypeMsg(call, callback) {
    callback(null, {message: eth_sign.ethRecoverTypedSign(call.request.msg, call.request.signed)});
}

function EthDerivedAddressVerify(call, callback) {
    callback(null, {message: addressVerify.ethDerivedAddressVerify(call.request.extendedPublicKey, call.request.path, call.request.address)});
}

function RecoverPersonalSigned(call, callback) {
    callback(null, {message: eth_sign.ethRecoverPersonalSign(call.request.msg, call.request.signed)});
}

async function SignAndSendTransaction(call, callback) {
    await tx.SignAndSign(call.request.fn, call.request.param).then(function (hash) {
        callback(null, {message: hash});
    });
}

function DecodeTokenId(call, callback) {
    let landAbi = JSON.parse(fs.readFileSync(__dirname + '/contract/land.json', 'utf8'));
    land.decodeTokenId(landAbi, call.request.address, call.request.tokenId, (result) => {
        console.log("result", result);
        callback(null, {message: result});
    })
}

async function ApostleArenaSettlement(call, callback) {
    let chain = call.request.message;
    await arena.settleGame(chain, GameSettlePrivateKey).then(function (data) {
        console.log("settleGame", data);
        callback(null, {message: data});
    });
}

const getGameSettlePrivateKey = async () => {
    GameSettlePrivateKey = readlineSync.question('please input private key: ', {
        hideEchoBack: true // The typed text on screen is hidden by `*` (default).
    });
};

async function main() {
    if (process.env.GRPC_ENV === "production") {
        await getGameSettlePrivateKey();
    }
    let server = new grpc.Server();
    server.addService(web3_proto.EthWeb3.service, {
        SignedTypeMsg: SignedTypeMsg,
        RecoverSignedTypeMsg: RecoverSignedTypeMsg,
        DecodeTokenId: DecodeTokenId,
        EthDerivedAddressVerify: EthDerivedAddressVerify,
        RecoverPersonalSigned: RecoverPersonalSigned,
        ApostleArenaSettlement: ApostleArenaSettlement,
        SignAndSendTransaction: SignAndSendTransaction,
    });
    server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
    server.start();
    console.log("Server Start with port :50051")
}

main();
