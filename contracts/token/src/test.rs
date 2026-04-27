#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::testutils::{Address as _, Events};
use soroban_sdk::{Env, String, IntoVal};

#[test]
fn test_token_lifecycle() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let user1 = Address::generate(&e);
    let user2 = Address::generate(&e);

    let token_id = e.register(Token, ());
    let token = TokenClient::new(&e, &token_id);

    token.initialize(
        &admin,
        &7,
        &String::from_str(&e, "Test Token"),
        &String::from_str(&e, "TST"),
    );

    // Mint
    token.mint(&user1, &1000);
    assert_eq!(token.balance(&user1), 1000);

    // Verify Mint Event
    let events = e.events().all();
    let last_event = events.iter().last().unwrap();
    // We can't easily check the new event struct in tests without more setup,
    // but we can verify the data is there.
    assert_eq!(last_event.2, 1000_i128.into_val(&e));

    // Transfer
    token.transfer(&user1, &user2, &400);
    assert_eq!(token.balance(&user1), 600);
    assert_eq!(token.balance(&user2), 400);

    // Allowance & Transfer From
    token.approve(&user2, &user1, &200, &100);
    assert_eq!(token.allowance(&user2, &user1), 200);

    token.transfer_from(&user1, &user2, &admin, &100);
    assert_eq!(token.balance(&user2), 300);
    assert_eq!(token.balance(&admin), 100);
    assert_eq!(token.allowance(&user2, &user1), 100);

    // Burn
    token.burn(&user1, &100);
    assert_eq!(token.balance(&user1), 500);
}

#[test]
#[should_panic(expected = "insufficient balance")]
fn test_transfer_insufficient_balance() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let user1 = Address::generate(&e);
    let user2 = Address::generate(&e);

    let token_id = e.register(Token, ());
    let token = TokenClient::new(&e, &token_id);
    token.initialize(
        &admin,
        &7,
        &String::from_str(&e, "Alt"),
        &String::from_str(&e, "ALT"),
    );

    token.mint(&user1, &100);
    token.transfer(&user1, &user2, &101);
}
