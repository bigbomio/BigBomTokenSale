var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
var Helpers = require('./../helpers.js');

var listContract;




var caps = [ web3.toWei(1, 'ether'), web3.toWei(10, 'ether'), web3.toWei(11, 'ether'), web3.toWei(0, 'ether')];

var owner;
var nonOwner;


////////////////////////////////////////////////////////////////////////////////



contract('private list', function(accounts) {
  
  beforeEach(function(done){
    done();
  });
  afterEach(function(done){
    done();
  });

  var addresses = [ accounts[0],accounts[1],accounts[2],accounts[3]];
  it("deploy contract", function() {
    owner = accounts[2];
    nonOwner = accounts[0];
    return PrivateList.new({from:owner,gas:4700000}).then(function(instance){
        listContract = instance;
    });
  });



  it("transfer ownership from non owner", function() {
    return listContract.transferOwnership(accounts[3], {from:nonOwner}).then(function(){
        assert.fail("set cap should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);

        // check that value was not set
        return listContract.owner();
    }).then(function(result){
        assert.equal( result.valueOf(), owner.valueOf(), "unexpected owner");
    });
  });

  it("transfer ownership from owner", function() {
    return listContract.transferOwnership(accounts[3], {from:owner}).then(function(){
        owner = accounts[3];
        return listContract.owner();
    }).then(function(result){
        assert.equal( result.valueOf(), owner.valueOf(), "unexpected owner");
    });
  });

  it("list array", function() {
    return listContract.listAddresses(addresses,caps,{from:owner}).then(function(){
        return listContract.getCap(addresses[0]);
    }).then(function(result){
        assert.equal(result.valueOf(), caps[0].valueOf(), "unexpected cap");
        return listContract.getCap(addresses[1]);
    }).then(function(result){
        assert.equal(result.valueOf(), caps[1].valueOf(), "unexpected cap");
        return listContract.getCap(addresses[2]);
    }).then(function(result){
        assert.equal(result.valueOf(), caps[2].valueOf(), "unexpected cap");
        return listContract.getCap(addresses[3]);
    }).then(function(result){
        assert.equal(result.valueOf(), caps[3].valueOf(), "unexpected cap");
    });
  });

  it("delist single", function() {
    caps[1] = web3.toWei(0, 'ether');
    return listContract.listAddress(addresses[1],caps[1],{from:owner}).then(function(){
        return listContract.getCap(addresses[1]);
    }).then(function(result){
        assert.equal(result.valueOf(), caps[1].valueOf(), "unexpected cap");
    });
  });

  it("list array from non owner", function() {
    return listContract.listAddresses(addresses,caps,{from:nonOwner}).then(function(){
        assert.fail("expected to fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);

    });
  });

  it("list single from non owner", function() {
    return listContract.listAddress(addresses[1],caps[1],{from:nonOwner}).then(function(){
        assert.fail("expected to fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);

    });
  });

 
});
