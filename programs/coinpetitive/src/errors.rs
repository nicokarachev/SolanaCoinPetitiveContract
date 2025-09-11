use anchor_lang::prelude::*;

#[error_code]
pub enum TokenError {
    #[msg("Not the owner")]
    InvalidTokenOwner,
    #[msg("Exceeds initial supply cap of 21M tokens")]
    ExceedsInitialSupplyCap,
    #[msg("Exceeds maximum supply cap of 61M tokens")]
    ExceedsMaxSupplyCap,
    #[msg("Minting increment must be exactly 5M tokens")]
    InvalidMintIncrement,
    #[msg("Minting is limited to once per year")]
    MintingTooFrequent,
    #[msg("No minting conditions have been met")]
    NoMintConditionsMet,
    #[msg("Exceeds daily sell limit of 1% of circulating supply")]
    ExceedsDailySellLimit,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid batch size")]
    InvalidBatchSize,
    #[msg("Wallet already tracked")]
    WalletAlreadyTracked,
    #[msg("Too many requests")]
    TooManyRequests,
    #[msg("Invalid blockhash")]
    InvalidBlockhash,
    #[msg("Invalid token owner")]
    NotTokenOwner,
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    #[msg("Insufficient token balance")]
    InsufficientTokenBalance,
    #[msg("Not authorized")]
    NotAuthorized,
    #[msg("Owner mismatch")]
    OwnerMismatch,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Challenge not active")]
    ChallengeNotActive,
    #[msg("Challenge is still active")]
    ChallengeStillActive,
    #[msg("Invalid creator")]
    InvalidCreator,
    #[msg("Invalid submission ID")]
    InvalidSubmissionId,
    #[msg("Voting period has not ended")]
    VotingPeriodActive,
    #[msg("Invalid vote count")]
    InvalidVoteCount,
    #[msg("Invalid winner")]
    InvalidWinner,
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    #[msg("Maximum participants reached")]
    MaxParticipantsReached,
    #[msg("Already participated")]
    AlreadyParticipated,
    #[msg("Already voted")]
    AlreadyVoted,
    #[msg("Submission not found")]
    SubmissionNotFound,
    #[msg("Invalid treasury")]
    InvalidTreasury,
    #[msg("Invalid token program")]
    InvalidTokenProgram,
    #[msg("Invalid token treasury")]
    InvalidVotingTreasury,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Maximum number of voters reached for this challenge")]
    MaxVotersReached,
    #[msg("No submissions found")]
    NoSubmissions,
    #[msg("No votes found for any submission")]
    NoVotes,
    #[msg("Voter did not vote for the winning submission")]
    VoterDidNotVoteForWinner,
    #[msg("No reward to distribute")]
    NoRewardToDistribute,
    #[msg("Invalid token account")]
    InvalidTokenAccount,
    #[msg("math overflow")]
    MathOverflow,
    #[msg("No winner declared")]
    NoWinnerDeclared,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Insufficient funds")]
    InsufficientFunds,
}