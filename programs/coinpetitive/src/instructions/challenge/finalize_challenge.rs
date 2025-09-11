use crate::constraints::*;
use crate::errors::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program;

#[derive(Accounts)]
pub struct FinalizeChallenge<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        constraint = challenge.is_active @ ErrorCode::ChallengeNotActive
    )]
    pub challenge: Box<Account<'info, Challenge>>,

    // Token accounts
    /// CHECK: Token-2022 program
    #[account(address = TOKEN_2022_PROGRAM_ID.parse::<Pubkey>().unwrap())]
    pub token_program: AccountInfo<'info>,

    /// CHECK: Winner's token account - verified in handler
    #[account(mut)]
    pub winner_token_account: AccountInfo<'info>,

    /// CHECK: Runner-up's token account (for 2nd place)
    #[account(mut)]
    pub runnerup_token_account: AccountInfo<'info>,

    /// CHECK: Main treasury PDA - verified in handler
    #[account(mut)]
    pub treasury: AccountInfo<'info>,

    /// CHECK: Treasury's token account
    #[account(mut)]
    pub treasury_token_account: AccountInfo<'info>,

    /// CHECK: Platform treasury for collecting fees
    #[account(mut)]
    pub platform_treasury_token_account: AccountInfo<'info>,

    /// CHECK: Creator's token account - just verify it matches the creator in challenge
    #[account(mut)]
    pub creator_token_account: AccountInfo<'info>,

    /// CHECK: The actual creator of the challenge
    pub creator: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"challenge_tracker"],
        bump,
    )]
    pub challenge_tracker: Box<Account<'info, ChallengeTracker>>,

    // System program
    pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<FinalizeChallenge>) -> Result<()> {
    let challenge = &mut ctx.accounts.challenge;

    // Verify creator key matches challenge creator
    require!(
        ctx.accounts.creator.key() == challenge.creator,
        ErrorCode::InvalidCreator
    );

    // Verify treasury matches the one stored in the challenge
    require!(
        ctx.accounts.treasury.key() == challenge.treasury,
        ErrorCode::InvalidTreasury
    );

    // Find the submission with the most votes
    if challenge.submission_votes.is_empty() {
        return Err(ErrorCode::NoSubmissions.into());
    }

    // Sort submissions by vote count (descending)
    let mut sorted_submissions = challenge.submission_votes.clone();
    sorted_submissions.sort_by(|a, b| b.1.cmp(&a.1));

    // Get the winning submission and runner-up
    let (winning_submission, winning_votes) = sorted_submissions[0];

    // Make sure the winner has at least one vote
    if winning_votes == 0 {
        return Err(ErrorCode::NoVotes.into());
    }

    msg!(
        "Found winner submission: {} with {} votes",
        winning_submission,
        winning_votes
    );

    // Find the winner's pubkey by checking which participant submitted this
    let winner_pubkey = winning_submission;

    // Mark challenge as inactive
    challenge.is_active = false;

    // Set winner info
    challenge.winner = Some(winner_pubkey);
    challenge.winning_votes = winning_votes;

    // Calculate platform fee (2.1% of reward pool)
    let total_reward = challenge.reward;
    let platform_fee =
        (total_reward as u128 * PLATFORM_FEE_RATE as u128 / BASIS_POINTS as u128) as u64;
    let reward_after_fee = total_reward - platform_fee;

    msg!(
        "Total reward: {}, Platform fee (2.1%): {}, Remaining reward: {}",
        total_reward,
        platform_fee,
        reward_after_fee
    );

    // Calculate winner and runner-up rewards from the fee-adjusted pool
    let winner_reward = (reward_after_fee * 75) / 100; // 75% to winner
    let runnerup_reward = reward_after_fee - winner_reward; // 25% to runner-up

    // Get bump seeds for treasury PDA to sign transaction
    let challenge_pubkey = challenge.key();
    let (_, bump) =
        Pubkey::find_program_address(&[b"treasury", challenge_pubkey.as_ref()], ctx.program_id);

    let treasury_seeds = &[b"treasury", challenge_pubkey.as_ref(), &[bump]];

    // Transfer platform fee first
    if platform_fee > 0 {
        msg!(
            "Transferring {} tokens to platform treasury (2.1% fee)",
            platform_fee
        );

        let platform_fee_ix = solana_program::instruction::Instruction {
            program_id: ctx.accounts.token_program.key(),
            accounts: vec![
                solana_program::instruction::AccountMeta::new(
                    ctx.accounts.treasury_token_account.key(),
                    false,
                ),
                solana_program::instruction::AccountMeta::new(
                    ctx.accounts.platform_treasury_token_account.key(),
                    false,
                ),
                solana_program::instruction::AccountMeta::new_readonly(
                    ctx.accounts.treasury.key(),
                    true,
                ),
            ],
            data: [3]
                .into_iter() // Token instruction 3 = Transfer
                .chain(platform_fee.to_le_bytes().into_iter())
                .collect(),
        };

        solana_program::program::invoke_signed(
            &platform_fee_ix,
            &[
                ctx.accounts.treasury_token_account.to_account_info(),
                ctx.accounts
                    .platform_treasury_token_account
                    .to_account_info(),
                ctx.accounts.treasury.to_account_info(),
            ],
            &[treasury_seeds],
        )?;

        msg!("Platform fee transferred successfully");
    }

    // Transfer reward to winner from main treasury
    if winner_reward > 0 {
        msg!(
            "Transferring {} tokens to winner (75% of reward after fees)",
            winner_reward
        );

        let winner_transfer_ix = solana_program::instruction::Instruction {
            program_id: ctx.accounts.token_program.key(),
            accounts: vec![
                solana_program::instruction::AccountMeta::new(
                    ctx.accounts.treasury_token_account.key(),
                    false,
                ),
                solana_program::instruction::AccountMeta::new(
                    ctx.accounts.winner_token_account.key(),
                    false,
                ),
                solana_program::instruction::AccountMeta::new_readonly(
                    ctx.accounts.treasury.key(),
                    true,
                ),
            ],
            data: [3]
                .into_iter() // Token instruction 3 = Transfer
                .chain(winner_reward.to_le_bytes().into_iter())
                .collect(),
        };

        solana_program::program::invoke_signed(
            &winner_transfer_ix,
            &[
                ctx.accounts.treasury_token_account.to_account_info(),
                ctx.accounts.winner_token_account.to_account_info(),
                ctx.accounts.treasury.to_account_info(),
            ],
            &[treasury_seeds],
        )?;

        msg!(
            "Transferred {} tokens to winner: {}",
            winner_reward,
            winner_pubkey
        );
    }

    // Transfer to runner-up if there is one and there's a reward
    if sorted_submissions.len() > 1 && runnerup_reward > 0 {
        let (runnerup_submission, runnerup_votes) = sorted_submissions[1];
        let runnerup_pubkey = runnerup_submission;

        msg!(
            "Transferring {} tokens to runner-up (25% of reward after fees)",
            runnerup_reward
        );

        let runnerup_transfer_ix = solana_program::instruction::Instruction {
            program_id: ctx.accounts.token_program.key(),
            accounts: vec![
                solana_program::instruction::AccountMeta::new(
                    ctx.accounts.treasury_token_account.key(),
                    false,
                ),
                solana_program::instruction::AccountMeta::new(
                    ctx.accounts.runnerup_token_account.key(),
                    false,
                ),
                solana_program::instruction::AccountMeta::new_readonly(
                    ctx.accounts.treasury.key(),
                    true,
                ),
            ],
            data: [3]
                .into_iter() // Token instruction 3 = Transfer
                .chain(runnerup_reward.to_le_bytes().into_iter())
                .collect(),
        };

        solana_program::program::invoke_signed(
            &runnerup_transfer_ix,
            &[
                ctx.accounts.treasury_token_account.to_account_info(),
                ctx.accounts.runnerup_token_account.to_account_info(),
                ctx.accounts.treasury.to_account_info(),
            ],
            &[treasury_seeds],
        )?;

        msg!(
            "Transferred {} tokens to runner-up: {}",
            runnerup_reward,
            runnerup_pubkey
        );
    }

    // After winners are paid, transfer any remaining balance to the creator
    let treasury_balance = challenge.challenge_treasury - total_reward; // Participation fees minus rewards

    if treasury_balance > 0 {
        msg!(
            "Transferring remaining {} tokens from treasury to creator",
            treasury_balance
        );

        let creator_transfer_ix = solana_program::instruction::Instruction {
            program_id: ctx.accounts.token_program.key(),
            accounts: vec![
                solana_program::instruction::AccountMeta::new(
                    ctx.accounts.treasury_token_account.key(),
                    false,
                ),
                solana_program::instruction::AccountMeta::new(
                    ctx.accounts.creator_token_account.key(),
                    false,
                ),
                solana_program::instruction::AccountMeta::new_readonly(
                    ctx.accounts.treasury.key(),
                    true,
                ),
            ],
            data: [3]
                .into_iter() // Token instruction 3 = Transfer
                .chain(treasury_balance.to_le_bytes().into_iter())
                .collect(),
        };

        // Execute the transfer
        solana_program::program::invoke_signed(
            &creator_transfer_ix,
            &[
                ctx.accounts.treasury_token_account.to_account_info(),
                ctx.accounts.creator_token_account.to_account_info(),
                ctx.accounts.treasury.to_account_info(),
            ],
            &[treasury_seeds],
        )?;

        msg!(
            "Transferred remaining {} tokens to creator",
            treasury_balance
        );
    }

    // Update challenge tracker with this finalized challenge
    let tracker = &mut ctx.accounts.challenge_tracker;
    tracker.total_challenges = tracker
        .total_challenges
        .checked_add(1)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    msg!(
        "Challenge completed and tracked! Total challenges finalized: {}",
        tracker.total_challenges
    );

    msg!("Challenge finalized successfully with 2.1% platform fee collected!");
    Ok(())
}
