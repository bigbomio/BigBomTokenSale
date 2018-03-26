var fs = require('fs'); 
var parse = require('csv-parse');


var csvData=[];
var i=0;
var addresses = [];
var amounts = [];

var TokenSale = artifacts.require("./BigbomTokenSale.sol");
var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
var BBToken = artifacts.require("./BigBomToken.sol");

// Copy & Paste this
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }


module.exports = function(deployer) {
    fs.createReadStream('./BB_Private_Sale_Data_private_sale.csv').pipe(parse({delimiter: ','})).on('data', function(csvrow) {
        csvData.push(csvrow);

    }).on('end',function() {
        if(addresses.length>0)
             csvData.push({'addresses':addresses, 'amounts':amounts});
       for(var i=0;i<csvData.length;i++){
         if(i>0)
            BBToken.at('0xb243f8addb7a5245914f385b5a725ab81f503dbf').transferPrivateSale(csvData[i][1], web3.toWei(csvData[i][3],'ether'));
             if(i==10)
                break;
        }
    });

};
