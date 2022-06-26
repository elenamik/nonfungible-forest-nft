import { Card } from "antd";
import React from "react";

export default function Trees(props) {

  const [balances, setBalances] = React.useState({})
  console.log('BALS',balances)
  console.log('COLLS', props.yourCollectibles)
  const getBal = async (item)=> {
    const amountBct = await props.readContracts.NonFungibleForest.tokenIdToBCTBal(item.id);
    setBalances({...balances, [item.id]: amountBct})
  }

  React.useEffect(()=>{
    if (props.yourCollectibles){
      props.yourCollectibles.forEach((item)=>{
        getBal(item)
      })
    }
    },[props.yourCollectibles])

  const treeArray = props.yourCollectibles?.map(item => {
    return (

      <Card
        title={
          <div>
            <span style={{ fontSize: 18, marginRight: 8 }}>{item.name}</span>
          </div>
        }
      >
        <a
          href={
            "https://opensea.io/assets/" +
            (props.readContracts &&
              props.readContracts.NonFungibleForest &&
              props.readContracts.NonFungibleForest.address) +
            "/" +
            item.id
          }
          target="_blank"
        >
          <img src={item.image} />
        </a>
        <div>{`${balances[item.id]} BCT Captured`}</div>
      </Card>
    );
  });

  return <div
      style={{ width: 820, margin: "auto", paddingBottom: 256 }}>
    <h2 style={{ paddingTop: 12, fontFamily: "Titan One", fontSize: 50}} > Your Trees</h2>
    {treeArray}
  </div>;
}
