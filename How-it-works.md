## BIGBOM CONTRACT

# BBO TOKEN CONTRACT

1. Fixed total supply is 2,000,000,000 Token
2. Before deploy contract, BigbomPrivateSaleList needs to be deployed first. This is a list of addresses that is participated in previous Private Sales campaign. Each address will have a fixed amount BBO they're expecting to receive once BBO Token is available.\
3. There are 6 major part after BBO is being generated at the first time
	3.1. founderAmount\
	3.2. coreStaffAmount\
	3.3. advisorAmount\
	3.4. reserveAmount\
	3.5. networkGrowthAmount\
	3.6. tokenSaleAmount

	After contract being deployed, 3.1-->3.5 will be transfered into a MultiSign Address ( via deployment script ). Rest of Token will be available for transferring to BigbomPrivateSaleList and Public Sale

4. On T+2 after contract is live on mainnet, function transferPrivateSale() will be invoked, now all Private Sales's participant will receive their respectively BBO

# BBO TOKENSALE CONTRACT

1. Before ICO starts, BigbomContributorWhiteList will be deployed. This will contains addresses that passed KYC. Each address will have a min and max cap during ICO phase
2. During ICO, there will be several bonus level. Details as below\
	2.1. From T to T+3 days, each address will receive bonus depeneds on how much they contribute per transaction. Each transaction must not greater than their max cap, and must not lesser than their min cap describing in BigbomContributorWhiteList\
	2.2. Friom T+3 to T+51 days, each deposit will receive different bonus depends on the time they deposit. Function getBonus() will take care this calculation\
	All Tokens is not transferable during Token Sale\
3. After ICO Ends, FinalizeSale() will be invoked, rest of Token in Token Contract will be burnt

# TESTING
Before running unit test, make sure you completed following steps:
1. Edit truffle.js, change IP address, account and password of your test node
2. Has 6 unlocked account in your test node, each account has at least 5ETH

Running these commands for unittest\
npm install -g truffle\
truffle migrate && truffle test
