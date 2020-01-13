pragma solidity ^0.5.0;

import "./brandedtoken-contracts/contracts/UtilityBrandedToken.sol";
import "./openst-contracts/contracts/proxies/UserWalletFactory.sol";
import "./brandedtoken-contracts/contracts/utilitytoken/contracts/organization/contracts/Organized.sol";


/**
 * @title Allows to call function createUserWallet from UserWalletFactory
 *        Allows to call function registerInternalActors from UtilityBrandedToken
 *        Two methods called in single transaction
 */

contract OptimalWalletCreator is Organized {

    address worker;
    address ubtContractAddr;
    address walletFactoryContractAddr;
    UserWalletFactory walletFactory;
    UtilityBrandedToken utilityBrandedToken;


    constructor(
        address _ubtContractAddr,
        address _walletFactoryContractAddr
    )
    public
    {
        worker = msg.sender();
        ubtContractAddr = _ubtContractAddr;
        walletFactoryContractAddr = _walletFactoryContractAddr;
    }

    /**
    * @notice Create a new gnosis safe proxy and executes a
    *         message call to the newly created proxy. Afterwards, in the same
    *         transaction, creates a new token holder proxy by specifying
    *         as an owner the newly created gnosis safe proxy contract.
    *
    * @param _gnosisSafeMasterCopy The address of a master copy of gnosis safe.
    * @param _gnosisSafeData The message data to be called on a newly created
    *                        gnosis safe proxy.
    * @param _tokenHolderMasterCopy The address of a master copy of token
    *                               holder.
    * @param _token The address of the economy token.
    * @param _tokenRules The address of the token rules.
    * @param _sessionKeys Session key addresses to authorize.
    * @param _sessionKeysSpendingLimits Session keys' spending limits.
    * @param _sessionKeysExpirationHeights Session keys' expiration heights.
    */

    function optimalCall(
        address _gnosisSafeMasterCopy,
        bytes calldata _gnosisSafeData,
        address _tokenHolderMasterCopy,
        address _token,
        address _tokenRules,
        address[] calldata _sessionKeys,
        uint256[] calldata _sessionKeysSpendingLimits,
        uint256[] calldata _sessionKeysExpirationHeights
    )  external
        onlyWorker    //might have to send user address since worker will be executing this call
    {
        string memory safeProxy;
        string memory tokenHolderAddr; //return data from createWalletUser ---remove

        userWalletFactory = UserWalletFactory(walletFactoryContractAddr);
        (safeProxy, tokenHolderAddr) = userWalletFactory.createWalletUser(
        _gnosisSafeMasterCopy,
        _gnosisSafeData,
        _tokenHolderMasterCopy,
        _token,
        _tokenRules,
        _sessionKeys,
        _sessionKeysSpendingLimits,
        _sessionKeysExpirationHeights
        );
        /*
        first call to createWalletUser with all above parameters
        */
        
        utilityBrandedToken = UtilityBrandedToken(ubtContractAddr);
        utilityBrandedToken.registerInternalActors(worker);

        /*
        * second call to registerInternalActors from UtilityBrandedToken with msg.sender() as parameter
        * considering that this contract is set as a worker already by an organization 
        */
    } 
}