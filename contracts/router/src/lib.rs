#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

mod token {
    soroban_sdk::contractimport!(file = "../../target/wasm32v1-none/release/token.wasm");
}

mod pool {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32v1-none/release/liquidity_pool.wasm"
    );
}

#[contract]
pub struct Router;

#[contractimpl]
impl Router {
    pub fn swap_exact_tokens(
        e: Env,
        user: Address,
        pool_address: Address,
        token_in: Address,
        amount_in: i128,
        min_out: i128,
    ) -> i128 {
        user.require_auth();

        // 1. Transfer tokens from user to this contract (Router acts as intermediary or ensures auth)
        // Alternatively, the pool can pull directly from the user if the user gave permission to the pool.
        // But the router pattern often involves the router handling the orchestration.
        // In Soroban, we can just call the pool's swap function and it will handle the transfer from the user.
        // Let's assume the user has approved the Router to spend their tokens.

        let token_client = token::Client::new(&e, &token_in);
        token_client.transfer(&user, &e.current_contract_address(), &amount_in);

        // 2. Approve the pool to spend the router's tokens
        token_client.approve(
            &e.current_contract_address(),
            &pool_address,
            &amount_in,
            &100,
        );

        // 3. Perform swap via pool
        let pool_client = pool::Client::new(&e, &pool_address);
        let amount_out = pool_client.swap(&e.current_contract_address(), &token_in, &amount_in);

        // 4. Slippage Protection
        if amount_out < min_out {
            panic!("slippage protection: output amount too low");
        }

        // 5. Transfer output back to user
        let token_out = if token_in == pool_client.get_token_a() {
            pool_client.get_token_b()
        } else {
            pool_client.get_token_a()
        };

        token::Client::new(&e, &token_out).transfer(
            &e.current_contract_address(),
            &user,
            &amount_out,
        );

        amount_out
    }
}

mod test;
