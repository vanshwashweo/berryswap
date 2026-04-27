#![no_std]
use soroban_sdk::{contract, contractevent, contractimpl, contracttype, token, Address, Env};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    TokenA,
    TokenB,
    ReserveA,
    ReserveB,
    TotalShares,
    Balance(Address),
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DepositEvent {
    pub user: Address,
    pub amount_a: i128,
    pub amount_b: i128,
    pub shares: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WithdrawEvent {
    pub user: Address,
    pub amount_a: i128,
    pub amount_b: i128,
    pub shares: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SwapEvent {
    pub user: Address,
    pub token_in: Address,
    pub amount_in: i128,
    pub amount_out: i128,
}

#[contract]
pub struct LiquidityPool;

#[contractimpl]
impl LiquidityPool {
    pub fn initialize(e: Env, token_a: Address, token_b: Address) {
        if e.storage().instance().has(&DataKey::TokenA) {
            panic!("already initialized");
        }
        // Ensure canonical ordering
        if token_a < token_b {
            e.storage().instance().set(&DataKey::TokenA, &token_a);
            e.storage().instance().set(&DataKey::TokenB, &token_b);
        } else {
            e.storage().instance().set(&DataKey::TokenA, &token_b);
            e.storage().instance().set(&DataKey::TokenB, &token_a);
        }
        e.storage().instance().set(&DataKey::ReserveA, &0i128);
        e.storage().instance().set(&DataKey::ReserveB, &0i128);
        e.storage().instance().set(&DataKey::TotalShares, &0i128);
    }

    pub fn deposit(e: Env, user: Address, amount_a: i128, amount_b: i128) -> i128 {
        user.require_auth();

        let token_a = Self::get_token_a(e.clone());
        let token_b = Self::get_token_b(e.clone());

        let reserve_a = get_reserve_a(&e);
        let reserve_b = get_reserve_b(&e);
        let total_shares = get_total_shares(&e);

        // Transfer tokens to pool
        token::Client::new(&e, &token_a).transfer(&user, &e.current_contract_address(), &amount_a);
        token::Client::new(&e, &token_b).transfer(&user, &e.current_contract_address(), &amount_b);

        let shares_to_mint = if total_shares == 0 {
            // Initial liquidity: geometric mean (approximate simple version)
            // In production, use sqrt logic or fixed amount
            amount_a + amount_b
        } else {
            // min(amount_a / reserve_a, amount_b / reserve_b) * total_shares
            let share_a = (amount_a * total_shares) / reserve_a;
            let share_b = (amount_b * total_shares) / reserve_b;
            if share_a < share_b {
                share_a
            } else {
                share_b
            }
        };

        if shares_to_mint <= 0 {
            panic!("insufficient liquidity provided");
        }

        e.storage()
            .instance()
            .set(&DataKey::ReserveA, &(reserve_a + amount_a));
        e.storage()
            .instance()
            .set(&DataKey::ReserveB, &(reserve_b + amount_b));
        e.storage()
            .instance()
            .set(&DataKey::TotalShares, &(total_shares + shares_to_mint));

        let balance = get_balance(&e, &user);
        e.storage()
            .persistent()
            .set(&DataKey::Balance(user.clone()), &(balance + shares_to_mint));

        DepositEvent {
            user,
            amount_a,
            amount_b,
            shares: shares_to_mint,
        }
        .publish(&e);

        shares_to_mint
    }

    pub fn swap(e: Env, user: Address, token_in: Address, amount_in: i128) -> i128 {
        user.require_auth();

        let token_a = Self::get_token_a(e.clone());
        let token_b = Self::get_token_b(e.clone());

        let (res_in, res_out, t_in, t_out) = if token_in == token_a {
            (
                get_reserve_a(&e),
                get_reserve_b(&e),
                token_a.clone(),
                token_b.clone(),
            )
        } else if token_in == token_b {
            (
                get_reserve_b(&e),
                get_reserve_a(&e),
                token_b.clone(),
                token_a.clone(),
            )
        } else {
            panic!("invalid token");
        };

        // 0.3% fee: amount_with_fee = amount_in * 997 / 1000
        let amount_in_with_fee = (amount_in * 997) / 1000;
        let amount_out = (res_out * amount_in_with_fee) / (res_in + amount_in_with_fee);

        if amount_out <= 0 {
            panic!("insufficient output amount");
        }

        // Transfer tokens
        token::Client::new(&e, &t_in).transfer(&user, &e.current_contract_address(), &amount_in);
        token::Client::new(&e, &t_out).transfer(&e.current_contract_address(), &user, &amount_out);

        // Update reserves
        if token_in == token_a {
            e.storage()
                .instance()
                .set(&DataKey::ReserveA, &(res_in + amount_in));
            e.storage()
                .instance()
                .set(&DataKey::ReserveB, &(res_out - amount_out));
        } else {
            e.storage()
                .instance()
                .set(&DataKey::ReserveB, &(res_in + amount_in));
            e.storage()
                .instance()
                .set(&DataKey::ReserveA, &(res_out - amount_out));
        }

        SwapEvent {
            user,
            token_in,
            amount_in,
            amount_out,
        }
        .publish(&e);

        amount_out
    }

    pub fn withdraw(e: Env, user: Address, share_amount: i128) -> (i128, i128) {
        user.require_auth();

        let balance = get_balance(&e, &user);
        if balance < share_amount {
            panic!("insufficient shares");
        }

        let total_shares = get_total_shares(&e);
        let res_a = get_reserve_a(&e);
        let res_b = get_reserve_b(&e);

        let amount_a = (share_amount * res_a) / total_shares;
        let amount_b = (share_amount * res_b) / total_shares;

        let token_a = Self::get_token_a(e.clone());
        let token_b = Self::get_token_b(e.clone());

        // Transfer to user
        token::Client::new(&e, &token_a).transfer(&e.current_contract_address(), &user, &amount_a);
        token::Client::new(&e, &token_b).transfer(&e.current_contract_address(), &user, &amount_b);

        // Update state
        e.storage()
            .instance()
            .set(&DataKey::ReserveA, &(res_a - amount_a));
        e.storage()
            .instance()
            .set(&DataKey::ReserveB, &(res_b - amount_b));
        e.storage()
            .instance()
            .set(&DataKey::TotalShares, &(total_shares - share_amount));
        e.storage()
            .persistent()
            .set(&DataKey::Balance(user.clone()), &(balance - share_amount));

        WithdrawEvent {
            user,
            amount_a,
            amount_b,
            shares: share_amount,
        }
        .publish(&e);

        (amount_a, amount_b)
    }

    pub fn get_rsrv_a(e: Env) -> i128 {
        get_reserve_a(&e)
    }

    pub fn get_rsrv_b(e: Env) -> i128 {
        get_reserve_b(&e)
    }

    pub fn get_t_shares(e: Env) -> i128 {
        get_total_shares(&e)
    }

    pub fn get_token_a(e: Env) -> Address {
        e.storage().instance().get(&DataKey::TokenA).unwrap()
    }

    pub fn share_balance(e: Env, user: Address) -> i128 {
        get_balance(&e, &user)
    }

    pub fn get_token_b(e: Env) -> Address {
        e.storage().instance().get(&DataKey::TokenB).unwrap()
    }
}

fn get_reserve_a(e: &Env) -> i128 {
    e.storage().instance().get(&DataKey::ReserveA).unwrap_or(0)
}

fn get_reserve_b(e: &Env) -> i128 {
    e.storage().instance().get(&DataKey::ReserveB).unwrap_or(0)
}

fn get_total_shares(e: &Env) -> i128 {
    e.storage()
        .instance()
        .get(&DataKey::TotalShares)
        .unwrap_or(0)
}

fn get_balance(e: &Env, id: &Address) -> i128 {
    e.storage()
        .persistent()
        .get(&DataKey::Balance(id.clone()))
        .unwrap_or(0)
}

mod test;
