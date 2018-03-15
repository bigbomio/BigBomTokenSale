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
    var premintedSupply = web3.toWei( 1675000000, "ether");

    var currentTime = web3.eth.getBlock('latest').timestamp;

    var publicSaleStartTime = currentTime + 900;//after 15min

    var publicSaleEndTime = new Date('Mon, 19 Mar 2018 00:00:00 GMT').getUnixTime();
    var publicSaleEndTime7Plus = new Date('Wed, 21 Mar 2018 00:00:00 GMT').getUnixTime();

    console.log(publicSaleStartTime);
    console.log(publicSaleEndTime);
    console.log(publicSaleEndTime7Plus);
    
    var founderAmount = web3.toWei( 200000000, "ether");
	var coreStaffAmount = web3.toWei( 60000000, "ether");
    var advisorAmount = web3.toWei( 140000000, "ether");
    var reserveAmount = web3.toWei( 330000000, "ether"); 
    var bountyAmount = web3.toWei( 40000000, "ether");
    var privateList;
    var tokenBBO;



    return WhiteList.new().then(function(instance){
        whiteListInstance = instance;
        console.log('WhiteList Contract: ', whiteListInstance.address);
        return whiteListInstance.listAddress("0x4e6b0ea30f13ff8a1ad799f70fd18947de575e5d", web3.toWei( 100, "ether"), web3.toWei( 1000, "ether")); 
    }).then(function(){
    	

        return BBToken.new(publicSaleStartTime ,
                                publicSaleEndTime7Plus,
                                admin,
                                founderAmount, 
                                coreStaffAmount,
                                advisorAmount, 
                                reserveAmount, 
                                bountyAmount 
                                  );
    }).then(function(token){
        tokenBBO = token;
        console.log('tokenBBO Contract: ', tokenBBO.address);
        tokenBBO.transfer( multisig, premintedSupply );
        
        return PrivateList.new();
    }).then(function(privateList){
        console.log('PrivateList Contract: ', privateList.address);
        tokenBBO.freezeAccount(multisig, true);
        tokenBBO.setPrivateList(privateList.address); 

        return TokenSale.new( admin,
                                    multisig,
                                    whiteListInstance.address,
                                    publicSaleStartTime,
                                    publicSaleEndTime, tokenBBO.address);                     
    }).then(function(result){
        tokenSaleContract = result;
        
        
        
        console.log('TokenSale Contract: ', tokenSaleContract.address);
        tokenBBO.setTokenSaleContract(tokenSaleContract.address);
        tokenBBO.transfer( tokenSaleContract.address,  web3.toWei( 300000000, "ether") );
        
        
    });

};