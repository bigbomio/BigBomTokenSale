pragma solidity ^0.4.19;

import './zeppelin/token/StandardToken.sol';
import './zeppelin/ownership/Ownable.sol';
import './BigbomPrivateSaleList.sol';

contract BigbomToken is StandardToken, Ownable {
    
    string  public  constant name = "Bigbom";
    string  public  constant symbol = "BBO";
    uint    public  constant decimals = 18;
    uint    public   totalSupply = 2000000000 * 1e18; //2,000,000,000

    uint    public  founderAmount; // 200,000,000
    uint    public  coreStaffAmount; // 60,000,000
    uint    public  advisorAmount; // 100,000,000
    uint    public  reserveAmount; // 500,000,000
    uint    public  bountyAmount; //

    uint    public  saleStartTime;
    uint    public  saleEndTime;

    address public  tokenSaleContract;
    BigbomPrivateSaleList public privateSaleList;

    mapping (address => bool) public frozenAccount;

    /* This generates a public event on the blockchain that will notify clients */
    event FrozenFunds(address target, bool frozen);
    /// @notice `freeze? Prevent | Allow` `target` from sending & receiving tokens
    /// @param target Address to be frozen
    /// @param freeze either to freeze it or not
    function freezeAccount(address target, bool freeze) onlyOwner public {
        frozenAccount[target] = freeze;
        FrozenFunds(target, freeze);
    }

    modifier validDestination( address to ) {
        require(to != address(0x0));
        require(to != address(this) );
        require(!frozenAccount[to]);                       // Check if recipient is frozen
        _;
    }
    modifier validFrom(address from){
        require(!frozenAccount[from]);                     // Check if sender is frozen
        _;
    }
    modifier onlyWhenTransferEnabled() {
        if( now <= saleEndTime && now >= saleStartTime ) {
            require( msg.sender == tokenSaleContract );

        }
        _;
    }
    modifier onlyPrivateListEnabled(address _to){
        if(now <= saleStartTime){
            uint allowcap = privateSaleList.getCap(_to);
            require (allowcap > 0);
        }
        _;
    }
    function setPrivateList(BigbomPrivateSaleList _privateSaleList) onlyOwner {
                privateSaleList = _privateSaleList;

    }
    function BigbomToken(uint startTime, uint endTime, address admin, uint _founderAmount, uint _coreStaffAmount, uint _advisorAmount,
     uint _reserveAmount, uint _bountyAmount) {
        // Mint all tokens. Then disable minting forever.
        balances[msg.sender] = totalSupply;
        Transfer(address(0x0), msg.sender, totalSupply);
        // init internal amount limit
        founderAmount = _founderAmount;
        coreStaffAmount = _coreStaffAmount;
        advisorAmount = _advisorAmount;
        reserveAmount = _reserveAmount;
        bountyAmount  = _bountyAmount;
        saleStartTime = startTime;
        saleEndTime = endTime;
        tokenSaleContract = msg.sender;
        transferOwnership(admin); // admin could drain tokens that were sent here by mistake
    }

    function setTokenSaleContract(address _tokenSaleContract) onlyOwner {
        tokenSaleContract = _tokenSaleContract;
    }
    function transfer(address _to, uint _value)
        onlyWhenTransferEnabled
        validDestination(_to)
        validFrom(msg.sender)
        returns (bool) {
        return super.transfer(_to, _value);
    }

    function transferPrivateSale(address _to, uint _value)
        onlyPrivateListEnabled(_to) 
        returns (bool) {
         return transfer( _to,  _value);
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
