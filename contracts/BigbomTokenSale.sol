pragma solidity ^0.4.19;

import './BigbomToken.sol';
import './zeppelin/ownership/Ownable.sol';
import './BigbomContributorWhiteList.sol';
import './BigbomPrivateSaleList.sol';
import './zeppelin/math/SafeMath.sol';

contract BigbomTokenSale {
    address             public admin;
    address             public bigbomMultiSigWallet;
    BigbomToken         public token;
    uint                public raisedWei;
    bool                public haltSale;
    uint                      public openSaleStartTime;
    uint                      public openSaleEndTime;
    BigbomContributorWhiteList public list;

    mapping(address=>uint)    public participated;

    // mapping(bytes32=>uint) public proxyPurchases;
    using SafeMath for uint;

    function BigbomTokenSale( address _admin,
                              address _bigbomMultiSigWallet,
                              BigbomContributorWhiteList _whilteListContract,
                              uint _publicSaleStartTime,
                              uint _publicSaleEndTime,
                              BigbomToken _token)       
    {
        admin = _admin;
        bigbomMultiSigWallet = _bigbomMultiSigWallet;
        list = _whilteListContract;
        openSaleStartTime = _publicSaleStartTime;
        openSaleEndTime = _publicSaleEndTime;
        token = _token;
    }
    
    function saleEnded() constant returns(bool) {
        return now > openSaleEndTime;
    }

    function saleStarted() constant returns(bool) {
        return now >= openSaleStartTime;
    }

    function setHaltSale( bool halt ) {
        require( msg.sender == admin );
        haltSale = halt;
    }
    // this is a seperate function so user could query it before crowdsale starts
    function contributorMinCap( address contributor ) constant returns(uint) {
        return list.getMinCap( contributor );
    }
    function contributorMaxCap( address contributor, uint amountInWei ) constant returns(uint) {
        uint cap = list.getMaxCap( contributor );
        if( cap == 0 ) return 0;
        uint remainedCap = cap.sub( participated[ contributor ] );

        if( remainedCap > amountInWei ) return amountInWei;
        else return remainedCap;
    }

    function checkMaxCap( address contributor, uint amountInWei ) internal returns(uint) {
        uint result = contributorMaxCap( contributor, amountInWei );
        participated[contributor] = participated[contributor].add( result );
        return result;
    }

    function() payable {
        buy( msg.sender );
    }

    // event ProxyBuy( bytes32 indexed _proxy, address _recipient, uint _amountInWei );
    // function proxyBuy( bytes32 proxy, address recipient ) payable returns(uint){
    //     uint amount = buy( recipient );
    //     proxyPurchases[proxy] = proxyPurchases[proxy].add(amount);
    //     ProxyBuy( proxy, recipient, amount );

    //     return amount;
    // }


    function getBonus(uint _tokens, uint _amountInWei) returns (uint){
        if (now > openSaleStartTime && now <= (openSaleStartTime+3 days)){
            if (_amountInWei >= 100*1e18 && _amountInWei < 300 * 1e18){
                return  _tokens.mul(45).div(100);
            }
            if (_amountInWei >= 300*1e18 && _amountInWei < 500 * 1e18){
                return  _tokens.mul(50).div(100);
            }
            if (_amountInWei >= 500*1e18 && _amountInWei < 1000 * 1e18){
                return  _tokens.mul(60).div(100);
            }
            if (_amountInWei >= 1000*1e18 && _amountInWei <= 3000 * 1e18){
                return  _tokens.mul(65).div(100);
            }
            return _tokens.mul(25).div(100);
        }else if (now > (openSaleStartTime+3  days) && now <= (openSaleStartTime+16 days)){
            return _tokens.mul(25).div(100);
        }else if (now > (openSaleStartTime+16 days) && now <= (openSaleStartTime+26 days)){
            return _tokens.mul(15).div(100);
        }else if (now > (openSaleStartTime+26 days) && now <= (openSaleStartTime+36 days)){
            return _tokens.mul(10).div(100);
        }else if (now > (openSaleStartTime+36 days) && now <= (openSaleStartTime+47 days)){
            return _tokens.mul(5).div(100);
        }else if (now > (openSaleStartTime+47 days) && now <= (openSaleStartTime+51 days)){
            return _tokens.mul(3).div(100);
        }else{
            return 0;
        }
    }

    event Buy( address _buyer, uint _tokens, uint _payedWei, uint _bonus );
    function buy( address recipient ) payable returns(uint){
        //require( tx.gasprice <= 50000000000 wei );

        require( ! haltSale );
        require( saleStarted() );
        require( ! saleEnded() );

        uint mincap = contributorMinCap(recipient);

        uint maxcap = checkMaxCap(recipient, msg.value );
        uint allowValue = msg.value;
        require( mincap > 0 );
        require( maxcap > 0 );
        // fail if msg.value < mincap
        require (msg.value >= mincap);
        // send to msg.sender, not to recipient if value > maxcap
        if( msg.value > maxcap  ) {
            allowValue = maxcap;
            //require (allowValue >= mincap);
            msg.sender.transfer( msg.value.sub( maxcap ) );
        }

        // send payment to wallet
        sendETHToMultiSig(allowValue);
        raisedWei = raisedWei.add( allowValue );
        // 1ETH = 20000 BBO
        uint recievedTokens = allowValue.mul( 20000 );
        // TODO bounce
        //uint bonus = getBonus(recievedTokens, msg.value);
        uint bonus = getBonus(recievedTokens, allowValue);
        
        recievedTokens = recievedTokens.add(bonus);
        assert( token.transfer( recipient, recievedTokens ) );
        //

        Buy( recipient, recievedTokens, allowValue, bonus );

        return msg.value;
    }

    function sendETHToMultiSig( uint value ) internal {
        bigbomMultiSigWallet.transfer( value );
    }

    event FinalizeSale();
    // function is callable by everyone
    function finalizeSale() {
        require( saleEnded() );
        require( msg.sender == admin );

        // burn remaining tokens
        token.burn(token.balanceOf(this));

        FinalizeSale();
    }

    // ETH balance is always expected to be 0.
    // but in case something went wrong, we use this function to extract the eth.
    function emergencyDrain(ERC20 anyToken) returns(bool){
        require( msg.sender == admin );
        require( saleEnded() );

        if( this.balance > 0 ) {
            sendETHToMultiSig( this.balance );
        }

        if( anyToken != address(0x0) ) {
            assert( anyToken.transfer(bigbomMultiSigWallet, anyToken.balanceOf(this)) );
        }

        return true;
    }

    // just to check that funds goes to the right place
    // tokens are not given in return
    function debugBuy() payable {
        require( msg.value > 0 );
        sendETHToMultiSig( msg.value );
    }
}
