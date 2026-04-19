#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, token};

// Import the Voting contract client interface for Cross-Contract calls
use voting::VotingContractClient;

#[contracttype]
pub enum DataKey {
    Admin,
    VotingContractId,
}

#[contract]
pub struct TreasuryContract;

#[contractimpl]
impl TreasuryContract {
    /// Initialize the Treasury with an admin and the trusted Voting contract address.
    pub fn init(env: Env, admin: Address, voting_contract_id: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::VotingContractId, &voting_contract_id);
    }

    /// Execute a payment. Requires admin auth. 
    /// Verifies proposal approval via Cross-Contract call.
    /// Uses SAC Token functionality to transfer assets.
    pub fn execute_payment(
        env: Env,
        admin: Address,
        token_id: Address,
        recipient: Address,
        amount: i128,
        proposal_id: u64,
    ) {
        // Advanced Authorization: Admin must authorize this executed payment
        admin.require_auth();

        // Verify the caller is the registered admin
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Not initialized");
        if admin != stored_admin {
            panic!("Caller is not the admin");
        }

        // ─── CROSS-CONTRACT CALL: Verify Voting Status ──────────────────────
        let voting_id: Address = env.storage().instance().get(&DataKey::VotingContractId).expect("Voting contract not set");
        let voting_client = VotingContractClient::new(&env, &voting_id);
        
        let is_approved = voting_client.is_approved(&proposal_id);
        if !is_approved {
            panic!("Payment proposal has not been approved");
        }

        // ─── SAC INTEGRATION: Transfer Tokens ───────────────────────────────
        let token_client = token::Client::new(&env, &token_id);
        
        // Transfer from the Treasury's own balance to the recipient
        token_client.transfer(&env.current_contract_address(), &recipient, &amount);

        // Emit execution event
        env.events().publish((symbol_short!("executed"), proposal_id), (recipient, amount));
    }
}

// ── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};
    
    // Import token creation utilities
    use soroban_sdk::token::{StellarAssetClient, Client as TokenClient};

    fn create_token_contract<'a>(env: &Env, admin: &Address) -> (Address, TokenClient<'a>, StellarAssetClient<'a>) {
        let contract = env.register_stellar_asset_contract_v2(admin.clone());
        let contract_id = contract.address();
        (
            contract_id.clone(),
            TokenClient::new(env, &contract_id),
            StellarAssetClient::new(env, &contract_id),
        )
    }

    #[test]
    fn test_cross_contract_sac_payment() {
        let env = Env::default();
        env.mock_all_auths();

        // 1. Setup Voting Contract
        let voting_contract_id = env.register(voting::VotingContract, ());
        let voting_client = VotingContractClient::new(&env, &voting_contract_id);
        let voting_admin = Address::generate(&env);
        voting_client.init(&voting_admin);

        // 2. Setup Treasury Contract
        let treasury_contract_id = env.register(TreasuryContract, ());
        let treasury_client = TreasuryContractClient::new(&env, &treasury_contract_id);
        let treasury_admin = Address::generate(&env);
        treasury_client.init(&treasury_admin, &voting_contract_id);

        // 3. Setup Mock Token (SAC)
        let token_admin = Address::generate(&env);
        let (token_id, token_client, sac_client) = create_token_contract(&env, &token_admin);
        
        // Mint tokens to the Treasury
        sac_client.mint(&treasury_contract_id, &1000);
        assert_eq!(token_client.balance(&treasury_contract_id), 1000);

        // 4. Execution Workflow
        let recipient = Address::generate(&env);
        let proposal_id = 42u64;

        // Try executing without approval -> Should panic
        // We catch panics in tests using try_ function variants when mock_all_auths is disabled, 
        // or just by relying on a separate should_panic test.
        
        // Approve proposal via Voting Contract (Cross-Contract Target)
        voting_client.approve_payment(&voting_admin, &proposal_id);

        // Execute payment via Treasury Contract (SAC Integration)
        treasury_client.execute_payment(&treasury_admin, &token_id, &recipient, &500, &proposal_id);

        // Verify SAC Transfer
        assert_eq!(token_client.balance(&treasury_contract_id), 500);
        assert_eq!(token_client.balance(&recipient), 500);
    }

    #[test]
    #[should_panic(expected = "Payment proposal has not been approved")]
    fn test_unapproved_payment_fails() {
        let env = Env::default();
        env.mock_all_auths();

        // Setup
        let voting_contract_id = env.register(voting::VotingContract, ());
        let voting_client = VotingContractClient::new(&env, &voting_contract_id);
        let voting_admin = Address::generate(&env);
        voting_client.init(&voting_admin);

        let treasury_contract_id = env.register(TreasuryContract, ());
        let treasury_client = TreasuryContractClient::new(&env, &treasury_contract_id);
        let treasury_admin = Address::generate(&env);
        treasury_client.init(&treasury_admin, &voting_contract_id);

        let token_admin = Address::generate(&env);
        let (token_id, _, sac_client) = create_token_contract(&env, &token_admin);
        sac_client.mint(&treasury_contract_id, &1000);

        let recipient = Address::generate(&env);
        let proposal_id = 99u64;

        // Execute WITHOUT approval
        treasury_client.execute_payment(&treasury_admin, &token_id, &recipient, &500, &proposal_id);
    }
}
