var TokenSale = artifacts.require("./BigbomTokenSale.sol");
var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
var BBToken = artifacts.require("./BigbomTokenExtended.sol");
var BBTokenTokenSale2 = artifacts.require("./BigbomCrowdSale.sol");

// Copy & Paste this
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }


var whiteList = '0xdd91e7ceca7e77dcdf52bb684af6a42fbdcc969f';
var tokenBBO = '0x730941eb3a765b7c8adbdb383064fe41943369eb';
var currentTime = 1524558026;
var admin = '0xb10ca39DFa4903AE057E8C26E39377cfb4989551';
var multisign = '0xb10ca39DFa4903AE057E8C26E39377cfb4989551';

var publicSaleStartTime = currentTime + 900;//after 60 mins

var publicSaleEndTime = publicSaleStartTime + 7 * 24* 3600; //after 60 mins
var bboTokenSale;
var bboTokenInstance;
module.exports = function(deployer) {
	console.log('aaaaa');
	return BBTokenTokenSale2.new(admin,
                              multisign,
                              whiteList,
                              publicSaleStartTime,
                              publicSaleEndTime,
                              tokenBBO)
	.then(function(tokenSale){
		console.log('tokenSale', tokenSale.address);
    bboTokenSale = tokenSale;
    bboTokenInstance = BBToken.at(tokenBBO);
    return bboTokenInstance.setTimeSale(publicSaleStartTime, publicSaleEndTime);
    	}).then(function(){
    	return bboTokenInstance.setTokenSaleContract(bboTokenSale.address);
    	}).then(function(){

    		return bboTokenInstance.transfer( bboTokenSale.address,  web3.toWei( 20000000, "ether") );

    });
                             

};