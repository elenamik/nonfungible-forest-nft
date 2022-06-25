import { Button, InputNumber } from "antd";
import React from "react";

export default function Mint(props) {
  const [input, setInput] = React.useState(0);

  const handleChange = event => {
    setInput(event);
  };

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
