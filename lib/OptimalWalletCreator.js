/**
 * to be added to openst in node modules
 * The Class is used to interact with OptimalWalletCreator contract.
 */

'use strict';

const Web3 = require('web3');
const AbiBinProvider = require('./../AbiBinProvider');
const Contracts = require('../Contracts');

const Utils = require('../../utils/Utils');
const ContractName = 'OptimalWalletCreator';

class OptimalWalletCreator {
    /**
   * Constructor of OptimalWalletCreator.
   *
   * @param {Web3} auxiliaryWeb3 Auxiliary chain web3 object.
   * @param {string} address Gnosis safe proxy address of a user.
   */
  constructor(auxiliaryWeb3, address) {
    if (!(auxiliaryWeb3 instanceof Web3)) {
      const err = new TypeError("Mandatory Parameter 'auxiliaryWeb3' is missing or invalid.");
      return Promise.reject(err);
    }

    if (!Web3.utils.isAddress(address)) {
      const err = new TypeError(`Mandatory Parameter 'address' is missing or invalid: ${address}.`);
      return Promise.reject(err);
    }

    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.address = address;

    this.contract = Contracts.getUserWalletFactory(this.auxiliaryWeb3, this.address);

    if (!this.contract) {
      const err = new TypeError(`Could not load UserWalletFactory contract for: ${this.address}`);
      return Promise.reject(err);
    }
  }
}
