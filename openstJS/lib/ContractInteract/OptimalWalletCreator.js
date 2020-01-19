'use strict';

const Web3 = require('web3');
const AbiBinOpt = require('../AbiBinOpt');
const Contracts = require('../Contracts');

const Utils = require('../../utils/Utils');
const ContractName = 'OptimalWalletCreator';

/**
 * The Class is used to interact with OptimalWalletCreator contract.
 */

 class OptimalWalletCreator {

 	/**
   * Constructor of OptimalWalletFactory.
   *
   * @param {Web3} auxiliaryWeb3 Auxiliary chain web3 object.
   * @param {string} address OptimalWalletCreator contract address of a user.
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

    this.contract = Contracts.getOptimalWalletCreator(this.auxiliaryWeb3, this.address);

    if (!this.contract) {
      const err = new TypeError(`Could not load OptimalWalletCreator contract for: ${this.address}`);
      return Promise.reject(err);
    }
  }

  /**
   * Deploys OptimalWalletCreator master copy contract.
   *
   * @param {Web3} auxiliaryWeb3 Auxiliary chain web3 object.
   * @param {Object} txOptions Tx options. 
   * @param {address} ubtContractAddr UtilityBrandedToken Contract address
   * @param {address} userWalletFactoryContractAddr UserWalletFactory Contract address
   *
   * @returns {Promise<OptimalWalletCreator>} Promise containing the OptimalWalletCreator
   *                                  instance that has been deployed.
   */
  static async deploy(auxiliaryWeb3, txOptions, ubtContractAddr, userWalletFactoryContractAddr, organizationAddr) {
    if (!txOptions) {
      const err = new TypeError('Invalid transaction options.');
      return Promise.reject(err);
    }
    if (!Web3.utils.isAddress(txOptions.from)) {
      const err = new TypeError(`Invalid from address: ${txOptions.from}.`);
      return Promise.reject(err);
    }

    const tx = OptimalWalletCreator.deployRawTx(auxiliaryWeb3, ubtContractAddr, userWalletFactoryContractAddr, organizationAddr);

    return Utils.sendTransaction(tx, txOptions).then((txReceipt) => {
      const address = txReceipt.contractAddress;
      return new OptimalWalletCreator(auxiliaryWeb3, address);
    });
  }

  /**
   * Method which returns Tx object to deploy OptimalWalletCreator contract.
   *
   * @param {Web3} auxiliaryWeb3 Auxiliary chain web3 object.
   * @param {address} ubtContractAddr UtilityBrandedToken Contract address
   * @param {address} userWalletFactoryContractAddr UserWalletFactory Contract address
   * @param {address} organizationAddr Organization Contract Address
   * 
   * @returns {Object} Raw transaction object.
   */
  static deployRawTx(auxiliaryWeb3, ubtContractAddr, userWalletFactoryContractAddr, organizationAddr) {
    if (!(auxiliaryWeb3 instanceof Web3)) {
      throw new TypeError(`Mandatory Parameter 'auxiliaryWeb3' is missing or invalid: ${auxiliaryWeb3}`);
    }
    const abiBinOpt = new AbiBinOpt();
    const bin = abiBinOpt.getBIN(ContractName);

    const args = [ubtContractAddr, userWalletFactoryContractAddr, organizationAddr];
    const contract = Contracts.getOptimalWalletCreator(auxiliaryWeb3);

    return contract.deploy({
      data: bin,
      arguments: args
    });
  }
}

module.exports = OptimalWalletCreator;
