// var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
// var Helpers = require('./../helpers.js');


// var listContract;




// ////////////////////////////////////////////////////////////////////////////////

// var testListing = function( privateListContract, user, cap, owner, nonOwner ) {
//     return new Promise(function (fulfill, reject){
//         console.log("testListing");
//         var okScenarioPassed = false;

//         return privateListContract.listAddress(user, cap,{from:owner}).then(function(result){
//             // check event
//             console.log('check event');
//             assert.equal(result.logs.length, 1, "expected a single event");
//             var log = result.logs[0];
//             console.log(log);
//             assert.equal(log.event, "ListAddress", "unexpected event");
//             assert.equal(log.args._user.valueOf(), user, "unexpected user");
//             assert.equal(log.args._amount.valueOf(), cap, "unexpected cap");

//             // check cap record
//             console.log('check cap record');
//             return privateListContract.getCap(user);
//         }).then(function(result){
//             console.log('check result');
//             assert.equal(result.valueOf(), cap, "unexpected cap");
//             okScenarioPassed = true;
//             // Privatelist with non-owner
//             console.log('Privatelist with non-owner');
//             return privateListContract.listAddress(user,cap * 2,{from: nonOwner});
//         }).then(function(result){
//             assert.fail("registering from non-owner should fail");
//         }).catch(function(err){
//             console.log('check err: ' + err);
//             if( ! okScenarioPassed ) {
//                 console.log("list address unexpectedly failed");
//                 console.log(user);
//                 assert.fail("list address unexpectedly failed");
//                 reject(err);
//             }

//             // check that user cap was not changed
//             console.log('check that user cap was not changed');
//             return privateListContract.getCap(user);
//         }).then(function(result){
//             assert.equal(result.valueOf(), cap, "unexpected cap");
//             fulfill(true);
//         }).catch(function(err){
//             console.log(err);
//             assert.fail("unexpected failure");
//             reject(err);
//         });
//     });
// };

// ////////////////////////////////////////////////////////////////////////////////

// function TestListingInput( user, cap, owner, nonOwner ) {
//     this.user = user;
//     this.cap = cap;
//     this.owner = owner;
//     this.nonOwner = nonOwner;
// }


// ////////////////////////////////////////////////////////////////////////////////

// function TestTransferInput( owner, nonOwner, nextOwner ) {
//     this.owner = owner;
//     this.nonOwner = nonOwner;
//     this.nextOwner = nextOwner;
// }


// ////////////////////////////////////////////////////////////////////////////////



// ////////////////////////////////////////////////////////////////////////////////

// var testTransfer = function( privateListContract, owner, nonOwner, nextOwner ) {
//     return new Promise(function (fulfill, reject){
//         console.log("testTransfer");
//         return privateListContract.owner().then(function(result){
//             assert.equal(result.valueOf(), owner, "owner is different than expected");
//             // try to change owner as nonOwner
//             return privateListContract.transferOwnership(nextOwner,{from:nonOwner});
//         }).then(function(result){
//             assert.fail("ownership transfer should fail");
//         }).catch(function(err){
//             // check that ownership did not change
//             return privateListContract.owner();
//         }).then(function(result){
//             assert.equal(result.valueOf(), owner, "owner is different than expected");
//             // change ownership as owner
//             return privateListContract.transferOwnership(nextOwner,{from:owner});
//         }).then(function(result){
//             return privateListContract.owner();
//         }).then(function(result){
//            assert.equal(result.valueOf(), nextOwner, "owner is different than expected");
//            fulfill(true);
//         });
//     });
// };

// ////////////////////////////////////////////////////////////////////////////////



// ////////////////////////////////////////////////////////////////////////////////



// contract('private list', function(accounts) {

//   beforeEach(function(done){
//     done();
//   });
//   afterEach(function(done){
//     done();
//   });


//   it("deploy contract", function() {
//     return PrivateList.new({from:accounts[2],gas:4700000}).then(function(instance){
//         listContract = instance;
//     });
//   });
//   it("list", function() {
//     return testListing( listContract, accounts[0], 100*1e18, accounts[2], accounts[3] );
//   });

//   it("ownership", function() {
//     return testTransfer( listContract, accounts[2], accounts[3], accounts[4] );
//   });

// });
