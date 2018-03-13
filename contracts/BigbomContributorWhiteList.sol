pragma solidity ^0.4.19;

import './zeppelin/ownership/Ownable.sol';

contract BigbomContributorWhiteList is Ownable {
    mapping(address=>uint) public addressMinCap;
    mapping(address=>uint) public addressMaxCap;

    function BigbomContributorWhiteList() {}

    event ListAddress( address _user, uint _mincap, uint _maxcap, uint _time );

    // Owner can delist by setting cap = 0.
    // Onwer can also change it at any time
    function listAddress( address _user, uint _mincap, uint _maxcap ) onlyOwner {
        addressMinCap[_user] = _mincap;
        addressMaxCap[_user] = _maxcap;
        ListAddress( _user, _mincap, _maxcap, now );
    }

    // an optimization in case of network congestion
    function listAddresses( address[] _users, uint[] _mincap, uint[] _maxcap ) onlyOwner {
        require(_users.length == _mincap.length );
        require(_users.length == _maxcap.length );
        for( uint i = 0 ; i < _users.length ; i++ ) {
            listAddress( _users[i], _mincap[i], _maxcap[i] );
        }
    }

    function getMinCap( address _user ) constant returns(uint) {
        return addressMinCap[_user];
    }
    function getMaxCap( address _user ) constant returns(uint) {
        return addressMaxCap[_user];
    }

    function destroy() onlyOwner {
        selfdestruct(owner);
    }
}
