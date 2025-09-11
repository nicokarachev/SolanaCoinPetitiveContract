use anchor_lang::prelude::*;
pub mod constraints;
pub mod errors;
pub mod instructions;
pub mod state;
use instructions::*;
declare_id!("5NLxDYs6Br5H8D3F3eq4JjGa8wX292onmvwKbLC3wEbU");

#[program]
pub mod coinpetitive {
    use crate::instructions::finalize_challenge::FinalizeChallenge;

    use super::*;

    pub fn init_token(ctx: Context<InitToken>, metadata: InitTokenParams) -> Result<()> {
        instructions::initiate_token(ctx, metadata)
    }

    pub fn mint_token(ctx: Context<MintTokens>, supply: u64) -> Result<()> {
        instructions::mint_tokens(ctx, supply)
    }

    pub fn transfer_founder(ctx: Context<PartiesTr>, amount: u64) -> Result<()> {
        instructions::founder_transfer(ctx, amount)
    }

    pub fn transfer_dev(ctx: Context<PartiesTr>, amount: u64) -> Result<()> {
        instructions::dev_transfer(ctx, amount)
    }

    pub fn marketing_transfer(ctx: Context<PartiesTr>, amount: u64) -> Result<()> {
        instructions::do_marketing_transfer(ctx, amount)
    }

    // Updated Challenge Functions
    pub fn create_challenge(
        ctx: Context<CreateChallenge>,
        reward: u64,
        participation_fee: u64,
        voting_fee: u64,
        max_participants: u8,
        challenge_id: u64, // Add this new parameter
    ) -> Result<()> {
        instructions::challenge::create_challenge::handle(
            ctx,
            reward,
            participation_fee,
            voting_fee,
            max_participants,
            challenge_id,
        )
    }

    pub fn pay_participation_fee(ctx: Context<PayParticipationFee>) -> Result<()> {
        instructions::challenge::pay_participation_fee::handle(ctx)
    }

    pub fn vote_for_submission(ctx: Context<VoteForSubmission>) -> Result<()> {
        instructions::challenge::vote_for_submission::handle(ctx)
    }

    // pub fn finalize_challenge(
    //     ctx: Context<FinalizeChallenge>,
    //     winner_pubkey: Pubkey,
    //     winning_votes: u64,
    // ) -> Result<()> {
    //     instructions::finalize_challenge(ctx, &winner_pubkey, winning_votes)
    // }

    pub fn finalize_challenge(ctx: Context<FinalizeChallenge>) -> Result<()> {
        instructions::challenge::finalize_challenge::handle(ctx)
    }

    pub fn submit_video(ctx: Context<SubmitVideo>, video_url: String) -> Result<()> {
        instructions::challenge::submit_video::handle(ctx, video_url)
    }

    pub fn distribute_voting_treasury(
        ctx: Context<DistributeVotingTreasury>,
        voter: Pubkey,
        voter_index: u64,
    ) -> Result<()> {
        instructions::challenge::distribute_voting_treasury::handle(ctx, voter, voter_index)
    }

    pub fn claim_creator_reward(ctx: Context<ClaimCreatorReward>) -> Result<()> {
        instructions::challenge::claim_creator_reward::handle(ctx)
    }

    pub fn initialize_fee_tracker(ctx: Context<InitializeFeeTracker>) -> Result<()> {
        instructions::initialize_fee_tracker(ctx)
    }

    pub fn initialize_challenge_tracker(ctx: Context<InitializeChallengeTracker>) -> Result<()> {
        instructions::initialize_challenge_tracker(ctx)
    }
}
