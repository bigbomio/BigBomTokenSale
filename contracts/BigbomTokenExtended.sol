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
        ) public BigbomToken(startTime, endTime, admin, _bbFounderCoreStaffWallet, _bbAdvisorWallet,
         _bbAirdropWallet,
         _bbNetworkGrowthWallet,
         _bbReserveWallet, 
         _bbPublicSaleWallet
        ){
            bigbomToken = _bigbomToken;
    }
        
    
    event TokenDrop( address receiver, uint amount );
    function airDrop(address[] recipients) public onlyOwner {
        for(uint i = 0 ; i < recipients.length ; i++){
            uint amount = bigbomToken.balanceOf(recipients[i]);
            if (amount > 0){
                //
                transfer(recipients[i], amount);
                TokenDrop( recipients[i], amount );
            }
        }
    }

    modifier validFrozenAccount(address target) {
        if(frozenAccount[target]){
            require(now >= frozenTime[target]);
        }
        _;
    }

    function selfFreeze(bool freeze, uint _seconds) 
    validFrozenAccount(msg.sender) 
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
    validFrozenAccount(target)
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
