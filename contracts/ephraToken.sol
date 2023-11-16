// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract EphraToken is ERC20Capped, ERC20Burnable {
    address payable public owner;
    uint256 public blockReward;

    constructor(uint256 cap, uint256 reward) ERC20("EphraToken", "ERT") ERC20Capped(cap * (10 ** decimals())){
        owner =  payable(msg.sender);
        _mint(owner, 70000000 * (10 ** decimals()));
        blockReward = reward * (10 ** decimals());
    }

    function _update(address from, address to, uint256 value) internal virtual override(ERC20,ERC20Capped) {
        super._update(from, to, value);

        if (from == address(0)) {
            uint256 maxSupply = cap();
            uint256 supply = totalSupply();
            if (supply > maxSupply) {
                revert ERC20ExceededCap(supply, maxSupply);
            }
        }
    }

    function _mintMinerReward() internal {
        _mint(block.coinbase, blockReward);
    }

    function _transfer(address from, address to, uint256 value) internal virtual override {

        if(from != address(0) && to != block.coinbase && block.coinbase != address(0)){
            _mintMinerReward();
        }
        super._transfer(from, to, value);
    } 

    function destroy() external onlyOwner() {
        selfdestruct(owner);
    }

    function setBlockReward(uint256 reward) external onlyOwner() {
        blockReward = reward * (10 ** decimals());
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "Only the owner can access this function");
        _;
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        // Perform the transfer
        bool success = super.transfer(to, amount);

        // Emit the Transfer event
        emit Transfer(msg.sender, to, amount);

        return success;
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        // Perform the approval
        bool success = super.approve(spender, amount);

        // Emit the Approval event
        emit Approval(msg.sender, spender, amount);

        return success;
    }
}