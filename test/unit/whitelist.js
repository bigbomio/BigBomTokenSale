var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var Helpers = require('./../helpers.js');

var listContract;





var caps = [ web3.toWei(1, 'ether'), web3.toWei(10, 'ether'), web3.toWei(11, 'ether'), web3.toWei(0, 'ether')];
var maxcaps = [ web3.toWei(1, 'ether'), web3.toWei(100, 'ether'), web3.toWei(110, 'ether'), web3.toWei(0, 'ether')];

var owner;
var nonOwner;


////////////////////////////////////////////////////////////////////////////////



contract('contributor white list', function(accounts) {
var addresses = [ accounts[0],accounts[1],accounts[2],accounts[3]];

  beforeEach(function(done){
    done();
  });
  afterEach(function(done){
    done();
  });


  it("deploy contract", function() {
    owner = accounts[2];
    nonOwner = accounts[0];
    return WhiteList.new({from:owner,gas:4700000}).then(function(instance){
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
    return listContract.listAddresses(addresses,caps, maxcaps,{from:owner}).then(function(){
        return listContract.getMinCap(addresses[0]);
    }).then(function(result){
        assert.equal(result.valueOf(), caps[0].valueOf() , "unexpected cap");
        return listContract.getMinCap(addresses[1]);
    }).then(function(result){
        assert.equal(result.valueOf(), caps[1].valueOf(), "unexpected cap");
        return listContract.getMinCap(addresses[2]);
    }).then(function(result){
        assert.equal(result.valueOf(), caps[2].valueOf(), "unexpected cap");
        return listContract.getMinCap(addresses[3]);
    }).then(function(result){
        assert.equal(result.valueOf(), caps[3].valueOf(), "unexpected cap");
    });
  });

  it("delist single", function() {
    caps[1] = web3.toWei(0, 'ether');
    return listContract.listAddress(addresses[1],caps[1], caps[1],{from:owner}).then(function(){
        return listContract.getMinCap(addresses[1]);
    }).then(function(result){
        assert.equal(result.valueOf(), caps[1].valueOf(), "unexpected cap");
    });
  });

  it("list array from non owner", function() {
    return listContract.listAddresses(addresses,caps, caps,{from:nonOwner}).then(function(){
        assert.fail("expected to fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);

    });
  });

  it("list single from non owner", function() {
    return listContract.listAddress(addresses[1],caps[1],caps[1],{from:nonOwner}).then(function(){
        assert.fail("expected to fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);

    });
  });

  it("destroy from non owner", function() {
    return listContract.destroy({from:nonOwner}).then(function(){
        assert.fail("expected to fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);

    });
  });

  it("destroy from owner", function() {
    return listContract.destroy({from:owner});
  });
});
