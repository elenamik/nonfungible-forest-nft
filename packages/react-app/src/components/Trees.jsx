import { Card } from "antd";
import React from "react";

export default function Trees(props) {
  const [balances, setBalances] = React.useState({});

  const getBal = async item => {
    const amountBct = await props.readContracts.NonFungibleForest.tokenIdToBCTBal(item.id);
    setBalances({ ...balances, [item.id]: amountBct });
  };

  React.useEffect(() => {
    if (props.yourCollectibles) {
      props.yourCollectibles.forEach(item => {
        getBal(item);
      });
    }
  }, [props.yourCollectibles]);

  const treeArray = props.yourCollectibles?.map(item => {
    return (
      <Card
        title={
          <div>
            <span style={{ fontSize: 18, marginRight: 8 }}>ITEM.NAME</span>
          </div>
        }
      >
        <iframe src="https://sweltering-engine.surge.sh/" />
        <div>{`${balances[item.id]} BCT Captured`}</div>
      </Card>
    );
  });

  console.log("COLLS TREE ARR", treeArray);
  return <div style={{ width: 820, margin: "auto", paddingBottom: 256 }}>{treeArray}</div>;
}
