export type CoinpetitiveContract = {
  "address": "2gzB7Mw4NaJEL7i7rK8hCBhhXAHyJNCAbNu4r6ypRMgH",
  "metadata": {
    "name": "coinpetitiveContract",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimCreatorReward",
      "discriminator": [
        174,
        210,
        14,
        57,
        187,
        18,
        230,
        37
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "challenge"
              }
            ]
          }
        },
        {
          "name": "votingTreasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  105,
                  110,
                  103,
                  95,
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "challenge"
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "votingTreasuryTokenAccount",
          "writable": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        },
        {
          "name": "recipient",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "createChallenge",
      "discriminator": [
        170,
        244,
        47,
        1,
        1,
        15,
        173,
        239
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "challengeId"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "challenge"
              }
            ]
          }
        },
        {
          "name": "votingTreasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  105,
                  110,
                  103,
                  95,
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "challenge"
              }
            ]
          }
        },
        {
          "name": "programAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "associatedTokenProgram"
        },
        {
          "name": "votingTreasuryTokenAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "reward",
          "type": "u64"
        },
        {
          "name": "participationFee",
          "type": "u64"
        },
        {
          "name": "votingFee",
          "type": "u64"
        },
        {
          "name": "challengeId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "distributeReward",
      "discriminator": [
        135,
        65,
        136,
        143,
        108,
        234,
        198,
        46
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "winnerTokenAccount",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "distributeVotingTreasury",
      "discriminator": [
        147,
        10,
        54,
        240,
        5,
        116,
        233,
        179
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "votingTreasury",
          "writable": true
        },
        {
          "name": "votingTreasuryTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "voterTokenAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "voter",
          "type": "pubkey"
        },
        {
          "name": "winningVotersCount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finalizeChallenge",
      "discriminator": [
        184,
        38,
        132,
        51,
        103,
        143,
        203,
        9
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "platformTreasuryTokenAccount",
          "writable": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "winningUsers",
          "type": "u64"
        }
      ]
    },
    {
      "name": "handleCpt",
      "discriminator": [
        134,
        173,
        66,
        236,
        163,
        4,
        111,
        3
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "mode",
          "type": "bool"
        }
      ]
    },
    {
      "name": "initAdminPanel",
      "discriminator": [
        126,
        60,
        209,
        140,
        249,
        206,
        198,
        241
      ],
      "accounts": [
        {
          "name": "adminWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "payParticipationFee",
      "discriminator": [
        209,
        203,
        94,
        195,
        189,
        66,
        122,
        180
      ],
      "accounts": [
        {
          "name": "participant",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "participantTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "setBackendWallet",
      "discriminator": [
        73,
        187,
        182,
        176,
        150,
        42,
        93,
        220
      ],
      "accounts": [
        {
          "name": "adminWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "backendWallet",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "setCptLimit",
      "discriminator": [
        156,
        63,
        27,
        89,
        38,
        135,
        24,
        102
      ],
      "accounts": [
        {
          "name": "adminWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "cptLimit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateAdminPanel",
      "discriminator": [
        171,
        147,
        8,
        137,
        47,
        83,
        76,
        17
      ],
      "accounts": [
        {
          "name": "adminWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "updatedWallet",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "voteForSubmission",
      "discriminator": [
        3,
        100,
        69,
        41,
        43,
        102,
        125,
        172
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "voterTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "submissionId"
        },
        {
          "name": "votingTreasury",
          "writable": true
        },
        {
          "name": "votingTreasuryTokenAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "adminPanel",
      "discriminator": [
        144,
        173,
        11,
        253,
        22,
        79,
        6,
        36
      ]
    },
    {
      "name": "challenge",
      "discriminator": [
        119,
        250,
        161,
        121,
        119,
        81,
        22,
        208
      ]
    },
    {
      "name": "emptyPda",
      "discriminator": [
        142,
        163,
        54,
        157,
        170,
        125,
        40,
        250
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "challengeNotActive",
      "msg": "Challenge not active"
    },
    {
      "code": 6001,
      "name": "challengeStillActive",
      "msg": "Challenge is still active"
    },
    {
      "code": 6002,
      "name": "invalidCreator",
      "msg": "Invalid creator"
    },
    {
      "code": 6003,
      "name": "invalidSubmissionId",
      "msg": "Invalid submission ID"
    },
    {
      "code": 6004,
      "name": "votingPeriodActive",
      "msg": "Voting period has not ended"
    },
    {
      "code": 6005,
      "name": "invalidVoteCount",
      "msg": "Invalid vote count"
    },
    {
      "code": 6006,
      "name": "invalidWinner",
      "msg": "Invalid winner"
    },
    {
      "code": 6007,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint"
    },
    {
      "code": 6008,
      "name": "maxParticipantsReached",
      "msg": "Maximum participants reached"
    },
    {
      "code": 6009,
      "name": "alreadyParticipated",
      "msg": "Already participated"
    },
    {
      "code": 6010,
      "name": "alreadyVoted",
      "msg": "Already voted"
    },
    {
      "code": 6011,
      "name": "submissionNotFound",
      "msg": "Submission not found"
    },
    {
      "code": 6012,
      "name": "invalidTreasury",
      "msg": "Invalid treasury"
    },
    {
      "code": 6013,
      "name": "invalidTokenProgram",
      "msg": "Invalid token program"
    },
    {
      "code": 6014,
      "name": "invalidVotingTreasury",
      "msg": "Invalid token treasury"
    },
    {
      "code": 6015,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6016,
      "name": "maxVotersReached",
      "msg": "Maximum number of voters reached for this challenge"
    },
    {
      "code": 6017,
      "name": "noSubmissions",
      "msg": "No submissions found"
    },
    {
      "code": 6018,
      "name": "noVotes",
      "msg": "No votes found for any submission"
    },
    {
      "code": 6019,
      "name": "voterDidNotVoteForWinner",
      "msg": "Voter did not vote for the winning submission"
    },
    {
      "code": 6020,
      "name": "noRewardToDistribute",
      "msg": "No reward to distribute"
    },
    {
      "code": 6021,
      "name": "invalidTokenAccount",
      "msg": "Invalid token account"
    },
    {
      "code": 6022,
      "name": "mathOverflow",
      "msg": "math overflow"
    },
    {
      "code": 6023,
      "name": "noWinnerDeclared",
      "msg": "No winner declared"
    },
    {
      "code": 6024,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6025,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6026,
      "name": "invalidTokenAccountsLength",
      "msg": "Invalid TokenAccounts Length"
    }
  ],
  "types": [
    {
      "name": "adminPanel",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "backendWallet",
            "type": "pubkey"
          },
          {
            "name": "adminWallet",
            "type": "pubkey"
          },
          {
            "name": "adminPanelBump",
            "type": "u8"
          },
          {
            "name": "cptLimit",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "challenge",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "reward",
            "type": "u64"
          },
          {
            "name": "participationFee",
            "type": "u64"
          },
          {
            "name": "votingFee",
            "type": "u64"
          },
          {
            "name": "challengeTreasury",
            "type": "u64"
          },
          {
            "name": "votingTreasury",
            "type": "u64"
          },
          {
            "name": "totalVotes",
            "type": "u64"
          },
          {
            "name": "winningUsers",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "emptyPda",
      "type": {
        "kind": "struct"
      }
    }
  ]
};


export const idl: CoinpetitiveContract = {
  "address": "2gzB7Mw4NaJEL7i7rK8hCBhhXAHyJNCAbNu4r6ypRMgH",
  "metadata": {
    "name": "coinpetitiveContract",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimCreatorReward",
      "discriminator": [
        174,
        210,
        14,
        57,
        187,
        18,
        230,
        37
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "challenge"
              }
            ]
          }
        },
        {
          "name": "votingTreasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  105,
                  110,
                  103,
                  95,
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "challenge"
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "votingTreasuryTokenAccount",
          "writable": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        },
        {
          "name": "recipient",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "createChallenge",
      "discriminator": [
        170,
        244,
        47,
        1,
        1,
        15,
        173,
        239
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "challengeId"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "challenge"
              }
            ]
          }
        },
        {
          "name": "votingTreasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  105,
                  110,
                  103,
                  95,
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "challenge"
              }
            ]
          }
        },
        {
          "name": "programAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "associatedTokenProgram"
        },
        {
          "name": "votingTreasuryTokenAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "reward",
          "type": "u64"
        },
        {
          "name": "participationFee",
          "type": "u64"
        },
        {
          "name": "votingFee",
          "type": "u64"
        },
        {
          "name": "challengeId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "distributeReward",
      "discriminator": [
        135,
        65,
        136,
        143,
        108,
        234,
        198,
        46
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "winnerTokenAccount",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "distributeVotingTreasury",
      "discriminator": [
        147,
        10,
        54,
        240,
        5,
        116,
        233,
        179
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "votingTreasury",
          "writable": true
        },
        {
          "name": "votingTreasuryTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "voterTokenAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "voter",
          "type": "pubkey"
        },
        {
          "name": "winningVotersCount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finalizeChallenge",
      "discriminator": [
        184,
        38,
        132,
        51,
        103,
        143,
        203,
        9
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "platformTreasuryTokenAccount",
          "writable": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "winningUsers",
          "type": "u64"
        }
      ]
    },
    {
      "name": "handleCpt",
      "discriminator": [
        134,
        173,
        66,
        236,
        163,
        4,
        111,
        3
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "mode",
          "type": "bool"
        }
      ]
    },
    {
      "name": "initAdminPanel",
      "discriminator": [
        126,
        60,
        209,
        140,
        249,
        206,
        198,
        241
      ],
      "accounts": [
        {
          "name": "adminWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "payParticipationFee",
      "discriminator": [
        209,
        203,
        94,
        195,
        189,
        66,
        122,
        180
      ],
      "accounts": [
        {
          "name": "participant",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "participantTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "setBackendWallet",
      "discriminator": [
        73,
        187,
        182,
        176,
        150,
        42,
        93,
        220
      ],
      "accounts": [
        {
          "name": "adminWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "backendWallet",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "setCptLimit",
      "discriminator": [
        156,
        63,
        27,
        89,
        38,
        135,
        24,
        102
      ],
      "accounts": [
        {
          "name": "adminWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "cptLimit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateAdminPanel",
      "discriminator": [
        171,
        147,
        8,
        137,
        47,
        83,
        76,
        17
      ],
      "accounts": [
        {
          "name": "adminWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "adminPanel",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  112,
                  97,
                  110,
                  101,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "updatedWallet",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "voteForSubmission",
      "discriminator": [
        3,
        100,
        69,
        41,
        43,
        102,
        125,
        172
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "tokenProgram2022"
        },
        {
          "name": "voterTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "submissionId"
        },
        {
          "name": "votingTreasury",
          "writable": true
        },
        {
          "name": "votingTreasuryTokenAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "adminPanel",
      "discriminator": [
        144,
        173,
        11,
        253,
        22,
        79,
        6,
        36
      ]
    },
    {
      "name": "challenge",
      "discriminator": [
        119,
        250,
        161,
        121,
        119,
        81,
        22,
        208
      ]
    },
    {
      "name": "emptyPda",
      "discriminator": [
        142,
        163,
        54,
        157,
        170,
        125,
        40,
        250
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "challengeNotActive",
      "msg": "Challenge not active"
    },
    {
      "code": 6001,
      "name": "challengeStillActive",
      "msg": "Challenge is still active"
    },
    {
      "code": 6002,
      "name": "invalidCreator",
      "msg": "Invalid creator"
    },
    {
      "code": 6003,
      "name": "invalidSubmissionId",
      "msg": "Invalid submission ID"
    },
    {
      "code": 6004,
      "name": "votingPeriodActive",
      "msg": "Voting period has not ended"
    },
    {
      "code": 6005,
      "name": "invalidVoteCount",
      "msg": "Invalid vote count"
    },
    {
      "code": 6006,
      "name": "invalidWinner",
      "msg": "Invalid winner"
    },
    {
      "code": 6007,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint"
    },
    {
      "code": 6008,
      "name": "maxParticipantsReached",
      "msg": "Maximum participants reached"
    },
    {
      "code": 6009,
      "name": "alreadyParticipated",
      "msg": "Already participated"
    },
    {
      "code": 6010,
      "name": "alreadyVoted",
      "msg": "Already voted"
    },
    {
      "code": 6011,
      "name": "submissionNotFound",
      "msg": "Submission not found"
    },
    {
      "code": 6012,
      "name": "invalidTreasury",
      "msg": "Invalid treasury"
    },
    {
      "code": 6013,
      "name": "invalidTokenProgram",
      "msg": "Invalid token program"
    },
    {
      "code": 6014,
      "name": "invalidVotingTreasury",
      "msg": "Invalid token treasury"
    },
    {
      "code": 6015,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6016,
      "name": "maxVotersReached",
      "msg": "Maximum number of voters reached for this challenge"
    },
    {
      "code": 6017,
      "name": "noSubmissions",
      "msg": "No submissions found"
    },
    {
      "code": 6018,
      "name": "noVotes",
      "msg": "No votes found for any submission"
    },
    {
      "code": 6019,
      "name": "voterDidNotVoteForWinner",
      "msg": "Voter did not vote for the winning submission"
    },
    {
      "code": 6020,
      "name": "noRewardToDistribute",
      "msg": "No reward to distribute"
    },
    {
      "code": 6021,
      "name": "invalidTokenAccount",
      "msg": "Invalid token account"
    },
    {
      "code": 6022,
      "name": "mathOverflow",
      "msg": "math overflow"
    },
    {
      "code": 6023,
      "name": "noWinnerDeclared",
      "msg": "No winner declared"
    },
    {
      "code": 6024,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6025,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6026,
      "name": "invalidTokenAccountsLength",
      "msg": "Invalid TokenAccounts Length"
    }
  ],
  "types": [
    {
      "name": "adminPanel",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "backendWallet",
            "type": "pubkey"
          },
          {
            "name": "adminWallet",
            "type": "pubkey"
          },
          {
            "name": "adminPanelBump",
            "type": "u8"
          },
          {
            "name": "cptLimit",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "challenge",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "reward",
            "type": "u64"
          },
          {
            "name": "participationFee",
            "type": "u64"
          },
          {
            "name": "votingFee",
            "type": "u64"
          },
          {
            "name": "challengeTreasury",
            "type": "u64"
          },
          {
            "name": "votingTreasury",
            "type": "u64"
          },
          {
            "name": "totalVotes",
            "type": "u64"
          },
          {
            "name": "winningUsers",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "emptyPda",
      "type": {
        "kind": "struct"
      }
    }
  ]
};