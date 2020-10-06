import Near from "near-api-js";
import { Environment } from "../../env";

const keyStores = {
 development: new Near.keyStores.InMemoryKeyStore(),
 staging: new Near.keyStores.InMemoryKeyStore(),
 test: new Near.keyStores.InMemoryKeyStore(),
 production: new Near.keyStores.UnencryptedFileSystemKeyStore(null)
};

const nConfig = {
 nodeUrl: Environment.NEAR[process.env.NODE_ENV],
 deps: {
  keyStore: keyStores[process.env.NODE_ENV]
 }
};

const nAPI = new Near.Near({ ...nConfig, networkId: "default" });

export class NEAR {
 static async createAddress(): Promise<{ statusCode: number; payload: any;}> {
  const keyPair = Near.utils.KeyPair.fromRandom("ed25519");
  const publicKey = keyPair.getPublicKey();
  return Promise.resolve({
   statusCode: 201,
   payload: {
    address: publicKey.toString()
   }
  });
 }
}
