import { Button, InputNumber } from "antd";
import React from "react";
import { ethers } from "ethers";

export default function Mint(props) {
  const [mintClicked, setMintClicked] = React.useState(false);

  const [input, setInput] = React.useState(0);
  const [approved, setApproved] = React.useState(false);

  const handleChange = event => {
    setInput(event);
  };

  const handleApprove = async () => {
    await props.writeContracts.DummyBCT.approve(
      props.readContracts.NonFungibleForest.address,
      ethers.utils.parseEther(input.toString()),
    );
    setApproved(true);
  };

  if (!mintClicked) {
    return (
      <div>
        <button
          style={{
            color: "#F5F5F5",
            borderColor: "#0E750D",
            borderRadius: 100,
            margin: 20,
            height: 86,
          }}
        >
          <span style={{ padding: 60, fontSize: 26, color: "#0E750D" }}>Mint a Tree</span>
        </button>
      </div>
    );
  }
  if (!approved) {
    return (
      <div>
        <InputNumber onChange={handleChange} />
        <Button type="primary" onClick={handleApprove}>
          APPROVE
        </Button>
      </div>
    );
  }
  return (
    <div>
      <InputNumber onChange={handleChange} />
      <Button
        type="primary"
        onClick={() => {
          props.writeContracts.NonFungibleForest.mintItem(input);
        }}
      >
        MINT
      </Button>
    </div>
  );
}
