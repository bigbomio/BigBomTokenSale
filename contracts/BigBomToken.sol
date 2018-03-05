pragma solidity ^0.4.19;

import './zeppelin/token/StandardToken.sol';
import './zeppelin/ownership/Ownable.sol';
import './BigbomAdvisorList.sol';
import './BigbomCoreStaffList.sol';
import './BigbomFounderList.sol';
import './BigbomPrivateSale1List.sol';

contract BigBomToken is StandardToken, Ownable {
    BigbomAdvisorList public advisorList;
    BigbomCoreStaffList public coreStaffList;
    BigbomFounderList public founderList;
    BigbomPrivateSale1List public privateSale1List;

    string  public  constant name = "Bigbom";
    string  public  constant symbol = "BBO";
    uint    public  constant decimals = 18;
    uint    public  constant totalSupply = 2000000000; //2,000,000,000

    uint    public  founderAmount; // 200,000,000
    uint    public  coreStaffAmount; // 60,000,000
    uint    public  advisorAmount; // 100,000,000
    uint    public  reserveAmount; // 500,000,000

    uint    public  saleStartTime;
    uint    public  saleEndTime;

    address public  tokenSaleContract;

    bool    public  istransferPrivateSale1;

    modifier onlyWhenTransferEnabled() {
        if( now <= saleEndTime && now >= saleStartTime ) {
            require( msg.sender == tokenSaleContract );
        }
        _;
    }

   

    modifier validDestination( address to ) {
        require(to != address(0x0));
        require(to != address(this) );
        _;
    }

    function BigBomToken(uint startTime, uint endTime, address admin, uint _founderAmount, uint _coreStaffAmount, uint _advisorAmount, uint _reserveAmount) {
        // Mint all tokens. Then disable minting forever.
        balances[msg.sender] = totalSupply;
        Transfer(address(0x0), msg.sender, totalSupply);

        founderAmount = _founderAmount;
        coreStaffAmount = _coreStaffAmount;
        advisorAmount = _advisorAmount;
        reserveAmount = _reserveAmount;

        saleStartTime = startTime;
        saleEndTime = endTime;

        tokenSaleContract = msg.sender;
        transferOwnership(admin); // admin could drain tokens that were sent here by mistake
    }

    function transfer(address _to, uint _value)
        onlyWhenTransferEnabled
        validDestination(_to)
        returns (bool) {
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint _value)
        onlyWhenTransferEnabled
        validDestination(_to)
        returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    event Burn(address indexed _burner, uint _value);

    function burn(uint _value) onlyWhenTransferEnabled
        returns (bool){
        balances[msg.sender] = balances[msg.sender].sub(_value);
        totalSupply = totalSupply.sub(_value);
        Burn(msg.sender, _value);
        Transfer(msg.sender, address(0x0), _value);
        return true;
    }

    // save some gas by making only one contract call
    function burnFrom(address _from, uint256 _value) onlyWhenTransferEnabled
        returns (bool) {
        assert( transferFrom( _from, msg.sender, _value ) );
        return burn(_value);
    }

    function emergencyERC20Drain( ERC20 token, uint amount ) onlyOwner {
        token.transfer( owner, amount );
    }
}
