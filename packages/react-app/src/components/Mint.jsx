import React from "react";
import { ethers } from "ethers";

export default function Mint(props) {
  console.log("WRITES", props.writeContracts);
  const [mintState, setMintState] = React.useState(0);

  const handleMintClick = () => {
    setMintState(1);
  };

  const handleApproveClick = async () => {
    await props.writeContracts.DummyBCT.approve(
      props.readContracts.NonFungibleForest.address,
      ethers.utils.parseEther("1"),
    );
    setMintState(2);
  };

  if (mintState === 0) {
    return (
      <div>
        <BigGreenButton handleClick={handleMintClick} text="Mint a Tree for 1 BCT" />
      </div>
    );
  }
  if (mintState === 1) {
    return (
      <div>
        <BigGreenButton handleClick={handleApproveClick} text="Approve" />
      </div>
    );
  }
  return (
    <div>
      <BigGreenButton
        text="EXECUTE"
        handleClick={async () => {
          await props.writeContracts.NonFungibleForest.mintItem(1);
        }}
      />
    </div>
  );
}

const BigGreenButton = props => {
  return (
    <button
      style={{
        color: "#F5F5F5",
        borderColor: "#0E750D",
        borderRadius: 100,
        margin: 20,
        height: 86,
      }}
      onClick={props.handleClick}
    >
      <span style={{ padding: 60, fontSize: 26, color: "#0E750D" }}>{props.text}</span>
    </button>
  );
};
