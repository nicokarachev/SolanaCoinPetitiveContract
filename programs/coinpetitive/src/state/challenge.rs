use anchor_lang::prelude::*;

use crate::errors;

#[account]
#[derive(Default, Debug)]
pub struct Challenge {
    pub creator: Pubkey,
    pub is_active: bool,
    pub reward: u64,
    pub participation_fee: u64,
    pub voting_fee: u64,
    pub challenge_treasury: u64, // Holds participation fees
    pub voting_treasury: u64,    // Holds voting fees
    pub winner: Option<Pubkey>,
    pub total_votes: u64,
    pub winning_votes: u64,                   // Votes for the winner
    pub reward_token_mint: Pubkey,            // CPT token mint
    pub participants: Vec<Pubkey>,            // List of participants
    pub max_participants: u8,                 // Maximum allowed participants
    pub submission_votes: Vec<(Pubkey, u64)>, // (submission_id, votes)
    pub voters: Vec<(Pubkey, Pubkey)>,        // (voter, submission_id)
    pub treasury: Pubkey,                     // Treasury PDA address
    pub voting_treasury_pda: Pubkey,          // Add this new field for voting treasury PDA
}

impl anchor_lang::Id for Challenge {
    fn id() -> Pubkey {
        crate::ID
    }
}

impl Challenge {
    // Check if a participant is already in the challenge
    pub fn has_participant(&self, participant: &Pubkey) -> bool {
        self.participants.iter().any(|p| p == participant)
    }

    // Check if a voter has already voted for a submission
    pub fn has_voted_for(&self, voter: &Pubkey, submission_id: &Pubkey) -> bool {
        self.voters
            .iter()
            .any(|(v, s)| v == voter && s == submission_id)
    }

    // Add a vote for a submission
    pub fn add_vote(&mut self, voter: Pubkey, submission_id: Pubkey) -> Result<()> {
        // Check if voter has already voted for this submission
        if self.has_voted_for(&voter, &submission_id) {
            return Err(errors::ErrorCode::AlreadyVoted.into());
        }

        // Record the vote
        self.voters.push((voter, submission_id));

        // Find or add submission to the votes tracking
        let submission_idx = self
            .submission_votes
            .iter()
            .position(|(id, _)| *id == submission_id);

        if let Some(idx) = submission_idx {
            // Update existing submission vote count
            self.submission_votes[idx].1 += 1;
        } else {
            // Add new submission with 1 vote
            self.submission_votes.push((submission_id, 1));
        }

        Ok(())
    }
}
