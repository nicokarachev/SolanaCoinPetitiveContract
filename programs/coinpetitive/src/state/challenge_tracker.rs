use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct ChallengeTracker {
    pub total_challenges: u64,
    pub authority: Pubkey,
}

impl ChallengeTracker {
    // Space required for the account
    pub const SPACE: usize = 8 + std::mem::size_of::<ChallengeTracker>();
}

impl anchor_lang::Id for ChallengeTracker {
    fn id() -> Pubkey {
        crate::ID
    }
}
