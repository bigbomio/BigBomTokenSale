var TokenSale = artifacts.require("./BigbomTokenSale.sol");
var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");

// Copy & Paste this
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }




var tokenSaleContract;

module.exports = function(deployer) {
    var admin = "0x123";
    var multisig = "0x456";
    var whiteListInstance;
    var totalSupply = web3.toWei( 226000000, "ether");
    var premintedSupply = totalSupply / 2;
    var publicSaleStartTime = new Date('Sat, 16 Sep 2017 06:00:00 GMT').getUnixTime();
    var publicSaleEndTime = new Date('Sun, 17 Sep 2017 06:00:00 GMT').getUnixTime();
    var founderAmount = 0;
	var coreStaffAmount = 0 ;
    var advisorAmount = 0;
    var reserveAmount = 0; 
    var bountyAmount = 0;

    return WhiteList.new().then(function(instance){
        whiteListInstance = instance;
        return whiteListInstance.listAddress("0x789", 1); // list as slack user
    }).then(function(){
    	return PrivateList.new().then(function(instance2){
	        privateListInstance = instance2;
	        return privateListInstance.listAddress("0x789", 1); // list as slack user
	    }).then(function()){
    		return TokenSale.new( admin,
                      		multisig,
                      		whiteListInstance.address,
                            privateListInstance.address,
                            totalSupply,
                            premintedSupply,
                            publicSaleStartTime,
                            publicSaleEndTime,
                            founderAmount, 
                            coreStaffAmount,
                            advisorAmount, 
                            reserveAmount, 
                            bountyAmount );
	    }
        
    }).then(function(result){
        tokenSaleContract = result;
    });
};