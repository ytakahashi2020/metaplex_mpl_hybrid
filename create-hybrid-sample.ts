import { clusterApiUrl, Connection } from "@solana/web3.js";
import {
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  mplHybrid,
  MPL_HYBRID_PROGRAM_ID,
  initEscrowV1,
} from "@metaplex-foundation/mpl-hybrid";
import {
  findAssociatedTokenPda,
  SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@metaplex-foundation/mpl-toolbox";
import {
  string,
  publicKey as publicKeySerializer,
} from "@metaplex-foundation/umi/serializers";
import bs58 from "bs58";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile(
  "/Users/ytakahashi/.config/solana/id.json"
);

console.log(`address is ${user.publicKey.toBase58()}`);

const umi = createUmi(connection.rpcEndpoint);

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

umi.use(mplTokenMetadata());

umi.use(mplHybrid());

const ESCROW_NAME = "Tttt";

const COLLECTION = publicKey("D4Exy8geVpngstoPNVkdhNVFrLDCZERL9ZFkExVoD7kz");
// const COLLECTION = publicKey("ACDdjZQ2XaaQF31wPBvcEgsncxx4yC1sPLzPAm92ogKB");

const TOKEN = publicKey("912ptN5edighDNWKxuoq3TyRTndNzWnarp8PZ3opFy9r"); // THE TOKEN TO BE DISPENSED
// const TOKEN = publicKey("94G4tMuSWBsvya52fM6PKunZisEpEneMvUYYh5awsJk1"); // ÷THE TOKEN TO BE DISPENSED

const BASE_URI =
  "https://rose-leading-cricket-429.mypinata.cloud/ipfs/QmWiJ1yUT9YMeEfsaa46nxT6ETkYpoyXfUwKUZbovmoArm/";

const MIN = 1; // I.E. https://shdw-drive.genesysgo.net/.../0.json
const MAX = 3;

const FEE_WALLET = umi.identity.publicKey;

const FEE_ATA = findAssociatedTokenPda(umi, { mint: TOKEN, owner: FEE_WALLET });

const TOKEN_SWAP_BASE_AMOUNT = 1; // USERS RECEIVE THIS AMOUNT WHEN SWAPPING TO FUNGIBLE TOKENS
const TOKEN_SWAP_FEE_AMOUNT = 1; // USERS PAY THIS ADDITIONAL AMOUNT WHEN SWAPPING TO NFTS
const TOKEN_SWAP_FEE_DECIMALS = 9; // NUMBER OF DECIMALS IN YOUR TOKEN. DEFAULT ON TOKEN CREATION IS 9.
const SOL_SWAP_FEE_AMOUNT = 0; // OPTIONAL ADDITIONAL SOLANA FEE TO PAY WHEN SWAPPING TO NFTS

// CURRENT PATH OPTIONS:
// 0-- NFT METADATA IS UPDATED ON SWAP
// 1-- NFT METADATA IS NOT UPDATED ON SWAP
const PATH = 0;

const ESCROW = umi.eddsa.findPda(MPL_HYBRID_PROGRAM_ID, [
  string({ size: "variable" }).serialize("escrow"),
  publicKeySerializer().serialize(COLLECTION),
]);

const addZeros = (num: number, numZeros: number) => {
  return num * Math.pow(10, numZeros);
};

const escrowData = {
  escrow: ESCROW,
  collection: COLLECTION,
  token: TOKEN,
  feeLocation: FEE_WALLET,
  name: ESCROW_NAME,
  uri: BASE_URI,
  max: MAX,
  min: MIN,
  amount: addZeros(TOKEN_SWAP_BASE_AMOUNT, TOKEN_SWAP_FEE_DECIMALS),
  feeAmount: addZeros(TOKEN_SWAP_FEE_AMOUNT, TOKEN_SWAP_FEE_DECIMALS),
  solFeeAmount: addZeros(SOL_SWAP_FEE_AMOUNT, 9), // SOL HAS 9 DECIMAL PLACES
  path: PATH,
  feeAta: FEE_ATA,
  associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
};

const initTx = await initEscrowV1(umi, escrowData).sendAndConfirm(umi);

console.log(bs58.encode(initTx.signature));
