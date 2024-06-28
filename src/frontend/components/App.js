import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from './Navbar';
import Home from './Home.js'
import Create from './Create.js'
import MyListedItems from './MyListedItems.js'
import MyPurchases from './MyPurchases.js'
import MarketplaceAbi from '../contractsData/Marketplace.json'
import MarketplaceAddress from '../contractsData/Marketplace-address.json'
import NFTAbi from '../contractsData/NFT.json'
import NFTAddress from '../contractsData/NFT-address.json'
import { ethers } from "ethers"
import { Spinner } from 'react-bootstrap'

import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [nft, setNFT] = useState({});
  const [marketplace, setMarketplace] = useState({});

  useEffect(() => {
    const checkMetaMask = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Requesting access to MetaMask accounts
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);

          // Get provider from MetaMask
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          // Set signer
          const signer = provider.getSigner();

          // Handle MetaMask events
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });

          window.ethereum.on('accountsChanged', async function (accounts) {
            setAccount(accounts[0]);
            await loadContracts(signer);
          });

          // Load contracts
          await loadContracts(signer);
        } catch (error) {
          console.error('Error connecting MetaMask:', error);
        }
      } else {
        console.warn('MetaMask extension not detected. Please install MetaMask to connect your wallet.');
      }
      setLoading(false);
    };

    checkMetaMask();
  }, []);

  const loadContracts = async (signer) => {
    try {
      // Get deployed copies of contracts
      const marketplaceContract = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer);
      const nftContract = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);

      setMarketplace(marketplaceContract);
      setNFT(nftContract);
    } catch (error) {
      console.error('Error loading contracts:', error);
    }
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation account={account} />
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting MetaMask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home marketplace={marketplace} nft={nft} />} />
              <Route path="/create" element={<Create marketplace={marketplace} nft={nft} />} />
              <Route path="/my-listed-items" element={<MyListedItems marketplace={marketplace} nft={nft} account={account} />} />
              <Route path="/my-purchases" element={<MyPurchases marketplace={marketplace} nft={nft} account={account} />} />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
