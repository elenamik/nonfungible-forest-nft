pragma solidity >=0.6.0 <0.7.0;
// SPDX-License-Identifier: MIT

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

// learn more: https://docs.openzeppelin.com/contracts/3.x/erc20

contract DummyBCT is ERC20 {
  // constructor and mint tokens for deployer

  // balance of carbon

  constructor() public ERC20('Dummy BCT', 'BCTOp') {
    _mint(msg.sender, 1000 * 10**18);
  }


}
