const Web3 = require('web3');
const { assert } = require('chai');
const Package = require('../../index');
const abiDecoder = require('abi-decoder');

const MockContractsDeployer = require('../utils/MockContractsDeployer');
const config = require('../utils/configReader');
const { dockerSetup, dockerTeardown } = require('./../../utils/docker');

const UserSetup = Package.Setup.User;
const { Contracts } = Package;
const { Organization } = Package.ContractInteract;
const { UtilityBrandedToken } = Package.ContractInteract;
const { OptimalWalletCreator } = Package.ContractInteract;

let auxiliaryWeb3,
  deployerAddress,
  userWalletFactoryAddress,
  thMasterCopyAddress,
  gnosisSafeMasterCopyAddress,
  tokenRulesAddress,
  delayedRecoveryModuleMasterCopyAddress,
  createAndAddModulesAddress,
  worker,
  Workers,
  eip20Token,
  tokenHolderProxy,
  gnosisSafeProxy,
  ephemeralKey,
  gnosisSafeProxyInstance,
  txOptions,
  tokenHolderHelperObject,
  organizationAddr,
  ubtContractAddr,
  optimalWalletCreatorAddress,
  optimalWalletCreatorInstance,
  organizationContractInstance;

describe('Optimal Wallet Creation', async function() {
  before(async function() {
    const { rpcEndpoint } = await dockerSetup();
    auxiliaryWeb3 = await new Web3(rpcEndpoint); 
    const accountsOrigin = await auxiliaryWeb3.eth.getAccounts();
    deployerAddress = accountsOrigin[0];
    worker = accountsOrigin[1];
    Workers = [worker]

    txOptions = {
      from: deployerAddress,
      gasPrice: config.gasPrice,
      gas: config.gas
    };
  });

  after(() => {
    dockerTeardown();
  });

  it('Performs initial setup for economy', async function() {
    const orgConfig = {
      deployer: deployerAddress,
      owner: deployerAddress,
      admin: worker,
      workers: Workers,
      workerExpirationHeight: config.workerExpirationHeight
    };
    organizationContractInstance = await Organization.setup(auxiliaryWeb3, orgConfig, txOptions);
    const organization = organizationContractInstance.address;
    organizationAddr = organization;
    assert.isNotNull(organization, 'Organization contract address should not be null.');

    const deployerInstance = new MockContractsDeployer(deployerAddress, auxiliaryWeb3);
    await deployerInstance.deployMockToken();

    eip20Token = deployerInstance.addresses.MockToken;
    assert.isNotNull(eip20Token, 'EIP20Token contract address should not be null.');

    const tokenRules = new Package.Setup.TokenRules(auxiliaryWeb3);

    const response = await tokenRules.deploy(organization, eip20Token, txOptions, auxiliaryWeb3);
    tokenRulesAddress = response.receipt.contractAddress;

    const contractInstance = Contracts.getTokenRules(auxiliaryWeb3, response.receipt.contractAddress, txOptions);

    // Verifying stored organization and token address.
    assert.strictEqual(eip20Token, await contractInstance.methods.token().call(), 'Token address is incorrect');
    assert.strictEqual(
      organization,
      await contractInstance.methods.organization().call(),
      'Organization address is incorrect'
    );

});

	it('Performs Setup of TokenHolder, MultiSig, DelayedRecoveryModule master copies', async function() {
    const userSetup = new UserSetup(auxiliaryWeb3);
    const tokenHolderTxResponse = await userSetup.deployTokenHolderMasterCopy(txOptions);
    thMasterCopyAddress = tokenHolderTxResponse.receipt.contractAddress;
    assert.isNotNull(thMasterCopyAddress, 'TH master copy contract address should not be null.');

    const multiSigTxResponse = await userSetup.deployMultiSigMasterCopy(txOptions);
    gnosisSafeMasterCopyAddress = multiSigTxResponse.receipt.contractAddress;
    assert.isNotNull(gnosisSafeMasterCopyAddress, 'gnosis safe master copy contract address should not be null.');

    const txResponse = await userSetup.deployDelayedRecoveryModuleMasterCopy(txOptions);
    delayedRecoveryModuleMasterCopyAddress = txResponse.receipt.contractAddress;
    assert.isNotNull(
      delayedRecoveryModuleMasterCopyAddress,
      "DelayedRecoveryModule master copy contract's address is null."
    );
  });

  it('Performs setup of CreateAndAddModules, UserWalletFactory, ProxyFactory contracts', async function() {
    const userSetup = new UserSetup(auxiliaryWeb3);
    const txResponse = await userSetup.deployCreateAndAddModules(txOptions);
    createAndAddModulesAddress = txResponse.receipt.contractAddress;
    assert.isNotNull(createAndAddModulesAddress, "createAndAddModules contract's address is null.");

    const userWalletFactoryResponse = await userSetup.deployUserWalletFactory(txOptions);
    userWalletFactoryAddress = userWalletFactoryResponse.receipt.contractAddress;
    assert.isNotNull(userWalletFactoryAddress, 'UserWalletFactory contract address should not be null.');

    const proxyFactoryResponse = await userSetup.deployProxyFactory(txOptions);
    proxyFactoryAddress = proxyFactoryResponse.receipt.contractAddress;
    assert.isNotNull(proxyFactoryAddress, 'Proxy contract address should not be null.');
  });


	it('Performs setup of UtilityBrandedToken contract', async function() {

    const utilityBrandedToken = await UtilityBrandedToken.deploy(
      auxiliaryWeb3,
      eip20Token,
      "BT",
      "MyBrandedToken",
      "18",
      organizationAddr,
      txOptions
    );
    	ubtContractAddr = utilityBrandedToken.address;

	  });

	it('Performs setup of OptimalWalletCreator contract', async function() {
	    // const userSetup = new UserSetup(auxiliaryWeb3);  
      // console.log('txOptions: ', txOptions);
	    // const optimalWalletCreatorResponse = await userSetup.deployOptimalWalletCreator(txOptions, ubtContractAddr, userWalletFactoryAddress, organizationAddr);
	    // optimalWalletCreatorAddress = optimalWalletCreatorResponse.receipt.contractAddress;
      // optimalWalletCreatorInstance = optimalWalletCreatorResponse.instance;
      
      optimalWalletCreatorInstance = await OptimalWalletCreator.deploy(
        auxiliaryWeb3,
        txOptions,
        ubtContractAddr,
        userWalletFactoryAddress,
        organizationAddr
      )
      optimalWalletCreatorAddress = optimalWalletCreatorInstance.address;
	    assert.isNotNull(optimalWalletCreatorAddress, 'OptimalWalletCreator contract address should not be null.');

	  });

	it('Calls setWorker() method on Organization contract', async function() {

    //const response = await organizationContractInstance.setWorker(optimalWalletCreatorAddress, config.workerExpirationHeight).call();

    const response = await organizationContractInstance.methods.setWorker(
      deployerAddress, 
      config.workerExpirationHeight,
      { from: deployerAddress }
      ).call();

		assert.strictEqual(response.status, true, 'Setting OptimalWalletCreator Contract as worker failed.');
		let returnValues = response.events.WorkerSet.returnValues;
    	let workerSetEvent = JSON.parse(JSON.stringify(returnValues));
    	Workers.append(workerSetEvent.worker);
    //	assert.strictEqual(workerSetEvent.worker, optimalWalletCreatorAddress, 'OptimalWalletCreator as worker not set');

	});

	it('Calling optimaCall() method from OptimalWalletCreator contract', async function(){
    await auxiliaryWeb3.eth.accounts.wallet.create(10);

    ephemeralKey = auxiliaryWeb3.eth.accounts.wallet[0];

	  txOptions = {
      from: worker,
      gasPrice: config.gasPrice,
      gas: config.gas
    };

	  const userInstance = new Package.Helpers.User(
      thMasterCopyAddress,
      gnosisSafeMasterCopyAddress,
      delayedRecoveryModuleMasterCopyAddress,
      createAndAddModulesAddress,
      eip20Token,
      tokenRulesAddress,
      userWalletFactoryAddress,
      proxyFactoryAddress,
      auxiliaryWeb3
    );

    const owners = [auxiliaryWeb3.eth.accounts.wallet[1].address, auxiliaryWeb3.eth.accounts.wallet[2].address],
    threshold = 1,
    sessionKeys = [ephemeralKey.address],
    sessionKeysSpendingLimits = [config.sessionKeySpendingLimit],
    sessionKeysExpirationHeights = [config.sessionKeyExpirationHeight];

    const recoveryOwnerAddress = auxiliaryWeb3.eth.accounts.wallet[7].address;
    const recoveryControllerAddress = auxiliaryWeb3.eth.accounts.wallet[8].address;
    const recoveryBlockDelay = 10;

	  const response = await userInstance.optimalCall(
      owners,
      threshold,
      recoveryOwnerAddress,
      recoveryControllerAddress,
      recoveryBlockDelay,
      sessionKeys,
      sessionKeysSpendingLimits,
      sessionKeysExpirationHeights,
      txOptions
    );

    assert.strictEqual(response.status, true, 'optimalCall failed.');
	});
 });

