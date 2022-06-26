import { Card } from "antd";
import React from "react";
import {ethers} from "ethers";

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
        <FeedCarbon id={item.id} writeContracts={props.writeContracts} readContracts={props.readContracts}/>
      </Card>
    );
  });

  console.log("COLLS TREE ARR", treeArray);
  return <div style={{ width: 820, margin: "auto", paddingBottom: 256 }}>{treeArray}</div>;
}

const FeedCarbon = (
props
)=>{
  const [executeState, setExecuteState] = React.useState(0)
  const handleEatCarbon = (async () =>{
    setExecuteState(1)
  })
  const handleApprove = async () => {
    await props.writeContracts.DummyBCT.approve(
        props.readContracts.NonFungibleForest.address,
        ethers.utils.parseEther("10"));
    setExecuteState(2)
  }

  const handleExecute = async () => {
    await props.writeContracts.NonFungibleForest.eatCarbon(
        props.id,
        10);
    setExecuteState(0);
  }

  if (executeState === 0 ){
  return(
  <div>
    <button onClick={handleEatCarbon}>
      Feed 10 Carbon
    </button>
  </div>)}
  else if (executeState === 1 ) {
    return     <button onClick={handleApprove}>
      Approve
    </button>
  } else { return(
    <button onClick={handleExecute}>
      Execute
    </button>)
  }

}