#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
pub enum DataKey {
    Admin,
    Proposal(u64), // Maps proposal_id to bool
}

#[contract]
pub struct VotingContract;

#[contractimpl]
impl VotingContract {
    /// Initialize the contract with a central admin.
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Approve a payment proposal. Requires admin authorization.
    pub fn approve_payment(env: Env, admin: Address, proposal_id: u64) {
        // Advanced Authorization: Admin must authorize this call.
        admin.require_auth();

        // Verify the caller is the registered admin.
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Not initialized");
        if admin != stored_admin {
            panic!("Caller is not the admin");
        }

        // Mark proposal as approved
        env.storage().persistent().set(&DataKey::Proposal(proposal_id), &true);
        
        env.events().publish((symbol_short!("approved"), proposal_id), admin);
    }

    /// Query whether a payment proposal is approved.
    pub fn is_approved(env: Env, proposal_id: u64) -> bool {
        env.storage().persistent().get(&DataKey::Proposal(proposal_id)).unwrap_or(false)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_approve_payment() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register(VotingContract, ());
        let client = VotingContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        client.init(&admin);

        assert_eq!(client.is_approved(&123), false);

        client.approve_payment(&admin, &123);

        assert_eq!(client.is_approved(&123), true);
    }

    #[test]
    #[should_panic(expected = "Caller is not the admin")]
    fn test_unauthorized_approve() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register(VotingContract, ());
        let client = VotingContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let fake_admin = Address::generate(&env);
        
        client.init(&admin);
        client.approve_payment(&fake_admin, &123); // Panics
    }
}
