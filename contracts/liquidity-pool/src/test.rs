#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Env, String};

// Import the token contract for testing
mod token_contract {
    soroban_sdk::contractimport!(file = "../../target/wasm32v1-none/release/token.wasm");
}

#[test]
fn test_liquidity_pool_lifecycle() {
    let e = Env::default();
    e.mock_all_auths();

    let user = Address::generate(&e);
    let admin = Address::generate(&e);

    // Register Token Contracts
    let token_a_id = e.register(token_contract::WASM, ());
    let token_b_id = e.register(token_contract::WASM, ());

    let token_a = token_contract::Client::new(&e, &token_a_id);
    let token_b = token_contract::Client::new(&e, &token_b_id);

    token_a.initialize(
        &admin,
        &7,
        &String::from_str(&e, "Token A"),
        &String::from_str(&e, "TKNA"),
    );
    token_b.initialize(
        &admin,
        &7,
        &String::from_str(&e, "Token B"),
        &String::from_str(&e, "TKNB"),
    );

    // Mint tokens to user
    token_a.mint(&user, &10000);
    token_b.mint(&user, &10000);

    // Register and Initialize Pool
    let pool_id = e.register(LiquidityPool, ());
    let pool = LiquidityPoolClient::new(&e, &pool_id);
    pool.initialize(&token_a_id, &token_b_id);

    // Deposit Liquidity
    pool.deposit(&user, &1000, &1000);
    assert_eq!(pool.share_balance(&user), 2000);
    assert_eq!(token_a.balance(&user), 9000);
    assert_eq!(token_b.balance(&user), 9000);

    // Swap (Token A for B)
    // 0.3% fee: 100 * 0.997 = 99.7 -> 99
    // output = res_out * in / (res_in + in) = 1000 * 99 / (1000 + 99) = 99000 / 1099 = 90.08 -> 90
    let amount_out = pool.swap(&user, &token_a_id, &100);
    assert!(amount_out > 0);
    assert_eq!(token_b.balance(&user), 9090);

    // Withdraw
    let (withdrawn_a, withdrawn_b) = pool.withdraw(&user, &pool.share_balance(&user));
    assert!(withdrawn_a > 0);
    assert!(withdrawn_b > 0);
    assert_eq!(pool.share_balance(&user), 0);
}
