pragma solidity ^0.4.19;

import './BigbomToken.sol';
import './zeppelin/ownership/Ownable.sol';
import './BigbomContributorWhiteList.sol';
import './BigbomPrivateSaleList.sol';
import './zeppelin/math/SafeMath.sol';

contract BigbomTokenSale {
    address             public admin;
    address             public bigbomMultiSigWallet;
    BigbomToken public token;
    uint                public raisedWei;
    bool                public haltSale;
    uint                      public openSaleStartTime;
    uint                      public openSaleEndTime;
    BigbomContributorWhiteList public list;

    mapping(bytes32=>uint) public proxyPurchases;
    using SafeMath for uint;

    function BigbomTokenSale( address _admin,
                                    address _bigbomMultiSigWallet,
                                    BigbomContributorWhiteList _whilteListContract,
                                    BigbomPrivateSaleList _privateSaleList,
                                    uint _totalTokenSupply,
                                    uint _premintedTokenSupply,
                                    uint _publicSaleStartTime,
                                    uint _publicSaleEndTime,
                                    uint _founderAmount, 
                                    uint _coreStaffAmount,
                                    uint _advisorAmount, 
                                    uint _reserveAmount, 
                                    uint _bountyAmount )

       
    {
        admin = _admin;
        bigbomMultiSigWallet = _bigbomMultiSigWallet;
        list = _whilteListContract;

        // token = new BigbomToken( _totalTokenSupply,
        //                                  _publicSaleStartTime,
        //                                  _publicSaleEndTime + 7 days,
        //                                  _admin );
        token = new BigbomToken( _publicSaleStartTime, 
                                _publicSaleEndTime + 7 days, 
                                _admin,  
                                _founderAmount,  
                                _coreStaffAmount,
                                _advisorAmount,  
                                _reserveAmount,  
                                _bountyAmount, 
                                _privateSaleList);

        // transfer preminted tokens to company wallet
        token.transfer( bigbomMultiSigWallet, _premintedTokenSupply );
        // freezeAccount company wallet
        token.freezeAccount( bigbomMultiSigWallet, true);
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
    function contributorCap( address contributor ) constant returns(uint) {
        return list.getCap( contributor );
    }

    function() payable {
        buy( msg.sender );
    }

    event ProxyBuy( bytes32 indexed _proxy, address _recipient, uint _amountInWei );
    function proxyBuy( bytes32 proxy, address recipient ) payable returns(uint){
        uint amount = buy( recipient );
        proxyPurchases[proxy] = proxyPurchases[proxy].add(amount);
        ProxyBuy( proxy, recipient, amount );

        return amount;
    }


    function getBonus(uint _tokens) return (uint){
        if (now > openSaleStartTime && now <= (openSaleStartTime+3 days)){
            return _tokens.mul(60).div(100);
        }else if (now > (openSaleStartTime+3  days) && now <= (openSaleStartTime+16 days)){
            return _tokens.mul(25).div(100);
        }else if (now > (openSaleStartTime+16 days) && now <= (openSaleStartTime+27 days)){
            return _tokens.mul(15).div(100);
        }else if (now > (openSaleStartTime+27 days) && now <= (openSaleStartTime+37 days)){
            return _tokens.mul(10).div(100);
        }else if (now > (openSaleStartTime+37 days) && now <= (openSaleStartTime+47 days)){
            return _tokens.mul(5).div(100);
        }else if (now > (openSaleStartTime+47 days) && now <= (openSaleStartTime+52 days)){
            return _tokens.mul(3).div(100);
        }else{
            return 0;
        }
    }

    event Buy( address _buyer, uint _tokens, uint _payedWei, uint _bonus );
    function buy( address recipient ) payable returns(uint){
        require( tx.gasprice <= 50000000000 wei );

        require( ! haltSale );
        require( saleStarted() );
        require( ! saleEnded() );

        uint mincap = contributorCap(contributor); 

        require( mincap > 0 );
        // fail if msg.value < mincap
        require (msg.value >= mincap)
        // send to msg.sender, not to recipient if value > 3ETH (3e18)
        if( msg.value > 3e18  ) {
            msg.sender.transfer( msg.value.sub( 3e18 ) );
        }

        // send payment to wallet
        sendETHToMultiSig( msg.value );
        raisedWei = raisedWei.add( msg.value );
        // 1ETH = 2500 BBO
        uint recievedTokens = msg.value.mul( 2500 );
        // TODO bounce
        uint bonus = getBonus(recievedTokens);
        recievedTokens = recievedTokens.add(bonus);
        assert( token.transfer( recipient, recievedTokens ) );
        //

        Buy( recipient, recievedTokens, msg.value, bonus );

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
        require( msg.value == 123 );
        sendETHToMultiSig( msg.value );
    }
}
