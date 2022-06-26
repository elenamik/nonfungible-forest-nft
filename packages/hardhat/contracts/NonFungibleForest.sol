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

    // track how much BCT Bal belongs to a tokenId (id -> bct bal)
    mapping (uint256 => uint256) public tokenIdToBCTBal;

    constructor(address bctAddress) public ERC721("Non Fungible Forest", "NFF") {
      BCT = DummyBCT(bctAddress);
    }

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

        // ui must have first triggered the "approve" on the BCT token
        require(BCT.balanceOf(msg.sender) >= bctAmount, 'User does not hold enough BCT');

        // 1. attempt the transfer of BCT to self
        bool tokenTransferSuccess = BCT.transferFrom(msg.sender, address(this), bctAmount);
        require(tokenTransferSuccess, 'BCT transfer failed');

        tokenIdToBCTBal[id]=bctAmount;

        // 2. if successful, use the balance to do some fun minting
        _mint(msg.sender, id);
        _tokenIds.increment();

        // VRF for type tree
        bytes32 predictableRandom = keccak256(abi.encodePacked( blockhash(block.number-1), msg.sender, address(this), id ));
        createdAt[id] = now;
  
        return id;
  }

    function eatCarbon(uint256 id, uint256 amountBCT) public returns (uint256) {
        require(_exists(id), "not exist");

        // ui must have first triggered the "approve" on the BCT token

        require(BCT.balanceOf(msg.sender) >= amountBCT, 'User does not hold enough BCT');

        // TODO: do not allow eating carbon if the tree is already 'dead'

        // 1. attempt the transfer of BCT to self
        bool tokenTransferSuccess = BCT.transferFrom(msg.sender, address(this), amountBCT);
        require(tokenTransferSuccess, 'BCT transfer failed');

        tokenIdToBCTBal[id]=amountBCT+tokenIdToBCTBal[id];

        return tokenIdToBCTBal[id];
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
      uint age = this.getAge(id);
      return age * BCTMultiplier * 10**15;
  }
  
  function derivedProperties(uint256 id) public view returns ( uint256 trunk, uint256 height, uint256 requiredCarbon) {
      uint reqCarbon = this.requiredCarbon(id);
      uint ageTree = this.getAge(id);
      if (this.balanceOf(msg.sender) > reqCarbon) {
          uint256 height = ageTree*2;
          uint256 trunk = ageTree*1;
      }
      else {
        uint256 height = 0;
        uint256 trunk = 0;
        uint reqCarbon =0;
        }
      return (trunk, height, requiredCarbon);
}

}
