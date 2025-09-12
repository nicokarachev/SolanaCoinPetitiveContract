
// Constants based on tokenomics
pub const INITIAL_SUPPLY: u64 = 21_000_000 * 1_000_000_000; // 21M tokens with 9 decimals
pub const MAX_SUPPLY: u64 = 61_000_000 * 1_000_000_000; // 61M tokens with 9 decimals
pub const FOUNDER_ALLOCATION: u64 = 1_100_000 * 1_000_000_000; // 1.1M tokens
pub const DEV_ALLOCATION: u64 = 500_000 * 1_000_000_000; // 500K tokens
pub const AFFILIATOR_ALLOCATION: u64 = 500_000 * 1_000_000_000; // 500K tokens
pub const MINT_INCREMENT: u64 = 5_000_000 * 1_000_000_000; // 5M tokens for future mints
pub const BURN_RATE: u8 = 1; // 1% burn rate on liquidity pool transactions
pub const MIN_TIME_BETWEEN_MINTS: i64 = 31_536_000; // 60 * 60 * 24 * 365, one year in seconds
pub const FIXED_SUBMISSION_FEE: u64 = 5_000_000_0;

// Make sure this matches exactly what you use in the client
pub const TOKEN_MINT_SEED: &[u8] = b"cpt_token_mint";

// This is your default mint address - you won't need to validate against it anymore
pub const CPT_TOKEN_MINT: &str = "mntjJeXswzxFCnCY1Zs2ekEzDvBVaVdyTVFXbBHfmo9";
pub const TOKEN_2022_PROGRAM_ID: &str = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
pub const ASSOCIATED_TOKEN_PROGRAM_ID: &str = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";

// Platform fee constants
pub const PLATFORM_FEE_RATE: u16 = 210; // 2.1% = 210 basis points (210/10000)
pub const BASIS_POINTS: u16 = 10000; // For percentage calculations

// Wallet addresses
pub const FOUNDER_WALLET: &str = "FuFzoMF5xTwZego84fRoscnart4dPYNkpHho2UBe7NDt";
pub const DEV_WALLET: &str = "5juEkpMJ2UWYmyhN6eLbwDwDrK4aQA2Q1aaGAP6Yjhi6";
pub const MARKET_WALLET: &str = "7KTgSrYydNKcvKTLsWS5BwDB4cDyMbdXx9ojGUGUkDFY";
