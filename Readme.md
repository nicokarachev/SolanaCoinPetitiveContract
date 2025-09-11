# Coinpetitive 🏆

A decentralized video challenge platform built on Solana blockchain where users can create, participate in, and vote on video challenges using the CPT (Coinpetitive) token.

## 🌟 Overview

Coinpetitive is a Web3 platform that combines social media engagement with blockchain technology to create an innovative video challenge ecosystem. Users can:

- **Create Challenges**: Set up video competitions with custom rewards and participation fees
- **Submit Videos**: Participate in challenges by uploading video submissions
- **Vote & Earn**: Vote on submissions and earn rewards from the voting treasury
- **Token Economy**: Use CPT tokens for all platform transactions and rewards

## 🏗️ Architecture

### Backend (Solana/Anchor)

- **Smart Contracts**: Rust-based Solana programs using Anchor framework
- **Token System**: Custom CPT token with Token-2022 standard
- **Challenge Management**: On-chain challenge creation, participation, and reward distribution
- **Treasury System**: Automated fee collection and reward distribution

### Frontend (Next.js)

- **Modern UI**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Wallet Integration**: Solana wallet adapter for seamless blockchain interactions
- **Database**: Supabase for user management and challenge metadata
- **Real-time Updates**: Live challenge updates and voting results

## 🚀 Features

### Core Functionality

- **Challenge Creation**: Set reward amounts, participation fees, and voting fees
- **Video Submissions**: Support for YouTube, Twitter, Instagram, and TikTok videos
- **Voting System**: Transparent on-chain voting with token incentives
- **Reward Distribution**: Automated winner selection and reward distribution
- **Treasury Management**: Separate treasuries for participation fees and voting fees

### User Experience

- **Responsive Design**: Mobile-first approach with modern UI components
- **Real-time Chat**: In-challenge communication between participants
- **Progress Tracking**: Visual indicators for challenge phases and deadlines
- **Wallet Integration**: Seamless Solana wallet connection and transaction signing

### Token Economics

- **CPT Token**: Native platform token with 9 decimal places
- **Fixed Submission Fee**: 5 CPT per video submission
- **Voting Rewards**: Voters earn from voting treasury based on participation
- **Platform Fees**: 2.1% fee on challenge rewards for platform sustainability

## 📁 Project Structure

```
coinpetitiveVsummer/
├── programs/coinpetitive/          # Solana smart contracts
│   ├── src/
│   │   ├── lib.rs                  # Main program entry point
│   │   └── instructions/           # Program instructions
│   │       ├── challenge/          # Challenge-related instructions
│   │       ├── token/              # Token management
│   │       └── ...
├── frontend/                       # Next.js web application
│   ├── src/
│   │   ├── app/                    # Next.js app router pages
│   │   ├── components/             # React components
│   │   ├── lib/                    # Utilities and configurations
│   │   └── hooks/                  # Custom React hooks
├── Anchor.toml                     # Anchor configuration
├── Cargo.toml                      # Rust workspace configuration
└── package.json                    # Node.js dependencies
```

## 🛠️ Technology Stack

### Blockchain

- **Solana**: High-performance blockchain platform
- **Anchor**: Framework for Solana program development
- **Token-2022**: Advanced token standard for enhanced functionality

### Frontend

- **Next.js 15**: React framework with app router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

### Backend & Database

- **Supabase**: Backend-as-a-Service with PostgreSQL
- **NextAuth**: Authentication solution
- **Winston**: Logging framework

### Development Tools

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Mocha**: Testing framework

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Rust and Cargo
- Solana CLI tools
- Anchor CLI

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd coinpetitiveVsummer
   ```

2. **Install dependencies**

   ```bash
   # Install Rust dependencies
   cargo build

   # Install Node.js dependencies
   npm install
   cd frontend && npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment files
   cp frontend/.env.example frontend/.env.local

   # Configure your environment variables
   # - Solana RPC endpoint
   # - Supabase credentials
   # - Wallet configuration
   ```

4. **Build and Deploy**

   ```bash
   # Build Solana programs
   anchor build

   # Deploy to devnet
   anchor deploy --provider.cluster devnet

   # Start frontend development server
   cd frontend
   npm run dev
   ```

## 📊 Smart Contract Functions

### Token Management

- `init_token`: Initialize CPT token with metadata
- `mint_token`: Mint new tokens
- `transfer_founder/dev/marketing`: Transfer tokens to different parties

### Challenge Management

- `create_challenge`: Create new video challenge
- `pay_participation_fee`: Join challenge by paying fee
- `submit_video`: Submit video with fixed 5 CPT fee
- `vote_for_submission`: Vote on video submissions
- `finalize_challenge`: End challenge and distribute rewards
- `distribute_voting_treasury`: Distribute voting rewards to participants
- `claim_creator_reward`: Claim challenge creator rewards

## 🔧 Configuration

### Anchor Configuration

The project supports multiple Solana networks:

- **Localnet**: For local development and testing
- **Devnet**: For testing on Solana devnet
- **Mainnet**: For production deployment

### Environment Variables

```env
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
WALLET_PATH=~/.config/solana/id.json

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

### Development Guidelines

- Follow Rust and TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs](docs/) folder for detailed guides
- **Issues**: Report bugs and feature requests via GitHub Issues

## 🔗 Links

- **Website**: [coinpetitive.com](https://coinpetitive.com)

---

**Built with ❤️ by the Coinpetitive Team**
```
