var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var TokenSale = artifacts.require("./BigbomTokenSale.sol");
var Token = artifacts.require("./BigBomToken.sol");
var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
var Helpers = require('./../helpers.js');

var founderAmount = web3.toWei( 200000000, "ether");
var coreStaffAmount = web3.toWei( 60000000, "ether");
var advisorAmount = web3.toWei( 140000000, "ether");
var reserveAmount = web3.toWei( 330000000, "ether"); 
var bountyAmount = web3.toWei( 40000000, "ether");
var premintedSupply = 1675000000 * 1e18;
var totalSupply = 2000000000 * 1e18;

var converFiney = function(amount){
  return web3.toWei(amount, 'finney');
}
////////////////////////////////////////////////////////////////////////////////

var getBalancePromise = function( account ) {
    return new Promise(function (fulfill, reject){
        web3.eth.getBalance(account,function(err,result){
            if( err ) reject(err);
            else fulfill(result);
        });
    });
};


////////////////////////////////////////////////////////////////////////////////

var buyWithEtherSendingPromise = function( tokenSaleContract, sender, value ) {
    return new Promise(function(fulfill, reject){
            web3.eth.sendTransaction({to: tokenSaleContract.address, from: sender, value: value, gasPrice:50000000000, gas: 150000}, function(error, result){
            if( error ) {
                return reject(error);
            }
            else {
                return fulfill(true);
            }
        });
    });
};

////////////////////////////////////////////////////////////////////////////////


var ETHtoBBO = 20000;

var admin;
var multisig;

var whiteListContract;
var companyTokensContract;
var tokenSaleContract;
var tokenContract;
var privateListContract;
var companyWallet;

var cappedSaleStartTime;
var publicSaleStartTime;
var publicSaleEndTime;



var multisigTokenBalance;
var multisigEthBalance;

var proxyAmount = converFiney(0);

////////////////////////////////////////////////////////////////////////////////

