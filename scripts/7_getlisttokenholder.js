var TokenSale = artifacts.require("./BigbomTokenSale.sol");
var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
var BBToken = artifacts.require("./BigbomToken.sol");
var BBTokenExtended = artifacts.require("./BigbomTokenExtended.sol");
// Copy & Paste this
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }

module.exports = function(deployer) {
	var bboToken = BBToken.at('0x8227CF5171BFdaFad9110775C4Dce2CC5897B5dd');
	var event = bboToken.Transfer({},{fromBlock: 2913050, toBlock: 2913560});
	var targets = [];
	event.get(function(error, response)
    {
    	
  		for (var i = response.length - 1; i >= 0; i--) {
  			if(targets.indexOf(response[i].args._to)<0)
    			targets.push(response[i].args._to);
  		}
      console.log(targets);
    	console.log(targets.length);
    	
    });
   
};
