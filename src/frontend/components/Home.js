import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import loaderGif from './loader.gif';
import './Home.css';

const Home = ({ marketplace, nft }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const loadMarketplaceItems = async () => {
    const itemCount = await marketplace.itemCount();
    let items = [];
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i);
      if (!item.sold) {
        const uri = await nft.tokenURI(item.tokenId);
        const response = await fetch(uri);
        const metadata = await response.json();
        const totalPrice = await marketplace.getTotalPrice(item.itemId);
        items.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image
        });
      }
    }
    setLoading(false);
    setItems(items);
  };

  const buyMarketItem = async (item) => {
    await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait();
    loadMarketplaceItems();
  };

  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  if (loading) return (
    <main style={{ padding: "1rem 0", textAlign: 'center' }}>
      <img src={loaderGif} alt="Loading..." style={{ width: '100px', height: '100px' }} />
    </main>
  );

  return (
    <div className="flex justify-center">
      {items.length > 0 ?
        <div className="NftCardContainer">
          <div className="grid">
            {items.map((item, idx) => (
              <div key={idx} className="nft-card">
                <div className="nft-image-container">
                  <img src={item.image} alt={item.name} className="nft-card-img" />
                </div>
                <div className="nft-card-body">
                  <h3 className="nft-card-title">{item.name}</h3>
                  <p className="nft-card-text">{item.description}</p>
                  <div className="nft-card-footer">
                    <button onClick={() => buyMarketItem(item)} className="buy-button">
                      Buy 
                    </button>
                    <span className="nft-card-price">{ethers.utils.formatEther(item.totalPrice)} 
                      ETH
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
};

export default Home;
