# ost-improv 

### Steps
Follow the following steps to make a single transaction call using OptimalWalletCreator contract. 
- Deploy Organization contract. Refer [mosaic.js](https://github.com/mosaicdao/mosaic.js)
- Deploy UserWalletFactory contract
- Deploy UtilityBrandedToken contract. Refer [brandedtoken.js](https://github.com/OpenST/branded.js)
- Deploy OptimalWalletCreator contract using UtilityBrandedToken and UserWalletFactory contract address. 
- Set OptimalWalletCreator contract as worker using Organizations setWorker() method.
- Call optimalCall function ```{from : worker}```
