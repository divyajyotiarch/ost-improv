'use strict';

const Utils = require('./test_lib/utils.js');
const web3 = require('./test_lib/web3.js');
const { Event } = require('./test_lib/event_decoder');
const { AccountProvider } = require('./test_lib/utils.js');
const MockContract = artifacts.require("./MockContract.sol");
const OptimalWalletCreator = artifacts.require('OptimalWalletCreator');

contract('OptimalWalletCreator::optimalCall', async (accounts) => {

    let ubtContractAddr;
    let walletFactoryContractAddr;
    let organizationAddr;
    let accountProvider;
    let internalActors = [];
    let optimalWalletCreator;
    let mock;
    let worker;
    let mockOrganization;
    let organization;
    
    beforeEach(async () => {
        
        accountProvider = new Utils.AccountProvider(accounts);
        ubtContractAddr = accountProvider.get();
        walletFactoryContractAddr = accountProvider.get();
        organizationAddr = accountProvider.get();
        internalActors.push(accountProvider.get());
        mock = await MockContract.new();
        optimalWalletCreator = await OptimalWalletCreator.new(ubtContractAddr,walletFactoryContractAddr,organizationAddr);
        ({
          mockOrganization,
          worker,
          organization,
        } = await Utils.setupOrganization(optimalWalletCreator.address,organizationAddr));
        
      });
   
    //negative test cases similar to the createUserWallet. 
    contract('Negative Tests', async () => {
        it('Reverts if gnosis safe\'s master copy address is null.', async () => {
         
          await mock.givenAnyReturnBool(true);
          await Utils.expectRevert(
            optimalWalletCreator.optimalCall(
              Utils.NULL_ADDRESS, // gnosis safe's master copy
              '0x', // gnosis safe's setup data
              accountProvider.get(), // token holder's master copy
              accountProvider.get(), // token
              accountProvider.get(), // token rules
              [], // session key addresses
              [], // session keys' spending limits
              [], // session keys' expiration heights
              internalActors,
              {from : worker},
            ),
            'Should revert as the master copy address is null.',
            'Master copy address is null.',
          );
        });
    
        it('Reverts if token holder\'s master copy address is null.', async () => {

          await mock.givenAnyReturnBool(true);
         
          await Utils.expectRevert(
            optimalWalletCreator.optimalCall(
              accountProvider.get(), // gnosis safe's master copy
              '0x', // gnosis safe's setup data
              Utils.NULL_ADDRESS, // token holder's master copy
              accountProvider.get(), // token
              accountProvider.get(), // token rules
              [], // session key addresses
              [], // session keys' spending limits
              [], // session keys' expiration heights
              internalActors,
              {from : worker},
            ),
            'Should revert as the master copy address is null.',
            'Master copy address is null.',
          );
        });
      });

      contract('Optimal Create Call', async () => {
          it('Reverts if non-worker address is doing function calls', async () => {

            await mock.givenAnyReturnBool(true);
            const internalActors = [];
            internalActors.push(accountProvider.get());
            const nonWorker = accountProvider.get();
      
            await Utils.expectRevert(
              optimalWalletCreator.optimalCall(
                accountProvider.get(), // gnosis safe's master copy
                '0x', // gnosis safe's setup data
                accountProvider.get(), // token holder's master copy
                accountProvider.get(), // token
                accountProvider.get(), // token rules
                [], // session key addresses
                [], // session keys' spending limits
                [], // session keys' expiration heights
                internalActors,
              { from: nonWorker },
            ),
            'Worker should be registered.',
            'Only whitelisted workers are allowed to call this method.');
          });
      });
});