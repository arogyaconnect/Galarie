import axios from 'axios';
import { useState, useRef } from 'react';
import { ethers } from "ethers";
import { Row, Form, Button, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Create.css';

const Create = ({ marketplace, nft }) => {
  const [fileImg, setFile] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const sendJSONtoIPFS = async (ImgHash) => {
    try {
      const resJSON = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        data: {
          "name": name,
          "description": desc,
          "image": ImgHash
        },
        headers: {
          'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
          'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_API_KEY,
        },
      });

      const tokenURI = `https://gateway.pinata.cloud/ipfs/${resJSON.data.IpfsHash}`;
      console.log("Token URI", tokenURI);
      mintThenList(tokenURI);
    } catch (error) {
      console.log("JSON to IPFS: ", error);
      setIsLoading(false);
    }
  };

  const sendFileToIPFS = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (fileImg) {
      try {
        const formData = new FormData();
        formData.append("file", fileImg);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
            'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_API_KEY,
            "Content-Type": "multipart/form-data"
          },
        });

        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        console.log(ImgHash);
        sendJSONtoIPFS(ImgHash);
      } catch (error) {
        console.log("File to IPFS: ", error);
        setIsLoading(false);
      }
    }
  };

  const mintThenList = async (uri) => {
    try {
      // mint nft
      await (await nft.mint(uri)).wait();
      // get tokenId of new nft
      const id = await nft.tokenCount();
      // approve marketplace to spend nft
      await (await nft.setApprovalForAll(marketplace.address, true)).wait();
      // add nft to marketplace
      const listingPrice = ethers.utils.parseEther(price.toString());
      await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
      // Show success notification
      toast.success("NFT Listed Successfully!");
      setIsSuccess(true);
      setTimeout(() => {
        resetForm();
      }, 2000); // Display success for 2 seconds before resetting the form
    } catch (error) {
      console.log("Minting/Listing: ", error);
      toast.error("Failed to list NFT.");
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setName("");
    setDescription("");
    setPrice("");
    setIsLoading(false);
    setIsSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className="container-fluid mt-5">
      <ToastContainer />
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} size="lg" required type="file" name="file" />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" value={name} />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" value={desc} />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" value={price} />
              <div className="d-grid px-0">
                <Button className="gradient-button" onClick={sendFileToIPFS} size="lg" disabled={isLoading || isSuccess}>
                  {isLoading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : isSuccess ? (
                    <span>&#10003; NFT Listed Successfully!</span>
                  ) : (
                    'Create & List NFT!'
                  )}
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Create;
