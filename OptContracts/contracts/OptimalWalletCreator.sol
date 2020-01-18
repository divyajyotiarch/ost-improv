pragma solidity ^0.5.0;

import "./brandedtoken-contracts/contracts/UtilityBrandedToken.sol";
import "./openst-contracts/contracts/proxies/UserWalletFactory.sol";
import "./brandedtoken-contracts/contracts/utilitytoken/contracts/organization/contracts/OrganizationInterface.sol";
import "./brandedtoken-contracts/contracts/utilitytoken/contracts/organization/contracts/Organized.sol";

/**
 * @title Allows to call function createUserWallet from UserWalletFactory
 *        Allows to call function registerInternalActors from UtilityBrandedToken
 *        Two methods called in single transaction
 */

contract OptimalWalletCreator is Organized {

    UserWalletFactory userWalletFactory;
    UtilityBrandedToken utilityBrandedToken;

    constructor(
        address _ubtContractAddr,
        address _walletFactoryContractAddr,
        OrganizationInterface _organization
    )
        public
        Organized(_organization)
    {
        userWalletFactory = UserWalletFactory(_walletFactoryContractAddr);
        utilityBrandedToken = UtilityBrandedToken(_ubtContractAddr);
    }

    /* External Functions  */

    /**
    * @notice Create a new gnosis safe proxy and executes a
    *         message call to the newly created proxy. Afterwards, in the same
    *         transaction, creates a new token holder proxy by specifying
    *         as an owner the newly created gnosis safe proxy contract.
    *         Registers internal actors.
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
    * @param _internalActors Array of addresses of the internal actors to register.
    */

    function optimalCall(
        address _gnosisSafeMasterCopy,
        bytes memory _gnosisSafeData,
        address _tokenHolderMasterCopy,
        address _token,
        address _tokenRules,
        address[] memory _sessionKeys,
        uint256[] memory _sessionKeysSpendingLimits,
        uint256[] memory _sessionKeysExpirationHeights,
        address[] memory _internalActors
    )
        public
        onlyWorker
    {

        userWalletFactory.createUserWallet(
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
         * first call to createWalletUser with all above parameters
         */
        utilityBrandedToken.registerInternalActors(_internalActors);

        /*
         * second call to registerInternalActors from UtilityBrandedToken
         * considering that this contract is set as a worker already by the organization
         */
    }
}