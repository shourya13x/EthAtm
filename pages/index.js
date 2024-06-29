import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [owner, setOwner] = useState(undefined);
  const [newOwner, setNewOwner] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  useEffect(() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }
  }, []);

  useEffect(() => {
    const handleAccounts = async () => {
      if (ethWallet) {
        const accounts = await ethWallet.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          getATMContract(accounts[0]);
        }
      }
    };
    handleAccounts();
  }, [ethWallet]);

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        getATMContract(accounts[0]);
      }
    } catch (error) {
      handleError(error, "connecting account");
    }
  };

  const getATMContract = (account) => {
    try {
      const provider = new ethers.providers.Web3Provider(ethWallet, "any");
      const signer = provider.getSigner(account);
      const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
      setATM(atmContract);
      fetchContractData(atmContract);
    } catch (error) {
      console.error("Error setting up contract:", error);
    }
  };

  const fetchContractData = async (atmContract) => {
    try {
      const balance = await atmContract.getBalance();
      setBalance(ethers.utils.formatEther(balance));

      const ownerAddress = await atmContract.showOwner();
      setOwner(ownerAddress);
    } catch (error) {
      console.error("Error fetching contract data:", error);
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        let tx = await atm.deposit({ value: ethers.utils.parseEther("1") });
        await tx.wait();
        getBalance();
      } catch (error) {
        handleError(error, "deposit");
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(ethers.utils.parseEther("1"));
        await tx.wait();
        getBalance();
      } catch (error) {
        handleError(error, "withdraw");
      }
    }
  };

  const changeOwner = async () => {
    if (atm && newOwner) {
      try {
        let tx = await atm.changeOwner(newOwner);
        await tx.wait();
        getOwner();
      } catch (error) {
        handleError(error, "change owner");
      }
    }
  };

  const transferFunds = async () => {
    if (atm && transferTo && transferAmount) {
      try {
        let tx = await atm.transferFunds(transferTo, ethers.utils.parseEther(transferAmount));
        await tx.wait();
        getBalance();
      } catch (error) {
        handleError(error, "transfer funds");
      }
    }
  };

  const handleError = (error, action) => {
    if (error.code === 4001) {
      console.error(`User rejected the request to ${action}`);
    } else {
      console.error(`Error during ${action}:`, error);
    }
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balance = await atm.getBalance();
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  const getOwner = async () => {
    if (atm) {
      try {
        const ownerAddress = await atm.showOwner();
        setOwner(ownerAddress);
      } catch (error) {
        console.error("Error fetching owner:", error);
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    if (owner === undefined) {
      getOwner();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance !== undefined ? `${balance} ETH` : "Loading..."}</p>
        <p>Contract Owner: {owner !== undefined ? owner : "Loading..."}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <div>
          <h3>Change Owner</h3>
          <input
            type="text"
            placeholder="New Owner Address"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
          />
          <button onClick={changeOwner}>Change Owner</button>
        </div>
        <div>
          <h3>Transfer Funds</h3>
          <input
            type="text"
            placeholder="Recipient Address"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount in ETH"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <button onClick={transferFunds}>Transfer</button>
        </div>
      </div>
    );
  };

  return (
    <main className="container">
      <header><h1>Welcome to the SHOURYA'S ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #2c3e50;
          color: yellow;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        button {
          margin: 5px;
        }
        input {
          margin: 5px;
        }
      `}
      </style>
    </main>
  );
}
