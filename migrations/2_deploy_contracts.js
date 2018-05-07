var TokenSale = artifacts.require("./BigbomTokenSale.sol");
var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
var BBToken = artifacts.require("./BigbomTokenExtended.sol");

// Copy & Paste this
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }

const Promise = require('bluebird');



var tokenSaleContract;

module.exports = function(deployer) {
    var admin = "0xb10ca39dfa4903ae057e8c26e39377cfb4989551";
    var whiteListOwner = "0xb10ca39dfa4903ae057e8c26e39377cfb4989551";
    var multisig = "0x06e7085946fd86db9715aabb936f772165b613c2";
    var bbFounderCoreStaffWallet = "0x15ae3b540d994ab3bfe59fe2b46c1d459182cc91";
    var bbAdvisorWallet= "0x37df3ec0c17a3fbff8bf63468f59232ec20854e8";
    var bbAirdropWallet= "0x885f19c4ff5ccca47e7fdac2d54fef413136d0b5";
    var bbNetworkGrowthWallet= "0xa37ebbe92b9e0ab69f3d67ae192e12b2d093c998";
    var bbReserveWallet= "0xae3d4976f4a69441242c8d5594b9ea82628a12d3";
    var bbPublicSaleWallet= "0x20b3e271338d02798527a6adbea618e394d190af";

    var founderCoreStaffAmount = 260000000 * 1e18; // 260,000,000
    var advisorAmount = 140000000 * 1e18; // 140,000,000
    var networkGrowthAmount = 600000000 * 1e18; //600,000,000
    var reserveAmount = 635000000 * 1e18; // 635,000,000
    var bountyAmount = 40000000 * 1e18; // 40,000,000
    var publicSaleAmount = 275000000 * 1e18; // 275,000,000

    var whiteListInstance;
    var bbtokenInstance;
    var premintedSupply = web3.toWei( 1675000000, "ether");

    var currentTime = 1522996396;

    var publicSaleStartTime = currentTime + 2 * 3600;//after 60 mins

    var publicSaleEndTime = publicSaleStartTime + 3600; //after 60 mins
    var publicSaleEndTime7Plus = publicSaleEndTime;

    console.log(publicSaleStartTime);
    console.log(publicSaleEndTime);
    console.log(publicSaleEndTime7Plus);
    
   
    var privateList;
    var tokenBBO;

    setTimeout(function(){
        return WhiteList.new().then(function(instance){
            whiteListInstance = instance;
            
        }).then(function(){
            return BBToken.new(publicSaleStartTime ,
                                    publicSaleEndTime7Plus,
                                    admin, 
                                    bbFounderCoreStaffWallet,
                                    bbAdvisorWallet,
                                    bbAirdropWallet,
                                    bbNetworkGrowthWallet,
                                    bbReserveWallet,
                                    bbPublicSaleWallet,
                                    '0x0'
                                      );
        }).then(function(token){
            tokenBBO = token;
            

            return tokenBBO.transfer( bbFounderCoreStaffWallet, founderCoreStaffAmount );
        }).then(function(){

            return tokenBBO.transfer( bbAdvisorWallet, advisorAmount );
        }).then(function(){
            return tokenBBO.transfer( bbAirdropWallet, bountyAmount );
        }).then(function(){
            return tokenBBO.transfer( bbNetworkGrowthWallet, networkGrowthAmount );
        }).then(function(){
            return tokenBBO.transfer( bbReserveWallet, reserveAmount );
        }).then(function(){
            return tokenBBO.transfer( bbPublicSaleWallet, publicSaleAmount );
        }).then(function(){
            
            return PrivateList.new();
        }).then(function(_privateList){
            privateList = _privateList;
            return tokenBBO.setPrivateList(privateList.address); 
            //todo Lock account
        }).then(function(){
            return tokenBBO.freezeAccount( bbFounderCoreStaffWallet, true, 1800 );
        }).then(function(){
            return tokenBBO.freezeAccount( bbAdvisorWallet, true, 1800 );
        }).then(function(){
            return tokenBBO.freezeAccount( bbAirdropWallet, true, 1800 );
        }).then(function(){
            return tokenBBO.freezeAccount( bbNetworkGrowthWallet, true, 1800 );
        }).then(function(){
            return tokenBBO.freezeAccount( bbReserveWallet, true, 1800 );
        }).then(function(){
            return TokenSale.new( admin,
                                        multisig,
                                        whiteListInstance.address,
                                        publicSaleStartTime,
                                        publicSaleEndTime, tokenBBO.address);                     
        }).then(function(result){
            tokenSaleContract = result;
                    
            
            return tokenBBO.setTokenSaleContract(tokenSaleContract.address);
        }).then(function(){
            return tokenBBO.transfer( tokenSaleContract.address,  web3.toWei( 25000000, "ether") );
            
        }).catch(function(err){
            console.log('err', err);
        }).finally(function(){
            console.log('whiteListInstance Contract: ', whiteListInstance.address);
            console.log('tokenBBO Contract: ', tokenBBO.address);
            console.log('PrivateList Contract: ', privateList.address);
            console.log('TokenSale Contract: ', tokenSaleContract.address);
        });
    }, 3000);

    

};