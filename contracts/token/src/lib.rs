#![no_std]
use soroban_sdk::{
    contract, contractevent, contractimpl, contractmeta, contracttype, Address, Env, String,
};

contractmeta!(key = "sep", val = "41");

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Allowance(Address, Address),
    Balance(Address),
    Metadata,
}

#[contracttype]
#[derive(Clone)]
pub struct TokenMetadata {
    pub decimal: u32,
    pub name: String,
    pub symbol: String,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MintEvent {
    pub to: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BurnEvent {
    pub from: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransferEvent {
    pub from: Address,
    pub to: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ApproveEvent {
    pub from: Address,
    pub spender: Address,
    pub amount: i128,
}

#[contract]
pub struct Token;

#[contractimpl]
impl Token {
    pub fn initialize(e: Env, admin: Address, decimal: u32, name: String, symbol: String) {
        if e.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        e.storage().instance().set(&DataKey::Admin, &admin);
        e.storage().instance().set(
            &DataKey::Metadata,
            &TokenMetadata {
                decimal,
                name,
                symbol,
            },
        );
    }

    pub fn mint(e: Env, to: Address, amount: i128) {
        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let balance = Self::balance(e.clone(), to.clone());
        e.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &(balance + amount));

        MintEvent { to, amount }.publish(&e);
    }

    pub fn burn(e: Env, from: Address, amount: i128) {
        from.require_auth();

        let balance = Self::balance(e.clone(), from.clone());
        if balance < amount {
            panic!("insufficient balance");
        }

        e.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(balance - amount));

        BurnEvent { from, amount }.publish(&e);
    }

    pub fn transfer(e: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        Self::do_transfer(&e, from, to, amount);
    }

    pub fn transfer_from(e: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();

        let allowance = Self::allowance(e.clone(), from.clone(), spender.clone());
        if allowance < amount {
            panic!("insufficient allowance");
        }

        e.storage().temporary().set(
            &DataKey::Allowance(from.clone(), spender),
            &(allowance - amount),
        );

        Self::do_transfer(&e, from, to, amount);
    }

    pub fn approve(e: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {
        from.require_auth();

        let key = DataKey::Allowance(from.clone(), spender.clone());
        e.storage().temporary().set(&key, &amount);
        e.storage()
            .temporary()
            .extend_ttl(&key, expiration_ledger, expiration_ledger);

        ApproveEvent {
            from,
            spender,
            amount,
        }
        .publish(&e);
    }

    pub fn balance(e: Env, id: Address) -> i128 {
        get_balance(&e, &id)
    }

    pub fn allowance(e: Env, from: Address, spender: Address) -> i128 {
        e.storage()
            .temporary()
            .get(&DataKey::Allowance(from, spender))
            .unwrap_or(0)
    }

    pub fn decimals(e: Env) -> u32 {
        let meta: TokenMetadata = e.storage().instance().get(&DataKey::Metadata).unwrap();
        meta.decimal
    }

    pub fn name(e: Env) -> String {
        let meta: TokenMetadata = e.storage().instance().get(&DataKey::Metadata).unwrap();
        meta.name
    }

    pub fn symbol(e: Env) -> String {
        let meta: TokenMetadata = e.storage().instance().get(&DataKey::Metadata).unwrap();
        meta.symbol
    }

    fn do_transfer(e: &Env, from: Address, to: Address, amount: i128) {
        let balance_from = get_balance(e, &from);
        if balance_from < amount {
            panic!("insufficient balance");
        }

        let balance_to = get_balance(e, &to);
        e.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(balance_from - amount));
        e.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &(balance_to + amount));

        TransferEvent { from, to, amount }.publish(e);
    }
}

fn get_balance(e: &Env, id: &Address) -> i128 {
    e.storage()
        .persistent()
        .get(&DataKey::Balance(id.clone()))
        .unwrap_or(0)
}

mod test;
