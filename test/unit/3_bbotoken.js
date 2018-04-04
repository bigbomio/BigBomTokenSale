var Token = artifacts.require("./BigbomToken.sol");
var TokenExtended = artifacts.require("./BigbomTokenExtended.sol");
var Helpers = require('./../helpers.js');
var BigNumber = require('bignumber.js');
////////////////////////////////////////////////////////////////////////////////

var tokenContract;
var tokenContractExtended;
var saleStartTime;
var saleEndTime;

var tokenOwner;
var tokenAdmin;

var tokenOwnerAccount;
var nonOwnerAccount;

var totalSupply = 2000000000 * 1e18;
var b1;

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

    return Token.new(saleStartTime,saleEndTime, tokenAdmin, accounts[24], accounts[25], accounts[26], accounts[27], accounts[28], accounts[29],{from: tokenOwner}).then(function(result){
        tokenContract = result;
        
        // check total supply
        return tokenContract.totalSupply();
    }).then(function(result){
        console.log(result.valueOf());
        assert.equal(result.valueOf(), totalSupply, "unexpected total supply");
        
        // check that owner gets all supply
        return tokenContract.balanceOf(tokenOwner);
    }).then(function(result){
        assert.equal(result.valueOf(), totalSupply.valueOf(), "unexpected owner balance");
    });
  });

  it("set token sale contract before ICO", function() {
      return tokenContract.setTokenSaleContract(accounts[1], {from:tokenAdmin}).then(function(){
          return tokenContract.tokenSaleContract();
      }).then(function(result){
          assert.equal(result, accounts[1], "unexpected tokenSaleContract" + result);
      });
  });
  it("set time sale before ICO", function() {
    saleEndTime =  saleStartTime + 48 * 60 * 60;
    console.log(saleEndTime)
      return tokenContract.setTimeSale(saleStartTime, saleEndTime, {from:tokenAdmin}).then(function(){
          return tokenContract.saleEndTime();
      }).then(function(result){
        console.log(result.valueOf());
          assert.equal(result.valueOf(), saleEndTime.valueOf(), "unexpected tokenSaleContract" + result);
      });
  });

  it("transfer before token sale 2", function() {
    var value = 5e15;
    return tokenContract.transfer(accounts[2], value, {from:tokenOwner}).then(function(){
        // get balances
        return tokenContract.balanceOf(tokenOwner);
      }).then(function(result){
        assert.equal(result.valueOf(), totalSupply - value, "unexpected balance 1");
        return tokenContract.balanceOf(accounts[2]);
      }).then(function(result){
        assert.equal(result.valueOf(), value.valueOf(), "unexpected balance 2");    
      });
  });

  it("fast forward to token sale", function() {
    var fastForwardTime = saleStartTime - web3.eth.getBlock('latest').timestamp + 1;
    return Helpers.sendPromise( 'evm_increaseTime', [fastForwardTime] ).then(function(){
        return Helpers.sendPromise( 'evm_mine', [] ).then(function(){
            var currentTime = web3.eth.getBlock('latest').timestamp;
            if( currentTime <= saleStartTime ) assert.fail( "current time is not as expected" );
        });
    });
  });
  
  it("set token sale contract in ICO", function() {
     return tokenContract.setTokenSaleContract(accounts[2], {from:tokenAdmin}).then(function(){
          assert.fail("set token sale contract should fail in token sale");  
      }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);
       });
  });
  it("set time sale in ICO", function() {
    
      return tokenContract.setTimeSale(saleStartTime, saleEndTime, {from:tokenAdmin}).then(function(){
          assert.fail("set time sale should fail in token sale");  
      }).catch(function(error){

           assert( Helpers.throwErrorMessage(error), "expected throw got " + error);
      });
  });

  it("transfer from owner in token sale 2", function() {
    var value =  5e15;
    return tokenContract.transfer(accounts[2], value, {from:tokenOwner}).then(function(){
        assert.fail("transfer from should fail in token sale");  
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);
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

  it("fast forward to token sale end", function() {
    var fastForwardTime = saleEndTime - web3.eth.getBlock('latest').timestamp + 1;
    console.log(saleEndTime);
    return Helpers.sendPromise( 'evm_increaseTime', [fastForwardTime] ).then(function(){
        return Helpers.sendPromise( 'evm_mine', [] ).then(function(){
            var currentTime = web3.eth.getBlock('latest').timestamp;
            if( currentTime <= saleEndTime ) assert.fail( "current time is not as expected" );
        });
    });
  });
  
  it("transfer from owner after token sale", function() {
    var value = web3.toWei( 100, "finney" );
    return tokenContract.transfer(accounts[14], value, {from:tokenOwner});
  });
  
  it("transfer more than balance", function() {
    var value = web3.toWei( 101, "finney" );
    return tokenContract.transfer(accounts[5], value, {from:accounts[14]}).then(function(){
        assert.fail("transfer should fail");                
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transfer to address 0", function() {
    var value = web3.toWei( 1, "finney" );
    return tokenContract.transfer("0x0000000000000000000000000000000000000000", value, {from:accounts[14]}).then(function(){
        assert.fail("transfer should fail");                
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transfer to token contract", function() {
    var value = web3.toWei(1, "finney" );
    return tokenContract.transfer(tokenContract.address, value, {from:accounts[14]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transfer - see that balance changes", function() {
    var value = 60 * 1e15;
    return tokenContract.transfer(accounts[5], value, {from:accounts[14]}).then(function(){
        return tokenContract.balanceOf(accounts[14]);
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
    return tokenContract.transferFrom(accounts[5], accounts[14], value, {from:accounts[1]}).then(function(){
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
        assert.equal(result.valueOf(),totalSupply - value, "unexpected balance");
        totalSupply = totalSupply - value;    
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
  
  
  
  it("deploy another token and send it to token contract", function() {
    totalSupply = 2000000000 * 1e18
    tokenOwner = accounts[0];
    tokenAdmin = accounts[1];
    
    var currentTime = web3.eth.getBlock('latest').timestamp;

    saleStartTime = currentTime + 3600; // 1 hour from now
    saleEndTime = saleStartTime + 24 * 60 * 60; // 24 hours sale

    return Token.new(saleStartTime,saleEndTime, tokenAdmin, accounts[24], accounts[25], accounts[26], accounts[27], accounts[28], accounts[29],  {from: tokenOwner}).then(function(result){
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

  it("deploy token and init accounts 2", function() {
    var currentTime = web3.eth.getBlock('latest').timestamp;

    saleStartTime = currentTime + 3600; // 1 hour from now
    saleEndTime = saleStartTime + 24 * 60 * 60; // 24 hours sale

    return Token.new(saleStartTime,saleEndTime, tokenAdmin, accounts[24], accounts[25], accounts[26], accounts[27], accounts[28], accounts[29],   {from: accounts[5]}).then(function(result){
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

  it("try to unfreeze account in frozenTime ", function(){
    return tokenContract.freezeAccount(accounts[0], true, 3600, {from:tokenAdmin}).then(function(){
      return tokenContract.freezeAccount(accounts[0], false, 0, {from:tokenAdmin}).then(function(){

         assert.fail("unfreeze should fail");
        }).catch(function(error){
            assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
        });
      });
  });
  it("fast forward to frozenTime", function() {
    var fastForwardTime = 3600;
    return Helpers.sendPromise( 'evm_increaseTime', [fastForwardTime] ).then(function(){
        return Helpers.sendPromise( 'evm_mine', [] ).then(function(){
            var currentTime = web3.eth.getBlock('latest').timestamp;
            if( currentTime > saleEndTime ) assert.fail( "current time is not as expected" );
        });
    });
  });
  it("try to unfreeze account after frozenTime ", function(){
      return tokenContract.freezeAccount(accounts[0], false, 0, {from:tokenAdmin}).then(function(){
        return tokenContract.frozenAccount(accounts[0]).then(function(result){
           assert(!result,  "expected throw got " + result);
        });
            
        });
  });
   it("fast forward to token sale end", function() {
    var fastForwardTime = saleEndTime - web3.eth.getBlock('latest').timestamp + 1;
    console.log(saleEndTime);
    return Helpers.sendPromise( 'evm_increaseTime', [fastForwardTime] ).then(function(){
        return Helpers.sendPromise( 'evm_mine', [] ).then(function(){
            var currentTime = web3.eth.getBlock('latest').timestamp;
            if( currentTime <= saleEndTime ) assert.fail( "current time is not as expected" );
        });
    });
  });
  it("try to transfer from owner to corefounder accounts", function(){
      return tokenContract.transfer(accounts[24], 260000000 * 1e18, {from:tokenOwner}).then(function(){
        return tokenContract.balanceOf(accounts[24]).then(function(result){
           assert.equal(result.valueOf(), 260000000 * 1e18,  "expected throw got " + result);
        });
            
        });
  });
  it("try to transfer from corefounder accounts", function(){
      return tokenContract.transfer(accounts[20], 1000000 * 1e18, {from:accounts[24]}).then(function(){
        return tokenContract.balanceOf(accounts[20]).then(function(result){
           assert.equal(result.valueOf(), 1000000 * 1e18,  "expected throw got " + result);
        }).then(function(){
          return tokenContract.maxAllowedAmount(accounts[24]);
        }).then(function(result){
          assert.equal(result.valueOf(), 1000000 * 1e18,"expected throw got " + result );
        });
            
        });
  });
   it("try to transfer from corefounder accounts", function(){
      return tokenContract.transfer(accounts[21], 8999999 * 1e18, {from:accounts[24]}).then(function(){
        return tokenContract.balanceOf(accounts[21]).then(function(result){
           assert.equal(result.valueOf(), 8999999 * 1e18,  "expected throw got " + result);
        }).then(function(){
          return tokenContract.maxAllowedAmount(accounts[24]);
        }).then(function(result){
          assert.equal(result.valueOf(), 9999999 * 1e18,"expected throw got " + result );
        });
            
        });
  });
  it("try to transfer from corefounder accounts max caps", function(){
      return tokenContract.transfer(accounts[22], 1*1e18, {from:accounts[24]}).then(function(){
        return tokenContract.balanceOf(accounts[22]).then(function(result){
           assert.equal(result.valueOf(), 1*1e18,  "expected throw got " + result);
        });
            
        });
  });
   it("try to unfreeze account in frozenTime ", function(){
      return tokenContract.selfFreeze(false, 0, {from:accounts[24]}).then(function(){
          assert.fail("transfer from corefounder accounts over caps should fail");
        }).catch(function(error){
            assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
        });
      
  });
  it("try to transfer from corefounder accounts over caps", function(){
      return tokenContract.transfer(accounts[23], 1 * 1e18, {from:accounts[24]}).then(function(){
            assert.fail("transfer from corefounder accounts over caps should fail");
        }).catch(function(error){
            assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
        });
            
        
  });
   it("fast forward to 24h after locked", function() {
    var fastForwardTime = 24 * 3600 + 1;
    console.log(saleEndTime);
    return Helpers.sendPromise( 'evm_increaseTime', [fastForwardTime] ).then(function(){
        return Helpers.sendPromise( 'evm_mine', [] ).then(function(){

        });
    });
  });
    it("try to unfreeze account after frozenTime ", function(){
      return tokenContract.selfFreeze( false, 0, {from:accounts[24]}).then(function(){
        return tokenContract.frozenAccount(accounts[24]).then(function(result){
           assert(!result,  "expected throw got " + result);
        });
            
        });
  });
   it("try to transfer from corefounder accounts", function(){
      return tokenContract.transfer(accounts[10], 1000000 * 1e18, {from:accounts[24]}).then(function(){
        return tokenContract.balanceOf(accounts[10]).then(function(result){
           assert.equal(result.valueOf(), 1000000 * 1e18,  "expected throw got " + result);
        }).then(function(){
          return tokenContract.maxAllowedAmount(accounts[24]);
        }).then(function(result){
          assert.equal(result.valueOf(), 1000000 * 1e18,"expected throw got " + result );
        });
            
        });
  });
   it("init token TokenExtended ", function(){
     tokenOwner = accounts[21];
     tokenAdmin = accounts[21];
    
    var currentTime = web3.eth.getBlock('latest').timestamp;

    saleStartTime = currentTime + 3600; // 1 hour from now
    saleEndTime = saleStartTime + 24 * 60 * 60; // 24 hours sale

    return TokenExtended.new(saleStartTime,saleEndTime, tokenAdmin, accounts[24], accounts[25], accounts[26], accounts[27], accounts[28], accounts[29], tokenContract.address,{from: tokenOwner}).then(function(result){
        tokenContractExtended = result;
        
        // check total supply
        return tokenContractExtended.totalSupply();
    }).then(function(result){
        console.log(result.valueOf());
        assert.equal(result.valueOf(), totalSupply, "unexpected total supply");
        
        // check that owner gets all supply
        return tokenContractExtended.balanceOf(tokenOwner);
    }).then(function(result){
        assert.equal(result.valueOf(), totalSupply.valueOf(), "unexpected owner balance");
    });
  });
    it("airdrop token TokenExtended ", function(){
    return tokenContractExtended.airDrop([accounts[24]],{from: tokenOwner}).then(function(result){
  
        return tokenContractExtended.balanceOf(accounts[24]);
    }).then(function(result){
        b1 = result;
        console.log(b1.valueOf())
        return tokenContract.balanceOf(accounts[24]);
    }).then(function(result){
        assert.equal(result.valueOf(), b1.valueOf(), "unexpected owner balance");
    });
  });
  it("airdrop token TokenExtended 900", function(){
    return tokenContractExtended.airDrop(accounts,{from: tokenOwner}).then(function(result){
  
        return tokenContractExtended.balanceOf(accounts[24]);
    }).then(function(result){
        
        assert.equal(result.valueOf(),10000e18, "unexpected owner balance");
    });
  });

erc20TokenContract
    
});



