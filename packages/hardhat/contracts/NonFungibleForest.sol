pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import 'base64-sol/base64.sol';

import './HexStrings.sol';
import './ToColor.sol';
import './DummyBCT.sol';
import 'hardhat/console.sol';

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract NonFungibleForest is ERC721, Ownable {

    DummyBCT public BCT;
    uint public BCTMultiplier = 2;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 constant public _supply_cap = 10;
    uint256 constant bct_min = 1;
    uint256 public _age;
    uint256 public _requiredCarbon;

    // track how much BCT Bal belongs to a tokenId (id -> bct bal)
    mapping (uint256 => uint256) public tokenIdToBCTBal;

    constructor(address bctAddress) public ERC721("Non Fungible Forest", "NFF") {
      BCT = DummyBCT(bctAddress);
    }

    mapping (uint256 => uint32) public age;
    mapping (uint256 => bytes3) public color;
    mapping (uint256 => uint256) public chubbiness;
    mapping (uint256 => uint256) public createdAt;

    // decay rate -> static value
    // height based off the carbon it holds
    // trunk thickness based off the carbon
    // amount of leaves based on carbon
    // flowering, non flowering
    // genus - oak, birch, maple, ash, pine
    // color of the flowers is random


  function mintItem(uint256 bctAmount)
      public
      returns (uint256)
  {
        uint256 id = _tokenIds.current();

        require(id <= _supply_cap, "NO MORE TO MINT");
        require(bctAmount >= bct_min, "BCT Deposit below the minimum");

        console.log('BCT BAL', BCT.balanceOf(msg.sender));
        console.log('BCT AMOUNT', bctAmount);

        // ui must have first triggered the "approve" on the BCT token
        require(BCT.balanceOf(msg.sender) >= bctAmount, 'User does not hold enough BCT');
        console.log('ITEM ID', id);

        // 1. attempt the transfer of BCT to self
        bool tokenTransferSuccess = BCT.transferFrom(msg.sender, address(this), bctAmount);
        require(tokenTransferSuccess, 'BCT transfer failed');

        tokenIdToBCTBal[id]=bctAmount;

        // 2. if successful, use the balance to do some fun minting
        _mint(msg.sender, id);
        _tokenIds.increment();

        // VRF for type tree
        bytes32 predictableRandom = keccak256(abi.encodePacked( blockhash(block.number-1), msg.sender, address(this), id ));
        color[id] = bytes2(predictableRandom[0]) | ( bytes2(predictableRandom[1]) >> 8 ) | ( bytes3(predictableRandom[2]) >> 16 );
        chubbiness[id] = 35+((55*uint256(uint8(predictableRandom[3])))/255);
        age[id] = 0;
        createdAt[id] = now;
  
        return id;
  }

  function tokenURI(uint256 id) public view override returns (string memory) {
      require(_exists(id), "not exist");

      string memory name = string(abi.encodePacked('Loogie #',id.toString()));

     return name;
  }

  function getAge(uint256 id) public view returns (uint256) {
    console.log(now - createdAt[id]);
    return now - createdAt[id];
  }
  
  function requiredCarbon(uint256 id) public view returns (uint256) {
    return age[id] * BCTMultiplier * 10000 / 1000000;
  }
 
}
