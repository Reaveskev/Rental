import { useState, useEffect } from "react";
import { Magic } from "magic-sdk";

// const WalletConnect = ({ onConnect }) => {
//   const [loading, setLoading] = useState(false);
//   const [connected, setConnected] = useState(false);
//   const [account, setAccount] = useState(null);

//   // Initialize Magic SDK with your API Key
//   const magic = new Magic("pk_live_6BD6474F196EA18A", {
//     network: "mainnet", // or "testnet" depending on your use case
//   });

//   useEffect(() => {
//     const storedAccount = localStorage.getItem("userAccount");
//     if (storedAccount) {
//       setAccount(storedAccount);
//       setConnected(true);
//     }
//   }, []);

//   const connectWallet = async () => {
//     setLoading(true);
//     try {
//       // Use Magic to connect the wallet
//       const userMetadata = await magic.wallet.connect();

//       // Get the user's account address
//       const userAccount = await magic.wallet.getAccounts();

//       if (userAccount.length > 0) {
//         setAccount(userAccount[0]);
//         setConnected(true);
//         localStorage.setItem("userAccount", userAccount[0]);
//         onConnect(userAccount[0]);
//       } else {
//         throw new Error("No account found.");
//       }
//     } catch (error) {
//       console.error("Wallet connection failed:", error);
//       setLoading(false);
//       alert("Failed to connect wallet. Please try again.");
//     }
//   };

//   const disconnectWallet = () => {
//     setConnected(false);
//     setAccount(null);
//     localStorage.removeItem("userAccount");
//   };

//   return (
//     <div className="wallet-connect">
//       {connected ? (
//         <div>
//           <p>Connected Account: {account}</p>
//           <button onClick={disconnectWallet}>Disconnect</button>
//         </div>
//       ) : (
//         <button
//           onClick={connectWallet}
//           disabled={loading}
//           className="connect-wallet-btn"
//         >
//           {loading ? "Connecting..." : "Connect Wallet"}
//         </button>
//       )}
//     </div>
//   );
// };

// export default WalletConnect;
