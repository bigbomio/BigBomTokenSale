pragma solidity ^0.4.19;

import './zeppelin/ownership/Ownable.sol';

contract BigbomPrivateSale1List is Ownable {
    // amount is in wei. The value of 11 is just a stub.
    uint public usersAmount = 11;
    mapping(address=>uint) public addressCap;

    function BigbomPrivateSale1List() {}

    event ListAddress( address _user, uint _amount, uint _time );

    // Owner can delist by setting amount = 0.
    // Onwer can also change it at any time
    function listAddress( address _user, uint _amount ) onlyOwner {
        addressCap[_user] = _amount;
        ListAddress( _user, _amount, now );
    }

    // an optimization in case of network congestion
    function listAddresses( address[] _users, uint[] _amount ) onlyOwner {
        require(_users.length == _amount.length );
        for( uint i = 0 ; i < _users.length ; i++ ) {
            listAddress( _users[i], _amount[i] );
        }
    }

    function setUsersAmount( uint _amount ) onlyOwner {
        usersAmount = _amount;
    }

    function getCap( address _user ) constant returns(uint) {
        uint cap = addressCap[_user];

        if( cap == 1 ) return usersAmount;
        else return cap;
    }

    function destroy() onlyOwner {
        selfdestruct(owner);
    }
}
