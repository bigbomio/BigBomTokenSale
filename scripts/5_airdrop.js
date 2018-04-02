var TokenSale = artifacts.require("./BigbomTokenSale.sol");
var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
var BBToken = artifacts.require("./BigbomTokenExtended.sol");
var BBTokenExtended = artifacts.require("./BigbomTokenExtended.sol");

// Copy & Paste this
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }



module.exports = function(deployer) {
    return BBTokenExtended.at({from:whiteListOwner})..then(function(instance){
         whiteListInstance = instance;
         console.log('whiteListInstance Contract: ', whiteListInstance.address);
     });
};
