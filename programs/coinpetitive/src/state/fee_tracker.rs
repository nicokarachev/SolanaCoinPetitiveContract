use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct FeeTracker {
    pub total_participation_fees: u64,
    pub total_voting_fees: u64,
    pub total_challenges: u64,
    pub authority: Pubkey,
}

impl anchor_lang::Id for FeeTracker {
    fn id() -> Pubkey {
        crate::ID
    }
}

impl FeeTracker {
    pub const SPACE: usize = 8 + std::mem::size_of::<FeeTracker>();
}