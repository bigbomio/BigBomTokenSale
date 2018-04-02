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

module.exports = function(deployer) {
    var admin = "0xb10ca39DFa4903AE057E8C26E39377cfb4989551";
    var whiteListOwner = "0xb10ca39DFa4903AE057E8C26E39377cfb4989551";
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

    var currentTime = web3.eth.getBlock('latest').timestamp;

    var publicSaleStartTime = currentTime + 2 * 3600;//after 60 mins

    var publicSaleEndTime = publicSaleStartTime + 3600; //after 60 mins
    var publicSaleEndTime7Plus = publicSaleEndTime;

   
    var privateList;
    var tokenBBO;

    var privateList_address = '0x0';
    var tokenSaleContract_address = '0x0';
    var tokenBBO = '0x0'
    
    return BBTokenExtended.new(publicSaleStartTime ,
                                publicSaleEndTime7Plus,
                                admin, 
                                bbFounderCoreStaffWallet,
                                bbAdvisorWallet,
                                bbAirdropWallet,
                                bbNetworkGrowthWallet,
                                bbReserveWallet,
                                bbPublicSaleWallet,
                                tokenBBO
                                  ).then(function(token){
        tokenBBOExt = token;                         
        tokenBBOExt.setPrivateList(privateList_address); 
        tokenBBOExt.setTokenSaleContract(tokenSaleContract_address);
      
    });

};