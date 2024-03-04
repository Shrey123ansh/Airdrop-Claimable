import {
  ConnectWallet,
  Web3Button,
  createMerkleTreeFromAllowList,
  getProofsForAllowListEntry,
  useAddress,
  useContract,
  useTokenBalance,
} from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import { useState } from "react";
import { utils } from "ethers";

const Home: NextPage = () => {
  const allowList = [
    {
      address: "0xf50eF39ad58B301bF7e233b5756f860167E1886b",
      maxClaimable: "600",
    },
    {
      address: "0x4315626D4bFc97A99D279b3155a7C81F1F242920",
      maxClaimable: "500",
    },
  ];

  // const getMaxClaimable = async (address: string) => {
  //   const entry = allowList.find((entry) => entry.address === address);
  //   console.log(entry.maxClaimable);
  //   if (entry) {
  //     return entry.maxClaimable;
  //   } else {
  //     return "Address not found in allowList";
  //   }
  // };

  const [merkleRoot, setMerkleRoot] = useState<string | null>(null);

  const generateMerkleTree = async () => {
    const merkleTree = await createMerkleTreeFromAllowList(allowList);
    setMerkleRoot(merkleTree.getHexRoot());
  };

  const getUserProof = async (address: string) => {
    // await getMaxClaimable(address);
    const merkleTree = await createMerkleTreeFromAllowList(allowList);
    const leaf = {
      address: address,
      maxClaimable: "500",
    };
    const proof = await getProofsForAllowListEntry(merkleTree, leaf);
    const proofHash = "0x" + proof[0].data.toString("hex");
    console.log(proofHash);
    return proofHash;
  };

  const address = useAddress();
  const { contract: tokenContract } = useContract(
    "0x62Fef4948A28787A72f77899ACDBcb6481D62f4e"
  );
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ConnectWallet />
        {address && (
          <div>
            <div
              style={{
                backgroundColor: "#222",
                padding: "2rem",
                borderRadius: "1rem",
                textAlign: "center",
                minWidth: "500px",
                marginBottom: "2rem",
                marginTop: "2rem",
              }}
            >
              <h1>Create Merkle Tree</h1>
              <button
                onClick={generateMerkleTree}
                style={{
                  padding: "1rem",
                  borderRadius: "8px",
                  backgroundColor: "#FFF",
                  color: "#333",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Generate
              </button>
              {merkleRoot && <p>Merkle Root Hash: {merkleRoot}</p>}
            </div>
            <div
              style={{
                backgroundColor: "#222",
                padding: "2rem",
                borderRadius: "1rem",
                textAlign: "center",
                minWidth: "500px",
              }}
            >
              <h1>ERC-20 Airdrop</h1>
              <h3>Token balance: {tokenBalance?.displayValue}</h3>
              <Web3Button
                contractAddress="0xb9258Fb5cDFdDD34f96F0C286A1Fc14a6f7Da256"
                action={async (contract) =>
                  contract.call("claim", [
                    address,
                    utils.parseEther("500"),
                    [await getUserProof(address)],
                    utils.parseEther("500"),
                  ])
                }
                onError={() =>
                  alert("Not eligible for airdrop or already claimed!")
                }
                onSuccess={() => alert("Airdrop claimed!")}
              >
                Claim Airdrop
              </Web3Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
