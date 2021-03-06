var TokenSale = artifacts.require("./BigbomTokenSale.sol");
var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
var BBToken = artifacts.require("./BigbomToken.sol");
var BBTokenExtended = artifacts.require("./BigbomTokenExtended.sol");
var admin = "0xb10ca39DFa4903AE057E8C26E39377cfb4989551";
// Copy & Paste this
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }



module.exports = function(deployer) {
	var bboToken = BBToken.at('0x65bc9d8ec0a4d5f494ce735d00a8da2bd349d158');
	var bboTokenExt = BBTokenExtended.at('0x0953ec14fc48d63736a5cd8fce89443ae212533e');
	var event = bboToken.Transfer({},{fromBlock: 2913050, toBlock: 2913560});
	var targets = [];
	event.get(function(error, response)
    {
    	
  		for (var i = response.length - 1; i >= 0; i--) {
  			if(targets.indexOf(response[i].args._to)<0)
    			targets.push(response[i].args._to);
  		}

    	console.log(targets.length);
    	var partial = [];
    	for (var j = targets.length - 1; j >= 0; j--) {
  			partial.push(targets[j]);
  			if(j%50==0){
  				bboTokenExt.airDrop(partial, {from: admin});
  				partial = [];
  			}
  		}

    });
   
};
