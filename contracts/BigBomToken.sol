pragma solidity ^0.4.19;

import './zeppelin/token/StandardToken.sol';
import './zeppelin/ownership/Ownable.sol';
import './BigbomPrivateSaleList.sol';

contract BigbomToken is StandardToken, Ownable {
    
    string  public  constant name = "Bigbom";
    string  public  constant symbol = "BBO";
    uint    public  constant decimals = 18;
    uint    public   totalSupply = 2000000000 * 1e18; //2,000,000,000

    uint    public  constant founderAmount = 200000000 * 1e18; // 200,000,000
    uint    public  constant coreStaffAmount = 60000000 * 1e18; // 60,000,000
    uint    public  constant advisorAmount = 140000000 * 1e18; // 140,000,000
    uint    public  constant networkGrowthAmount = 600000000 * 1e18; //600,000,000
    uint    public  constant reserveAmount = 635000000 * 1e18; // 635,000,000
    uint    public  constant bountyAmount = 40000000 * 1e18; // 40,000,000

    address public  constant bbFounderCoreStaffWallet = address(0x0);
    address public  constant bbAdvisorWallet= address(0x0);
    address public  constant bbAirdropWallet= address(0x0);
    address public  constant bbNetworkGrowthWallet= address(0x0);
    address public  constant bbReserveWallet= address(0x0);
    address public  constant bbPublicSaleWallet= address(0x0);

    uint    public  saleStartTime;
    uint    public  saleEndTime;

    address public  tokenSaleContract;
    BigbomPrivateSaleList public privateSaleList;

    mapping (address => bool) public frozenAccount;
    mapping (address => uint) public frozenTime;
    mapping (address => uint) public maxAllowedAmount;

    /* This generates a public event on the blockchain that will notify clients */
    event FrozenFunds(address target, bool frozen, uint _seconds);
   

    function checkMaxAllowed(address target)  public constant  returns (uint) {
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


    function freezeAccount(address target, bool freeze, uint _seconds) onlyOwner public {
        
        // if unfreeze
        if(!freeze){
            // get End time of frozenAccount
            var frozenEndTime = frozenTime[target];
            // if now > frozenEndTime
            require (now >= frozenEndTime);
            // unfreeze account
            frozenAccount[target] = freeze;
            // set time to 0
            _seconds = 0;           
        }else{
            frozenAccount[target] = freeze;
            
        }
        // set endTime = now + _seconds to freeze
        frozenTime[target] = now + _seconds;
        FrozenFunds(target, freeze, _seconds);
        
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
    function setPrivateList(BigbomPrivateSaleList _privateSaleList)   onlyOwner public {
        require(_privateSaleList != address(0x0));
        privateSaleList = _privateSaleList;

    }
    
    function BigbomToken(uint startTime, uint endTime, address admin
        ) public {
        // Mint all tokens. Then disable minting forever.
        balances[msg.sender] = totalSupply;
        Transfer(address(0x0), msg.sender, totalSupply);
        // init internal amount limit
       
        saleStartTime = startTime;
        saleEndTime = endTime;
        transferOwnership(admin); // admin could drain tokens that were sent here by mistake
    }

    function setTimeSale(uint startTime, uint endTime) onlyOwner public {
        require (now < saleStartTime || now > saleEndTime);
        require (now < startTime);
        require ( startTime < endTime);
        saleStartTime = startTime;
        saleEndTime = endTime;
    }

    function setTokenSaleContract(address _tokenSaleContract) onlyOwner public {
        // check address ! 0
        require(_tokenSaleContract != address(0x0));
        // do not allow run when saleStartTime <= now <= saleEndTime
        require (now < saleStartTime || now > saleEndTime);

        tokenSaleContract = _tokenSaleContract;
    }
    function transfer(address _to, uint _value)
        onlyWhenTransferEnabled
        validDestination(_to)
        validFrom(msg.sender)
        public 
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
                    freezeAccount( msg.sender, true, 24 * 3600); // temp freeze account 24h
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
        public 
        returns (bool) {
         return transfer( _to,  _value);
    }

    function transferFrom(address _from, address _to, uint _value)
        onlyWhenTransferEnabled
        validDestination(_to)
        validFrom(_from)
        public 
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
                    freezeAccount( _from, true, 24 * 3600);
                }
            }
            return super.transferFrom(_from, _to, _value);
    }

    event Burn(address indexed _burner, uint _value);

    function burn(uint _value) onlyWhenTransferEnabled
        public 
        returns (bool){
        balances[msg.sender] = balances[msg.sender].sub(_value);
        totalSupply = totalSupply.sub(_value);
        Burn(msg.sender, _value);
        Transfer(msg.sender, address(0x0), _value);
        return true;
    }

    // save some gas by making only one contract call
    function burnFrom(address _from, uint256 _value) onlyWhenTransferEnabled
        public 
        returns (bool) {
        assert( transferFrom( _from, msg.sender, _value ) );
        return burn(_value);
    }

    function emergencyERC20Drain( ERC20 token, uint amount ) onlyOwner public {
        token.transfer( owner, amount );
    }
}
