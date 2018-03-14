var Token = artifacts.require("./BigBomToken.sol");
var Helpers = require('./../helpers.js');
var BigNumber = require('bignumber.js');
////////////////////////////////////////////////////////////////////////////////

var tokenContract;
var saleStartTime;
var saleEndTime;

var tokenOwner;
var tokenAdmin;

var tokenOwnerAccount;
var nonOwnerAccount;

var totalSupply = 2000000000 * 1e18;
var founderAmount = web3.toWei( 200000000, "ether");
var coreStaffAmount = web3.toWei( 60000000, "ether");
var advisorAmount = web3.toWei( 140000000, "ether");
var reserveAmount = web3.toWei( 330000000, "ether"); 
var bountyAmount = web3.toWei( 40000000, "ether");

var erc20TokenContract;

////////////////////////////////////////////////////////////////////////////////

contract('token contract', function(accounts) {

  beforeEach(function(done){
    done();
  });
  afterEach(function(done){
    done();
  });


  it("deploy token and init accounts", function() {
    tokenOwner = accounts[0];
    tokenAdmin = accounts[1];
    
    var currentTime = web3.eth.getBlock('latest').timestamp;

    saleStartTime = currentTime + 3600; // 1 hour from now
    saleEndTime = saleStartTime + 24 * 60 * 60; // 24 hours sale

    return Token.new(saleStartTime,saleEndTime, tokenAdmin,   founderAmount, 
                                coreStaffAmount,
                                advisorAmount, 
                                reserveAmount, 
                                bountyAmount ,{from: tokenOwner}).then(function(result){
        tokenContract = result;
        
        // check total supply
        return tokenContract.totalSupply();
    }).then(function(result){
        console.log(result.valueOf());
        assert.equal(result.valueOf(), totalSupply, "unexpected total supply");
        
        // check that owner gets all supply
        return tokenContract.balanceOf(tokenOwner);
    }).then(function(result){
        assert.equal(result, totalSupply, "unexpected owner balance");
    });
  });
  
  it("transfer before token sale", function() {
    var value = 5 * 1e15;
    return tokenContract.transfer(accounts[2], value, {from:tokenOwner}).then(function(){
        // get balances
        return tokenContract.balanceOf(tokenOwner);
      }).then(function(result){
        assert.equal(result.valueOf(), totalSupply - value, "unexpected balance");
        return tokenContract.balanceOf(accounts[2]);
      }).then(function(result){
        assert.equal(result.valueOf(), value.valueOf(), "unexpected balance");    
      });
  });
  it("deploy token get open sale", function() {
    tokenOwner = accounts[0];
    tokenAdmin = accounts[1];
    
    var currentTime = web3.eth.getBlock('latest').timestamp;

    saleStartTime = currentTime; 
    saleEndTime = saleStartTime + 24 * 60 * 60; // 24 hours sale

    return Token.new(saleStartTime,saleEndTime, tokenAdmin,   founderAmount, 
                                coreStaffAmount,
                                advisorAmount, 
                                reserveAmount, 
                                bountyAmount ,{from: tokenOwner}).then(function(result){
        tokenContract = result;
        
        // check total supply
        return tokenContract.totalSupply();
    }).then(function(result){
        console.log(result.valueOf());
        assert.equal(result.valueOf(), totalSupply, "unexpected total supply");
        
        // check that owner gets all supply
        return tokenContract.balanceOf(tokenOwner);
    }).then(function(result){
        assert.equal(result, totalSupply, "unexpected owner balance");
    });
  });
  // it("fast forward to token sale", function() {
  //   var fastForwardTime = saleStartTime - web3.eth.getBlock('latest').timestamp + 1;
  //   return Helpers.sendPromise( 'evm_increaseTime', [fastForwardTime] ).then(function(){
  //       return Helpers.sendPromise( 'evm_mine', [] ).then(function(){
  //           var currentTime = web3.eth.getBlock('latest').timestamp;
  //           if( currentTime <= saleStartTime ) assert.fail( "current time is not as expected" );
  //       });
  //   });
  // });
    
  it("transfer from owner in token sale", function() {
    var value =  5 * 1e15;
    return tokenContract.transfer(accounts[2], value, {from:tokenOwner}).then(function(){
        // get balances
        return tokenContract.balanceOf(tokenOwner);
      }).then(function(result){
        assert.equal(result.valueOf(), totalSupply - value, "unexpected balance");
        return tokenContract.balanceOf(accounts[2]);
      }).then(function(result){
        assert.equal(result.valueOf(), value , "unexpected balance");    
      });
  });

  it("transfer from non owner in token sale", function() {
    var value = 5 * 1e15;
    return tokenContract.transfer(accounts[1], value, {from:accounts[2]}).then(function(){
        assert.fail("transfer is during sale is expected to fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transferfrom non owner in token sale", function() {
    var value = 5 * 1e15;
    return tokenContract.approve(accounts[5], value, {from:accounts[2]}).then(function(){
        return tokenContract.transferFrom(accounts[2],accounts[3],value,{from:accounts[5]});
    }).then(function(){
        assert.fail("transfer from should fail in token sale");  
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);
        // revert approve
        return tokenContract.approve(accounts[5], 0, {from:accounts[2]});
    });
  });

  // it("fast forward to token sale end", function() {
  //   var fastForwardTime = saleEndTime - web3.eth.getBlock('latest').timestamp + 1;
  //   return Helpers.sendPromise( 'evm_increaseTime', [fastForwardTime] ).then(function(){
  //       return Helpers.sendPromise( 'evm_mine', [] ).then(function(){
  //           var currentTime = web3.eth.getBlock('latest').timestamp;
  //           if( currentTime <= saleEndTime ) assert.fail( "current time is not as expected" );
  //       });
  //   });
  // });
  it("deploy token to token sale end", function() {
    tokenOwner = accounts[0];
    tokenAdmin = accounts[1];
    
    var currentTime = web3.eth.getBlock('latest').timestamp;

    saleStartTime = currentTime - 3600; 
    saleEndTime = saleStartTime + 24 * 60 * 60; // 24 hours sale

    return Token.new(saleStartTime,saleEndTime, tokenAdmin,   founderAmount, 
                                coreStaffAmount,
                                advisorAmount, 
                                reserveAmount, 
                                bountyAmount ,{from: tokenOwner}).then(function(result){
        tokenContract = result;
        
        // check total supply
        return tokenContract.totalSupply();
    }).then(function(result){
        console.log(result.valueOf());
        assert.equal(result.valueOf(), totalSupply, "unexpected total supply");
        
        // check that owner gets all supply
        return tokenContract.balanceOf(tokenOwner);
    }).then(function(result){
        assert.equal(result, totalSupply, "unexpected owner balance");
    });
  });
  it("transfer from owner after token sale", function() {
    var value = web3.toWei( 100, "finney" );
    return tokenContract.transfer(accounts[4], value, {from:tokenOwner});
  });
  
  it("transfer more than balance", function() {
    var value = web3.toWei( 101, "finney" );
    return tokenContract.transfer(accounts[5], value, {from:accounts[4]}).then(function(){
        assert.fail("transfer should fail");                
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transfer to address 0", function() {
    var value = web3.toWei( 1, "finney" );
    return tokenContract.transfer("0x0000000000000000000000000000000000000000", value, {from:accounts[4]}).then(function(){
        assert.fail("transfer should fail");                
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transfer to token contract", function() {
    var value = web3.toWei(1, "finney" );
    return tokenContract.transfer(tokenContract.address, value, {from:accounts[4]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transfer - see that balance changes", function() {
    var value = 60 * 1e15;
    return tokenContract.transfer(accounts[5], value, {from:accounts[4]}).then(function(){
        return tokenContract.balanceOf(accounts[4]);
    }).then(function(result){
        assert.equal(result.valueOf(), 40 * 1e15, "unexpected balance");
        return tokenContract.balanceOf(accounts[5]);
    }).then(function(result){
        assert.equal(result.valueOf(),60 * 1e15, "unexpected balance");    
    });
  });
  
  it("approve more than balance", function() {
    var value = 180 * 1e15;
    return tokenContract.approve(accounts[1], value, {from:accounts[5]}).then(function(){
        return tokenContract.allowance(accounts[5],accounts[1]);
    }).then(function(result){
        assert.equal(result.valueOf(), value.valueOf(), "unexpected allowance");
    });
  });

  it("transferfrom more than balance", function() {
    var value = 180 * 1e15; 
    return tokenContract.transferFrom(accounts[5], accounts[4], value, {from:accounts[1]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transferfrom to address 0", function() {
    var value = web3.toWei( 10, "finney" );
    return tokenContract.transferFrom(accounts[5], "0x0000000000000000000000000000000000000000", value, {from:accounts[1]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transferfrom to token contract", function() {
    var value = web3.toWei(10, "finney" );
    return tokenContract.transferFrom(accounts[5], tokenContract.address, value, {from:accounts[1]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transferfrom", function() {
    var value = 10 * 1e15;
    return tokenContract.transferFrom(accounts[5], accounts[3], value, {from:accounts[1]}).then(function(){
        // check balance was changed
        return tokenContract.balanceOf(accounts[3]);
    }).then(function(result){
        assert.equal(result.valueOf(), value.valueOf(), "unexpected balance");
        return tokenContract.balanceOf(accounts[5]);
    }).then(function(result){
        assert.equal(result.valueOf(), 50*1e15, "unexpected balance");
        
        // check allwance was changed
        return tokenContract.allowance(accounts[5],accounts[1]);
    }).then(function(result){
        assert.equal(result.valueOf(), 170*1e15, "unexpected allowance");
    });
  });


  it("burn - see that balance and total supply changes", function() {
    var value =4*1e15;
    return tokenContract.burn(value, {from:accounts[3]}).then(function(){
        return tokenContract.balanceOf(accounts[3]);
    }).then(function(result){
        assert.equal(result.valueOf(), 6*1e15, "unexpected balance");
        // check total supply
        return tokenContract.totalSupply();
    }).then(function(result){
        assert.equal(result.valueOf(), (totalSupply.minus(value)).valueOf(), "unexpected balance");
        totalSupply = totalSupply.minus(value);    
    });
  });

  it("burn - burn more than balance should fail", function() {
    var value = 14*1e15;
    return tokenContract.burn(value, {from:accounts[3]}).then(function(){
        assert.fail("burn should fail");    
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });
  
  it("transfer from owner in token sale", function() {
    var value = web3.toWei( 100, "finney" );
    return tokenContract.transfer(accounts[5], value, {from:tokenOwner});
  });

  it("burn from", function() {
    var value = 50*1e15;
    return tokenContract.approve(accounts[3], value, {from:accounts[5]}).then(function(){
        return tokenContract.burnFrom(accounts[5], value, {from:accounts[3]});
    }).then(function(){
        // check accounts[5] balance was reduced
        return tokenContract.balanceOf(accounts[5]);
    }).then(function(result){
        assert.equal(result.valueOf(), 50*1e15, "unexpected balance");
        
        // check total supply was reduced
        return tokenContract.totalSupply();
    }).then(function(result){
        assert.equal(result.valueOf(), totalSupply-50*1e15, "unexpected total supply");
        totalSupply = totalSupply-50*1e15;
    });
  });

  it("deploy another token and send it to token contract", function() {
    tokenOwner = accounts[0];
    tokenAdmin = accounts[1];
    
    var currentTime = web3.eth.getBlock('latest').timestamp;

    saleStartTime = currentTime + 3600; // 1 hour from now
    saleEndTime = saleStartTime + 24 * 60 * 60; // 24 hours sale

    return Token.new(saleStartTime,saleEndTime, tokenAdmin,   founderAmount, 
                                coreStaffAmount,
                                advisorAmount, 
                                reserveAmount, 
                                bountyAmount, {from: tokenOwner}).then(function(result){
        tokenContract = result;
        
        // check total supply
        return tokenContract.totalSupply();        
    }).then(function(result){
        assert.equal(result.valueOf(), totalSupply.valueOf(), "unexpected total supply");
        
        // check that owner gets all supply
        return tokenContract.balanceOf(tokenOwner);
    }).then(function(result){
        assert.equal(result.valueOf(), totalSupply.valueOf(), "unexpected owner balance");
    });
  });

  

  it("mine one block to get current time", function() {
    return Helpers.sendPromise( 'evm_mine', [] );
  });

  it("deploy token and init accounts", function() {
    var currentTime = web3.eth.getBlock('latest').timestamp;

    saleStartTime = currentTime + 3600; // 1 hour from now
    saleEndTime = saleStartTime + 24 * 60 * 60; // 24 hours sale

    return Token.new(saleStartTime,saleEndTime, tokenAdmin,   founderAmount, 
                                coreStaffAmount,
                                advisorAmount, 
                                reserveAmount, 
                                bountyAmount, {from: accounts[5]}).then(function(result){
        erc20TokenContract = result;
        return erc20TokenContract.transfer(tokenContract.address,1e15,{from:accounts[5]});
    }).then(function(){
        // check balance
        return erc20TokenContract.balanceOf(tokenContract.address);
    }).then(function(result){
        assert.equal(result.valueOf(),1e15, "unexpected balance" );          
    });
  });

  it("try to drain contract from non-admin address", function() {
    return tokenContract.emergencyERC20Drain( erc20TokenContract.address, web3.toWei( 1, "finney" ), {from:tokenOwner}).then(function(result){
    }).then(function(){
        assert.fail("burn should fail");    
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("try to drain contract from admin address", function() {
    return tokenContract.emergencyERC20Drain( erc20TokenContract.address, 1e15, {from:tokenAdmin}).then(function(result){
    }).then(function(){
        return erc20TokenContract.balanceOf(tokenAdmin);
    }).then(function(result){
        assert.equal(result.valueOf(), 1e15, "unexpected admin balance");
    });
  });


  
// TODO - check drain


erc20TokenContract


    
});



