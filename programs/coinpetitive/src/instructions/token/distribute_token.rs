use crate::constraints::*;
use crate::errors::TokenError;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use std::str::FromStr;

#[derive(Accounts)]
pub struct PartiesTr<'info> {
    #[account(mut)]
    pub from: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub to: Box<Account<'info, TokenAccount>>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

fn transfer_to_wallet(ctx: &Context<PartiesTr>, expected_owner: Pubkey, amount: u64) -> Result<()> {
    require!(
        ctx.accounts.to.owner == expected_owner,
        TokenError::InvalidTokenOwner
    );

    let cpi_accounts = Transfer {
        from: ctx.accounts.from.to_account_info(),
        to: ctx.accounts.to.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token::transfer(cpi_ctx, amount)?;

    Ok(())
}

//transfers to founder team wallet
pub fn founder_transfer(ctx: Context<PartiesTr>, amount: u64) -> Result<()> {
    let founder_wallet = Pubkey::from_str(FOUNDER_WALLET).expect("Failed to parse founder wallet");

    transfer_to_wallet(&ctx, founder_wallet, amount)
}

//transfers to dev team wallet
pub fn dev_transfer(ctx: Context<PartiesTr>, amount: u64) -> Result<()> {
    let dev_wallet = Pubkey::from_str(DEV_WALLET).expect("Failed to parse dev wallet");

    transfer_to_wallet(&ctx, dev_wallet, amount)
}

//transfers to marketing team wallet
pub fn do_marketing_transfer(ctx: Context<PartiesTr>, amount: u64) -> Result<()> {
    let marketing_wallet =
        Pubkey::from_str(MARKET_WALLET).expect("Failed to parse marketing wallet");

    transfer_to_wallet(&ctx, marketing_wallet, amount)
}
