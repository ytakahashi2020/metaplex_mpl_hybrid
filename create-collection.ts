import { clusterApiUrl, Connection } from "@solana/web3.js";
import {
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import { createCollection } from "@metaplex-foundation/mpl-core";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile(
  "/Users/ytakahashi/.config/solana/id.json"
);

console.log(`address is ${user.publicKey.toBase58()}`);

const umi = createUmi(connection.rpcEndpoint);

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

umi.use(mplTokenMetadata());

const mint = generateSigner(umi);

const transaction = createCollection(umi, {
  collection: mint,
  name: "Test Collection",
  uri: "https://example.com/collection",
});

await transaction.sendAndConfirm(umi);

console.log(`${getExplorerLink("address", mint.publicKey, "devnet")}`);
