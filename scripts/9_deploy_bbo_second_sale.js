var TokenSale = artifacts.require("./BigbomTokenSale.sol");
var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
var BBToken = artifacts.require("./BigbomTokenExtended.sol");
var BBTokenTokenSale2 = artifacts.require("./BigbomTokenSecondSale.sol");

// Copy & Paste this
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }


var whiteList = '0x06b49adcdf085bede979ca59b45c3200656f68fd';
var tokenBBO = '0x32c1f30fb99b78c23eb4b3f05051c0768c834c8b';
var currentTime = 1524495466;
var admin = '0xb10ca39DFa4903AE057E8C26E39377cfb4989551';
var multisign = '0xb10ca39DFa4903AE057E8C26E39377cfb4989551';

var publicSaleStartTime = currentTime + 2 * 3600;//after 60 mins

var publicSaleEndTime = publicSaleStartTime + 3 * 24* 3600; //after 60 mins
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