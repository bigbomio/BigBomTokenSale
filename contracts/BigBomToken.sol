pragma solidity ^0.4.15;

import './zeppelin/token/StandardToken.sol';
import './zeppelin/ownership/Ownable.sol';
import './BigbomPrivateSaleList.sol';

contract BigbomToken is StandardToken, Ownable {
    
    string  public  constant name = "Bigbom";
    string  public  constant symbol = "BBO";
    uint    public  constant decimals = 18;
    uint    public   totalSupply = 2000000000 * 1e18; //2,000,000,000

    uint    public  founderAmount = 200000000 * 1e18; // 200,000,000
    uint    public  coreStaffAmount = 60000000 * 1e18; // 60,000,000
    uint    public  advisorAmount = 140000000 * 1e18; // 140,000,000
    uint    public  networkGrowthAmount = 600000000 * 1e18; //600,000,000
    uint    public  reserveAmount = 635000000 * 1e18; // 635,000,000
    uint    public  bountyAmount = 40000000 * 1e18; // 40,000,000

    address             public bbFounderCoreStaffWallet;
    address             public bbAdvisorWallet;
    address             public bbAirdropWallet;
    address             public bbNetworkGrowthWallet;
    address             public bbReserveWallet;
    address             public bbPublicSaleWallet;

    uint    public  saleStartTime;
    uint    public  saleEndTime;

    address public  tokenSaleContract;
    BigbomPrivateSaleList public privateSaleList;

    mapping (address => bool) public frozenAccount;
    mapping (address => uint) public frozenTime;
    mapping (address => uint) public maxAllowedAmount;

    /* This generates a public event on the blockchain that will notify clients */
    event FrozenFunds(address target, bool frozen, uint seconds);
    /// @notice `freeze? Prevent | Allow` `target` from sending & receiving tokens
    /// @param target Address to be frozen
    /// @param freeze either to freeze it or not

    function checkMaxAllowed(address target)  public  returns (uint) {
        var maxAmount  = balances[target];
        if(target == bbFounderCoreStaffWallet){
            maxAmount = 10000000 * 1e18;
        }
        if(target == bbAdvisorWallet){
            maxAmount = 10000000 * 1e18;
        }
        if(target == bbAirdropWallet){
            maxAmount = 40000000 * 1e18;
        }
        if(target == bbNetworkGrowthWallet){
            maxAmount = 20000000 * 1e18;
        }
        if(target == bbReserveWallet){
            maxAmount = 6350000 * 1e18;
        }
        return maxAmount;
    }


    function freezeAccount(address target, bool freeze, uint seconds) onlyOwner public {
        
        // if unfreeze
        if(!freeze){
            // get End time of frozenAccount
            var frozenEndTime = frozenTime[target];
            // if now > frozenEndTime
            require (now >= frozenEndTime);
            // unfreeze account
            frozenAccount[target] = freeze;
            // set time to 0
            seconds = 0;           
        }else{
            frozenAccount[target] = freeze;
            
        }
        // set endTime = now + seconds to freeze
        frozenTime[target] = now + seconds;
        FrozenFunds(target, freeze, seconds);
        
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
        require(now <= saleStartTime);
        uint allowcap = privateSaleList.getCap(_to);
        require (allowcap > 0);
        _;
    }
    function setPrivateList(BigbomPrivateSaleList _privateSaleList) onlyOwner {
                privateSaleList = _privateSaleList;

    }
    function getFreezeTimeDefaut(address target) public returns (uint) {
        var dfTime  = 0;
        if(target == bbFounderCoreStaffWallet){
            dfTime = 24 * 30 * 24 * 3600; // 24 thang
        }
        if(target == bbAdvisorWallet){
            dfTime = 12 * 30 * 24 * 3600;
        }
        if(target == bbAirdropWallet){
            dfTime = 2 * 30 * 24 * 3600;
        }
        if(target == bbNetworkGrowthWallet){
            dfTime = 12 * 30 * 24 * 3600;
        }
        if(target == bbReserveWallet){
            dfTime = 12 * 30 * 24 * 3600;
        }
        return dfTime;
    }
    function BigbomToken(uint startTime, uint endTime, address admin
        ) {
        // Mint all tokens. Then disable minting forever.
        balances[msg.sender] = totalSupply;
        Transfer(address(0x0), msg.sender, totalSupply);
        // init internal amount limit
       
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
            // check from address is Vesting Address
            if (msg.sender == bbFounderCoreStaffWallet || msg.sender == bbAdvisorWallet|| msg.sender == bbAirdropWallet|| msg.sender == bbNetworkGrowthWallet|| msg.sender == bbReserveWallet){
                var withdrawAmount =  maxAllowedAmount[msg.sender];
                var defaultAllowAmount = checkMaxAllowed(msg.sender);
                var maxAmount = defaultAllowAmount - withdrawAmount;
                // _value transfer must <= maxAmount
                require(maxAmount >= _value);

                // if maxAmount = 0, need to block this msg.sender
                if((withdrawAmount + _value) == defaultAllowAmount){
                    // freeze account
                    freezeAccount( msg.sender, true, getFreezeTimeDefaut(msg.sender));
                    maxAllowedAmount[msg.sender] = 0;
                }else{
                    // set max withdrawAmount
                    maxAllowedAmount[msg.sender] = withdrawAmount + _value;
                }
            }

        return super.transfer(_to, _value);
    }

    function transferPrivateSale(address _to, uint _value)
        onlyOwner
        onlyPrivateListEnabled(_to) 
        returns (bool) {
         return transfer( _to,  _value);
    }

    function transferFrom(address _from, address _to, uint _value)
        onlyWhenTransferEnabled
        validDestination(_to)
        validFrom(_from)
        returns (bool) {
            // check from address is Vesting
            if (_from == bbFounderCoreStaffWallet || _from == bbAdvisorWallet|| _from == bbAirdropWallet|| _from == bbNetworkGrowthWallet|| _from == bbReserveWallet){
                var withdrawAmount =  maxAllowedAmount[_from];
                var maxAmount = checkMaxAllowed(_from) - withdrawAmount;

                require(maxAmount >= _value);

                maxAllowedAmount[_from] = withdrawAmount + _value;
                // if maxAmount = 0, need to block this _from
                if(maxAllowedAmount[_from]==checkMaxAllowed(_from)){
                    // freeze account
                    freezeAccount( _from, true, getFreezeTimeDefaut(_from));
                }
            }
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
