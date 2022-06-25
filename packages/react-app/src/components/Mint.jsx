import { Button, InputNumber } from "antd";
import React from "react";
import { ethers } from "ethers";

export default function Mint(props) {
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

  if (!approved) {
    return (
      <>
        <InputNumber onChange={handleChange} />
        <Button type="primary" onClick={handleApprove}>
          APPROVE
        </Button>
      </>
    );
  }

  return (
    <>
      <InputNumber onChange={handleChange} />
      <Button
        type="primary"
        onClick={() => {
          props.writeContracts.NonFungibleForest.mintItem(input);
        }}
      >
        MINT
      </Button>
    </>
  );
}
