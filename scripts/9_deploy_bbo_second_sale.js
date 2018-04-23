var TokenSale = artifacts.require("./BigbomTokenSale.sol");
var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
var BBToken = artifacts.require("./BigbomToken.sol");
var BBTokenExtended = artifacts.require("./BigbomTokenExtended.sol");

// Copy & Paste this
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }




var tokenSaleContract;
var tokenBBO = '0x65bc9d8ec0a4d5f494ce735d00a8da2bd349d158';


module.exports = function(deployer) {


};