var TokenSale = artifacts.require("./BigbomTokenSale.sol");
var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
var BBToken = artifacts.require("./BigBomToken.sol");

// Copy & Paste this
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }




var tokenSaleContract;

module.exports = function(deployer) {
    var admin = "0x4e6b0ea30f13ff8a1ad799f70fd18947de575e5d";
    var multisig = "0xceFC2e92cD266Df7672D20D0e00Cf78aaf2f060f";
    var whiteListInstance;
    var bbtokenInstance;
    var premintedSupply = web3.toWei( 1000000000, "ether");
    var publicSaleStartTime = new Date('Thu, 08 Mar 2018 07:00:00 GMT').getUnixTime();
    var publicSaleEndTime = new Date('Mon, 12 Mar 2018 07:00:00 GMT').getUnixTime();
    var founderAmount = web3.toWei( 200000000, "ether");
	var coreStaffAmount = web3.toWei( 60000000, "ether");
    var advisorAmount = web3.toWei( 140000000, "ether");
    var reserveAmount = web3.toWei( 330000000, "ether"); 
    var bountyAmount = web3.toWei( 40000000, "ether");




    return WhiteList.new().then(function(instance){
        whiteListInstance = instance;
        return whiteListInstance.listAddress("0x4e6b0ea30f13ff8a1ad799f70fd18947de575e5d", web3.toWei( 1000, "ether")); // list as slack user
    }).then(function(){
    	
         return TokenSale.new( admin,
                                    multisig,
                                    whiteListInstance.address,
                                    premintedSupply,
                                    publicSaleStartTime,
                                    publicSaleEndTime,
                                    founderAmount, 
                                coreStaffAmount,
                                advisorAmount, 
                                reserveAmount, 
                                bountyAmount 
                                  );
                                  
    }).then(function(result){
        tokenSaleContract = result;
    });

};