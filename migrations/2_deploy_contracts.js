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
    // var admin = "0x4e6b0ea30f13ff8a1ad799f70fd18947de575e5d";
    // var multisig = "0x06e7085946fd86db9715aabb936f772165b613c2";
    // var bbFounderCoreStaffWallet = "0x15ae3b540d994ab3bfe59fe2b46c1d459182cc91";
    // var bbAdvisorWallet= "0x37df3ec0c17a3fbff8bf63468f59232ec20854e8";
    // var bbAirdropWallet= "0x885f19c4ff5ccca47e7fdac2d54fef413136d0b5";
    // var bbNetworkGrowthWallet= "0xa37ebbe92b9e0ab69f3d67ae192e12b2d093c998";
    // var bbReserveWallet= "0xae3d4976f4a69441242c8d5594b9ea82628a12d3";
    // var bbPublicSaleWallet= "0x20b3e271338d02798527a6adbea618e394d190af";

    // var founderCoreStaffAmount = 260000000 * 1e18; // 260,000,000
    // var advisorAmount = 140000000 * 1e18; // 140,000,000
    // var networkGrowthAmount = 600000000 * 1e18; //600,000,000
    // var reserveAmount = 635000000 * 1e18; // 635,000,000
    // var bountyAmount = 40000000 * 1e18; // 40,000,000
    // var publicSaleAmount = 275000000 * 1e18; // 275,000,000

    // var whiteListInstance;
    // var bbtokenInstance;
    // var premintedSupply = web3.toWei( 1675000000, "ether");

    // var currentTime = web3.eth.getBlock('latest').timestamp;

    // var publicSaleStartTime = currentTime + (1.5 * 3600);//after 60 mins

    // var publicSaleEndTime = publicSaleStartTime + 3600; //after 60 mins
    // var publicSaleEndTime7Plus = publicSaleEndTime;

    // console.log(publicSaleStartTime);
    // console.log(publicSaleEndTime);
    // console.log(publicSaleEndTime7Plus);
    
   
    // var privateList;
    // var tokenBBO;



    // return WhiteList.new().then(function(instance){
    //     whiteListInstance = instance;
    // }).then(function(){
    //     return BBToken.new(publicSaleStartTime ,
    //                             publicSaleEndTime7Plus,
    //                             admin, 
    //                             bbFounderCoreStaffWallet,
    //                             bbAdvisorWallet,
    //                             bbAirdropWallet,
    //                             bbNetworkGrowthWallet,
    //                             bbReserveWallet,
    //                             bbPublicSaleWallet
    //                               );
    // }).then(function(token){
    //     tokenBBO = token;
    //     console.log('tokenBBO Contract: ', tokenBBO.address);

    //     tokenBBO.transfer( bbFounderCoreStaffWallet, founderCoreStaffAmount );
    //     tokenBBO.transfer( bbAdvisorWallet, advisorAmount );
    //     tokenBBO.transfer( bbAirdropWallet, bountyAmount );
    //     tokenBBO.transfer( bbNetworkGrowthWallet, networkGrowthAmount );
    //     tokenBBO.transfer( bbReserveWallet, reserveAmount );
    //     tokenBBO.transfer( bbPublicSaleWallet, publicSaleAmount );

        
    //     return PrivateList.new();
    // }).then(function(privateList){
    //     console.log('PrivateList Contract: ', privateList.address);
    //     tokenBBO.setPrivateList(privateList.address); 
    //     //todo Lock account
    //     tokenBBO.freezeAccount( bbFounderCoreStaffWallet, true, 1800 );
    //     tokenBBO.freezeAccount( bbAdvisorWallet, true, 1800 );
    //     tokenBBO.freezeAccount( bbAirdropWallet, true, 1800 );
    //     tokenBBO.freezeAccount( bbNetworkGrowthWallet, true, 1800 );
    //     tokenBBO.freezeAccount( bbReserveWallet, true, 1800 );

    //     return TokenSale.new( admin,
    //                                 multisig,
    //                                 whiteListInstance.address,
    //                                 publicSaleStartTime,
    //                                 publicSaleEndTime, tokenBBO.address);                     
    // }).then(function(result){
    //     tokenSaleContract = result;
                
    //     console.log('TokenSale Contract: ', tokenSaleContract.address);
    //     tokenBBO.setTokenSaleContract(tokenSaleContract.address);
    //     tokenBBO.transfer( tokenSaleContract.address,  web3.toWei( 25000000, "ether") );
        
    // });

};