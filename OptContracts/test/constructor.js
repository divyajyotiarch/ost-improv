'use strict';

const utils = require('./test_lib/utils');
const { Event } = require('./test_lib/event_decoder');
const { AccountProvider } = require('./test_lib/utils.js');
const MockContract = artifacts.require("./MockContract.sol");
const OptimalWalletCreator = artifacts.require('OptimalWalletCreator');

contract('OptimalWalletCreator::constructor', async(accounts) => {
   
    let ubtContractAddr;
    let walletFactoryContractAddr;
    let organizationAddr;
    let accountProvider;
    let mock;
    
    beforeEach(async () => {
        
        accountProvider = new utils.AccountProvider(accounts);
        ubtContractAddr = accountProvider.get();
        walletFactoryContractAddr = accountProvider.get();
        organizationAddr = accountProvider.get();
        mock = await MockContract.new();
      });


      contract('Negative Tests', async () => {
        it('Reverts if null address is passed as organizationAddr', async () => {
          await utils.expectRevert(OptimalWalletCreator.new(
            ubtContractAddr,
            walletFactoryContractAddr,
            utils.NULL_ADDRESS,
          ),
          'Organization contract address should not be zero',
          'Organization contract address must not be zero.');
        });

        it('Reverts if null address is passed as ubtContractAddr', async () => {
          
          await mock.givenAnyReturnBool(true);
          
          await utils.expectRevert(OptimalWalletCreator.new(
            utils.NULL_ADDRESS,
            walletFactoryContractAddr,
            organizationAddr,
          ),
          'Utility Brand Token contract address should not be zero',
          'Utility Brand Token contract address must not be zero.');
        });

        it('Reverts if null address is passed as walletFactoryContractAddr', async () => {
            await utils.expectRevert(OptimalWalletCreator.new(
              ubtContractAddr,
              utils.NULL_ADDRESS,
              organizationAddr,
            ),
            'UserWalletFactory contract address should not be zero',
            'UserWalletFactory contract address must not be zero.');
          });
      });

      contract('Storage', async () => {
        it('Successfully sets state variables', async () => {
            await utils.expectRevert(OptimalWalletCreator.new(
                ubtContractAddr,
                organizationAddr,
                walletFactoryContractAddr,
            ),
            'Error in setting state variables.'
          );
        });
      });
    });