pragma solidity ^0.4.19;

import './BigbomToken.sol';
import './zeppelin/ownership/Ownable.sol';
import './BigbomContributorWhiteList.sol';
import './BigbomPrivateSaleList.sol';
import './zeppelin/math/SafeMath.sol';

contract BigbomTokenSecondSale{
    address             public admin;
    address             public bigbomMultiSigWallet;
    BigbomToken         public token;
    uint                public raisedWei;
    bool                public haltSale;
    uint                public openSaleStartTime;
    uint                public openSaleEndTime;
    

    BigbomContributorWhiteList public list;

    mapping(address=>uint)    public participated;
    //mapping(string=>uint)    public depositTx;
    mapping(string=>uint)     erc20Rate;

    using SafeMath for uint;

    function BigbomTokenSecondSale( address _admin,
                              address _bigbomMultiSigWallet,
                              BigbomContributorWhiteList _whilteListContract,
                              uint _publicSaleStartTime,
                              uint _publicSaleEndTime,
                              BigbomToken _token) public       
    {
        require (_publicSaleStartTime < _publicSaleEndTime);
        require (_admin != address(0x0));
        require (_bigbomMultiSigWallet != address(0x0));
        require (_whilteListContract != address(0x0));
        require (_token != address(0x0));

        admin = _admin;
        bigbomMultiSigWallet = _bigbomMultiSigWallet;
        list = _whilteListContract;
        openSaleStartTime = _publicSaleStartTime;
        openSaleEndTime = _publicSaleEndTime;
        token = _token;
    }
    
    function saleEnded() public constant returns(bool) {
        return now > openSaleEndTime;
    }

    function saleStarted() public constant returns(bool) {
        return now >= openSaleStartTime;
    }

    function setHaltSale( bool halt ) public {
        require( msg.sender == admin );
        haltSale = halt;
    }
    // this is a seperate function so user could query it before crowdsale starts
    function contributorMinCap( address contributor ) public constant returns(uint) {
        return list.getMinCap( contributor );
    }
    function contributorMaxCap( address contributor, uint amountInWei ) public constant returns(uint) {
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

    function() payable public {
        buy( msg.sender );
    }



    function getBonus(uint _tokens) public view returns (uint){
        if (now > openSaleStartTime && now <= (openSaleStartTime+3 days)){
            return _tokens.mul(10).div(100);
        }
        else
        {
            return 0;
        }
    }

    event Buy( address _buyer, uint _tokens, uint _payedWei, uint _bonus );
    function buy( address recipient ) payable public returns(uint){
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
        uint bonus = getBonus(recievedTokens);
        
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
    function finalizeSale() public {
        require( saleEnded() );
        //require( msg.sender == admin );

        // burn remaining tokens
        token.burn(token.balanceOf(this));

        FinalizeSale();
    }

    // ETH balance is always expected to be 0.
    // but in case something went wrong, we use this function to extract the eth.
    function emergencyDrain(ERC20 anyToken) public returns(bool){
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
    function debugBuy() payable public {
        require( msg.value > 0 );
        sendETHToMultiSig( msg.value );
    }

    function getErc20Rate(string erc20Name) public constant returns(uint){
        return erc20Rate[erc20Name];
    }

    function setErc20Rate(string erc20Name, uint rate) public{
        require (msg.sender == admin);
        erc20Rate[erc20Name] = rate;
    }

    event Erc20Buy( address _buyer, uint _tokens, uint _payedWei, uint _bonus, string depositTx );

    event Erc20Refund( address _buyer, uint _erc20RefundAmount );
    function erc20Buy( address recipient, uint erc20Amount, string erc20Name, string depositTx )  public returns(uint){
        require (msg.sender == admin);
        //require( tx.gasprice <= 50000000000 wei );

        require( ! haltSale );
        require( saleStarted() );
        require( ! saleEnded() );
        uint ethAmount = getErc20Rate(erc20Name) * erc20Amount;
        uint mincap = contributorMinCap(recipient);

        uint maxcap = checkMaxCap(recipient, ethAmount );
        
        require (ethAmount > 0);
        uint allowValue = ethAmount;
        require( mincap > 0 );
        require( maxcap > 0 );
        // fail if msg.value < mincap
        require (ethAmount >= mincap);
        // send to msg.sender, not to recipient if value > maxcap
        if( ethAmount > maxcap  ) {
            allowValue = maxcap;
            //require (allowValue >= mincap);
            // send event refund
            // msg.sender.transfer( ethAmount.sub( maxcap ) );
            uint erc20RefundAmount = ethAmount.sub( maxcap ).div(erc20Rate[erc20Name]);
            Erc20Refund(recipient, erc20RefundAmount);
        }

        raisedWei = raisedWei.add( allowValue );
        // 1ETH = 20000 BBO
        uint recievedTokens = allowValue.mul( 20000 );
        // TODO bounce
        uint bonus = getBonus(recievedTokens);
        
        recievedTokens = recievedTokens.add(bonus);
        assert( token.transfer( recipient, recievedTokens ) );
        //

        Erc20Buy( recipient, recievedTokens, allowValue, bonus, depositTx);

        return allowValue;
    }

}
