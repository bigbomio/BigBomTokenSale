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
        //do something with csvrow
        console.log(i);

        if(i>0){
            addresses.push(csvrow[1]);
            amounts.push(web3.toWei(csvrow[3], 'ether'));
            if (i%20==0){
                csvData.push({'addresses':addresses, 'amounts':amounts});
                addresses = [];
                amounts = [];
            }
        }
         i=i+1;
        // i++;

    }).on('end',function() {
        if(addresses.length>0)
             csvData.push({'addresses':addresses, 'amounts':amounts});
       for(var i=0;i<csvData.length;i++){
            PrivateList.at('0x8dc66c8f12008db6e0262249a2bd5f7689e43a92').listAddresses(csvData[i].addresses, csvData[i].amounts);
        break;
        return 0;
         }

    });


};
