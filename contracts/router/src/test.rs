#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Env, String};

mod token_contract {
    soroban_sdk::contractimport!(file = "../../target/wasm32v1-none/release/token.wasm");
}

mod pool_contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32v1-none/release/liquidity_pool.wasm"
    );
}

#[test]
fn test_router_swap() {
    let e = Env::default();
    e.mock_all_auths();

    let user = Address::generate(&e);
    let admin = Address::generate(&e);

    // 1. Setup Tokens
    let token_a_id = e.register(token_contract::WASM, ());
    let token_b_id = e.register(token_contract::WASM, ());
    let token_a = token_contract::Client::new(&e, &token_a_id);
    let token_b = token_contract::Client::new(&e, &token_b_id);

    token_a.initialize(
        &admin,
        &7,
        &String::from_str(&e, "A"),
        &String::from_str(&e, "A"),
    );
    token_b.initialize(
        &admin,
        &7,
        &String::from_str(&e, "B"),
        &String::from_str(&e, "B"),
    );

    token_a.mint(&user, &10000);
    token_a.mint(&admin, &10000); // Admin will provide initial liquidity
    token_b.mint(&admin, &10000);

    // 2. Setup Pool
    let pool_id = e.register(pool_contract::WASM, ());
    let pool = pool_contract::Client::new(&e, &pool_id);
    pool.initialize(&token_a_id, &token_b_id);
    pool.deposit(&admin, &5000, &5000);

    // 3. Setup Router
    let router_id = e.register(Router, ());
    let router = RouterClient::new(&e, &router_id);

    // 4. Swap via Router
    // User swaps 100 Token A for B
    // Expected output ~ 90 (from previous test calculation)
    let amount_out = router.swap_exact_tokens(&user, &pool_id, &token_a_id, &100, &80);

    assert!(amount_out >= 80);
    assert!(token_b.balance(&user) > 0);
}

#[test]
#[should_panic(expected = "slippage protection: output amount too low")]
fn test_router_slippage_protection() {
    let e = Env::default();
    e.mock_all_auths();

    let user = Address::generate(&e);
    let admin = Address::generate(&e);

    let token_a_id = e.register(token_contract::WASM, ());
    let token_b_id = e.register(token_contract::WASM, ());
    let token_a = token_contract::Client::new(&e, &token_a_id);
    let token_b = token_contract::Client::new(&e, &token_b_id);
    token_a.initialize(
        &admin,
        &7,
        &String::from_str(&e, "A"),
        &String::from_str(&e, "A"),
    );
    token_b.initialize(
        &admin,
        &7,
        &String::from_str(&e, "B"),
        &String::from_str(&e, "B"),
    );
    token_a.mint(&user, &1000);
    token_a.mint(&admin, &1000);
    token_b.mint(&admin, &1000);

    let pool_id = e.register(pool_contract::WASM, ());
    let pool = pool_contract::Client::new(&e, &pool_id);
    pool.initialize(&token_a_id, &token_b_id);
    pool.deposit(&admin, &1000, &1000);

    let router_id = e.register(Router, ());
    let router = RouterClient::new(&e, &router_id);

    // User wants at least 200, but only ~90 possible
    router.swap_exact_tokens(&user, &pool_id, &token_a_id, &100, &200);
}
