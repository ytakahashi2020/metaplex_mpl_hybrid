import { clusterApiUrl, Connection } from "@solana/web3.js";
import {
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import {
  createV1,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

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

// Token(Not token-2022)
const SPL = publicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

const transaction = createV1(umi, {
  mint,
  name: "My Test",
  symbol: "Test",
  uri: "https://gateway.irys.xyz/EP2VzZh1nosBxtKhhhGcJ4GxcbUo6FpHqtCrcvnftyME",
  sellerFeeBasisPoints: percentAmount(0),
  splTokenProgram: SPL,
});

await transaction.sendAndConfirm(umi);

console.log(`${getExplorerLink("address", mint.publicKey, "devnet")}`);
