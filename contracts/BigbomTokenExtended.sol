pragma solidity ^0.4.19;

import './zeppelin/token/StandardToken.sol';
import './zeppelin/ownership/Ownable.sol';
import './BigbomToken.sol';

contract BigbomTokenExtended is BigbomToken {
    
    string  public  constant name = "Bigbom";
    string  public  constant symbol = "BBO";
    uint    public  constant decimals = 18;
    uint    public   totalSupply = 2000000000 * 1e18; //2,000,000,000

    BigbomToken public  bigbomToken;
    function BigbomTokenExtended(uint startTime, uint endTime, address admin, address _bbFounderCoreStaffWallet, address _bbAdvisorWallet,
        address _bbAirdropWallet,
        address _bbNetworkGrowthWallet,
        address _bbReserveWallet, 
        address _bbPublicSaleWallet,
        BigbomToken _bigbomToken
        ) public {

        require(admin!=address(0x0));
        require(_bbAirdropWallet!=address(0x0));
        require(_bbAdvisorWallet!=address(0x0));
        require(_bbReserveWallet!=address(0x0));
        require(_bbNetworkGrowthWallet!=address(0x0));
        require(_bbFounderCoreStaffWallet!=address(0x0));
        require(_bbPublicSaleWallet!=address(0x0));
        require(_bigbomToken!=address(0x0))

        // Mint all tokens. Then disable minting forever.
        balances[msg.sender] = totalSupply;
        Transfer(address(0x0), msg.sender, totalSupply);
        // init internal amount limit
        // set address when deploy
        bbAirdropWallet = _bbAirdropWallet;
        bbAdvisorWallet = _bbAdvisorWallet;
        bbReserveWallet = _bbReserveWallet;
        bbNetworkGrowthWallet = _bbNetworkGrowthWallet;
        bbFounderCoreStaffWallet = _bbFounderCoreStaffWallet;
        bbPublicSaleWallet = _bbPublicSaleWallet;
        bigbomToken = _bigbomToken;
        
        saleStartTime = startTime;
        saleEndTime = endTime;
        transferOwnership(admin); // admin could drain tokens that were sent here by mistake
    }

    function airDrop(address[] targets) onlyOwner {
        for(uint i=0; i< targets.length; i++){
            amount = bigbomToken.balanceOf(targets[i]);
            if (amount > 0){
                //
                transfer(targets[i], amount);
            }
        }
    }

    modifier validFrozenAccount(address target) {
        if(frozenAccount[target]){
            require(now >= frozenEndTime);
        }
        _;
    }

    function selfFreeze(bool freeze, uint _seconds) 
    validFrozenAccount 
    public {
        // selfFreeze cannot more than 7 days
        require(_seconds <= 7 * 24 * 3600);
        // if unfreeze
        if(!freeze){
            // get End time of frozenAccount
            var frozenEndTime = frozenTime[msg.sender];
            // if now > frozenEndTime
            require (now >= frozenEndTime);
            // unfreeze account
            frozenAccount[msg.sender] = freeze;
            // set time to 0
            _seconds = 0;           
        }else{
            frozenAccount[msg.sender] = freeze;
            
        }
        // set endTime = now + _seconds to freeze
        frozenTime[msg.sender] = now + _seconds;
        FrozenFunds(msg.sender, freeze, _seconds);
        
    }

    function freezeAccount(address target, bool freeze, uint _seconds) 
    onlyOwner
    validFrozenAccount
    public {
        
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

    
}
