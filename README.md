# Assero - Blockchain Asset Management

A modern web3 platform for managing digital assets on the blockchain with style! ⛓️

## Features

- Create digital assets (Houses, Cars, Land)
- Transfer asset ownership
- View owned assets
- Blockchain-based secure transactions
- MetaMask integration
- Beautiful animations
- Responsive design

## Tech Stack

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- Framer Motion
- Ethers.js v6
- React Hot Toast

### Smart Contracts
- Solidity ✨
- Hardhat
- OpenZeppelin Contracts

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MetaMask browser extension
- Ethereum testnet (Sepolia) connection

### Installation

Clone the repository:
```
git clone https://github.com/yourusername/assero.git
cd assero
```

Install dependencies:
```
cd assero-frontend
npm install
```

Set up environment variables:

Frontend (.env.local):
```
NEXT_PUBLIC_RPC_URL=your_ethereum_rpc_url
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
```

### Run the development server:
```
# Frontend (http://localhost:3000)
npm run dev
```

## Project Structure

```
assero/
├── assero-frontend/    # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js app router
│   │   ├── components/   # React components
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
└── asset-contract/       # Smart contracts
    ├── contracts/        # Solidity contracts
    └── test/             # Contract tests
```

## Features in Detail

### Asset Creation 🏗️
- Multiple asset types (House, Car, Land)
- On-chain metadata storage
- Base64 encoded JSON
- Real-time feedback

### Asset Transfer 🔄
- Secure ownership transfer
- MetaMask integration
- ERC721-based tokens

### Asset Viewing 👀
- Grid layout display
- Detailed metadata
- Type categorization
- Real-time blockchain verification

## Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request


## Contact

Your Name - @nonvegetable

Project Link: https://github.com/nonvegetable/assero

Made with 💚 and blockchain technology