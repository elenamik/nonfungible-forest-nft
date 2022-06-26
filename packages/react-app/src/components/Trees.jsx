import React from "react";
import * as app from "../tree/makeTree";

app.go();
export default function Trees(props) {
  const [balances, setBalances] = React.useState({});
  console.log("BALS", balances);
  console.log("COLLS", props.yourCollectibles);
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

  // const tree = new Tree({
  //   generations: 4, // # for branch' hierarchy
  //   length: 4.0, // length of root branch
  //   uvLength: 16.0, // uv.v ratio against geometry length (recommended is generations * length)
  //   radius: 0.2, // radius of root branch
  //   radiusSegments: 8, // # of radius segments for each branch geometry
  //   heightSegments: 8, // # of height segments for each branch geometry
  // });
  // const geometry = TreeGeometry.build(tree);

  // console.log("tree", tree);
  // console.log("geom", geometry);

  // createRoot(document.getElementById("root")).render(
  //   <Canvas>
  //     <ambientLight />
  //     <pointLight position={[10, 10, 10]} />
  //     <Box position={[-1.2, 0, 0]} />
  //     <Box position={[1.2, 0, 0]} />
  //   </Canvas>,
  // );
  return <div />;
}