contract('token sale', function(accounts) {

  beforeEach(function(done){
    done();
  });
  afterEach(function(done){
    done();
  });

  it("mine one block to get current time", function() {
    return Helpers.sendPromise( 'evm_mine', [] );
  });

  it("deploy white list", function() {
    return WhiteList.new({from:accounts[2],gas:4700000}).then(function(instance){
        whiteListContract = instance;
        return whiteListContract.listAddresses([accounts[0], accounts[1]],
                                               [1e18, 3*1e18 ], [10*1e18, 20*1e18 ], {from:accounts[2]});
    });
  });

  it("deploy token sale contract", function() {
    var currentTime = web3.eth.getBlock('latest').timestamp;

    publicSaleStartTime = currentTime + 100; 
    publicSaleEndTime = publicSaleStartTime + 52 * 24 * 3600;
    publicSaleEndTime7Plus = publicSaleEndTime + 7 * 3600;
    admin = accounts[2];
    multisig = accounts[4];
    
    return Token.new(publicSaleStartTime ,
                                publicSaleEndTime7Plus,
                                admin, accounts[4], accounts[4], accounts[4], accounts[4], accounts[4], accounts[4], {from:accounts[2]} ).then(function(token){
        tokenContract = token;
        console.log('tokenContract Contract: ', tokenContract.address);
        tokenContract.transfer( multisig, premintedSupply , {from:accounts[2]});
        
        return PrivateList.new();
    }).then(function(privateList){
        console.log('PrivateList Contract: ', privateList.address);
        privateListContract = privateList;
        tokenContract.freezeAccount(multisig, true, 3600, {from:accounts[2]});

        tokenContract.setPrivateList(privateList.address, {from:accounts[2]}); 

        return TokenSale.new( admin,
                                    multisig,
                                    whiteListContract.address,
                                    publicSaleStartTime,
                                    publicSaleEndTime,
                                    tokenContract.address, {from:accounts[2]});                     
    }).then(function(result){
        tokenSaleContract = result;
        
        
        
        console.log('TokenSale Contract: ', tokenSaleContract.address);
        return tokenContract.setTokenSaleContract(tokenSaleContract.address, {from:accounts[2]});
      }).then(function(result){

        console.log('setTokenSaleContract ', tokenSaleContract.address);
        return tokenContract.transfer( tokenSaleContract.address,  web3.toWei( 300000000, "ether") , {from:accounts[2]});
        
    }).then(function(result){

        return tokenContract.balanceOf(tokenSaleContract.address);
    }).then(function(result){
        assert.equal( result.valueOf(), 3e26, "unexpected contract balance");
        return tokenContract.balanceOf(multisig);
    }).then(function(result){
        assert.equal( result.valueOf(), premintedSupply, "unexpected company balance");
        multisigTokenBalance = result;
        // check eth balance
        return getBalancePromise(multisig);
    }).then(function(result){
        multisigEthBalance = result;
    });
});
  it("fast forward to token sale", function() {
    var fastForwardTime = publicSaleStartTime - web3.eth.getBlock('latest').timestamp + 1;
    return Helpers.sendPromise( 'evm_increaseTime', [fastForwardTime] ).then(function(){
        return Helpers.sendPromise( 'evm_mine', [] ).then(function(){
            var currentTime = web3.eth.getBlock('latest').timestamp;
            if( currentTime <= publicSaleStartTime ) assert.fail( "current time is not as expected" );
        });
    });
  });

  it("buy with a 1ETH cap", function() {
    return whiteListContract.listAddress(accounts[0],1e18, 3e18, {from:accounts[2]})
    .then(function(result){
      return whiteListContract.getMinCap(accounts[0],  {from:accounts[2]});
    }).then(function(mincap){
      console.log('mincap', mincap.valueOf())
    return tokenSaleContract.buy(accounts[0],{from:accounts[0], value: web3.toWei(1, "ether")})
    }).then(function(){
        console.log('di');
        return tokenContract.balanceOf(accounts[0]);
    }).then(function(value){
       console.log('di', value.valueOf());
         assert.equal(value.valueOf(), 2.5e22 , "expected throw got " +value.valueOf());
    });
  });
  
  
  it("buy debug buy a cap", function() {
    return tokenSaleContract.debugBuy({from:accounts[2], value: web3.toWei(1, "ether")}).then(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);
    });
  });


  it("buy without a cap", function() {
    return tokenSaleContract.buy(accounts[2],{from:accounts[2], value: web3.toWei(1, "ether")}).then(function(){
        assert.fail("expected to throw");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);
    });
  });

  it("buy after full cap was used", function() {
    return tokenSaleContract.buy(accounts[0],{from:accounts[0], value: web3.toWei(20, "ether")}).then(function(){
       return tokenSaleContract.buy(accounts[0],{from:accounts[0], value: web3.toWei(2, "ether")})
        
    }).then(function(){
      assert.fail("expected to throw");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);
    });
  });

   it("fast forward to after token sale  60 days ", function() {
    var fastForwardTime = publicSaleStartTime - web3.eth.getBlock('latest').timestamp + 60 * 24 * 3600 + 10;
    return Helpers.sendPromise( 'evm_increaseTime', [fastForwardTime] ).then(function(){
        return Helpers.sendPromise( 'evm_mine', [] ).then(function(){
            var currentTime = web3.eth.getBlock('latest').timestamp;
            if( currentTime <= publicSaleStartTime ) assert.fail( "current time is not as expected" );
        });
    });
  });
   it("emergency drain from non admin", function() {
    var multisigEthBalance;
    var multisigTokenBalance;

    return tokenSaleContract.emergencyDrain("0x0",{from:accounts[0]}).then(function(){
        assert.fail("expected to throw");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);
    });
  });

  it("emergency drain from admin", function() {
    var multisigEthBalance;
    var multisigTokenBalance;

    // transfer token to contract
    return tokenContract.transfer(tokenSaleContract.address, web3.toWei(1, "ether"), {from:accounts[0]}).then(function(){
        // check multisg balances
        return getBalancePromise(multisig);
    }).then(function(result){
        multisigEthBalance = result;
        return tokenContract.balanceOf(multisig);
    }).then(function(result){
        multisigTokenBalance = result;
        console.log('aaa')
        return tokenSaleContract.emergencyDrain(tokenContract.address,{from:admin});
    }).then(function(){
      console.log('aaa')
        return getBalancePromise(multisig);
    }).then(function(result){
        assert.equal(result.valueOf(), multisigEthBalance.plus(1).valueOf(), "unexpected balance");
        return tokenContract.balanceOf(multisig);
    }).then(function(result){
        assert.equal(result.valueOf(), multisigTokenBalance.plus(1).valueOf(), "unexpected balance");
    });
  });

  it("try to finalize sale as non admin", function() {
    return tokenSaleContract.finalizeSale({from:accounts[0]}).then(function(){
        assert.fail("expected to throw");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);
    });
  });

  it("try to finalize sale as admin", function() {
    var remainingTokens;
    var multisigTokenBalance;
    return tokenContract.balanceOf(tokenSaleContract.address).then(function(result){
        remainingTokens = result;
        return tokenContract.balanceOf(multisig);
    }).then(function(result){
        multisigTokenBalance = result;
        return tokenSaleContract.finalizeSale({from:admin});
    }).then(function(){
        // check total supply
        return tokenContract.totalSupply();
    }).then(function(result){
        assert.equal(result.valueOf(), totalSupply - remainingTokens, "unexpected total supply");
        // check that sale contract supply is 0
        return tokenContract.balanceOf(tokenSaleContract.address);
    }).then(function(result){
        assert.equal(result.valueOf(), 0, "expected balance is 0");
        return tokenContract.balanceOf(multisig);
    }).then(function(result){
        assert.equal(result.valueOf(), multisigTokenBalance.valueOf(), "multisig token balance unexpected");
    });
  });

});
