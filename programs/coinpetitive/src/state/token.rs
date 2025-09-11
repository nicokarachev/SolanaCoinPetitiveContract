use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct TokenState {
    pub current_supply: u64,
    pub last_mint_timestamp: i64,
    pub challenges_completed: u64,
    pub total_entry_fees: u64,
    pub unique_wallets: u64,
    pub mint_conditions_used: [bool; 8], // Track which of the 8 conditions have been used
    pub mint_conditions_met: [bool; 8],  // Track which of the 8 conditions have been met
    pub is_self_sustaining: bool, // Track if platform is self-sustaining
    pub last_challenge_tracked: i64, // Add this field
    pub pending_mint_milestone: Option<u8>, // Store which milestone triggers the next mint
}

impl anchor_lang::Id for TokenState {
    fn id() -> Pubkey {
        crate::ID
    }
}

impl TokenState {
    pub const SPACE: usize = 8 + std::mem::size_of::<TokenState>();
}