pragma solidity ^0.4.19;

contract Killable {
    function Killable() payable {

    }
    
    function destroy(address to) {
        selfdestruct(to);    
    }
}