#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentRecord {
    pub id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub amount: i128, // Amount in stroops
    pub memo: String,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Counter,            // u64
    Payment(u64),       // PaymentRecord
    UserPayments(Address), // Vec<u64>
}

#[contract]
pub struct PaymentTracker;

#[contractimpl]
impl PaymentTracker {
    /// Records a payment on-chain. Sender must authorize the transaction.
    pub fn record_payment(
        env: Env,
        sender: Address,
        recipient: Address,
        amount: i128,
        memo: String,
    ) -> u64 {
        // Advanced Authorization: Ensure the sender signed the call
        sender.require_auth();

        // Business Logic Validation
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        if memo.len() > 100 {
            panic!("Memo too long");
        }

        let storage = env.storage().persistent();

        // Increment ID counter
        let mut id: u64 = storage.get(&DataKey::Counter).unwrap_or(0);
        id += 1;
        storage.set(&DataKey::Counter, &id);

        let timestamp = env.ledger().timestamp();

        // Create and store the record
        let record = PaymentRecord {
            id,
            sender: sender.clone(),
            recipient,
            amount,
            memo,
            timestamp,
        };
        storage.set(&DataKey::Payment(id), &record);

        // Update sender's index
        let mut user_payments: Vec<u64> = storage
            .get(&DataKey::UserPayments(sender.clone()))
            .unwrap_or(Vec::new(&env));
        user_payments.push_back(id);
        storage.set(&DataKey::UserPayments(sender.clone()), &user_payments);

        // Publish event for real-time tracking (Soroban standard)
        env.events().publish((symbol_short!("pay_rec"), id), sender);

        id
    }

    /// Returns the total number of payments recorded.
    pub fn get_payment_count(env: Env) -> u64 {
        env.storage().persistent().get(&DataKey::Counter).unwrap_or(0)
    }

    /// Fetches a specific payment record by its ID.
    pub fn get_payment(env: Env, id: u64) -> PaymentRecord {
        env.storage()
            .persistent()
            .get(&DataKey::Payment(id))
            .unwrap_or_else(|| panic!("Payment record not found"))
    }

    /// Returns all payment IDs associated with a specific address.
    pub fn get_payments_by_sender(env: Env, sender: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::UserPayments(sender))
            .unwrap_or(Vec::new(&env))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, String};

    #[test]
    fn test_record_payment_success() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(PaymentTracker, ());
        let client = PaymentTrackerClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        let id = client.record_payment(&sender, &recipient, &1000, &String::from_str(&env, "Test"));
        assert_eq!(id, 1);
    }

    #[test]
    #[should_panic(expected = "Amount must be positive")]
    fn test_invalid_amount_rejection() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(PaymentTracker, ());
        let client = PaymentTrackerClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        client.record_payment(&sender, &Address::generate(&env), &0, &String::from_str(&env, "Zero"));
    }

    #[test]
    #[should_panic(expected = "Memo too long")]
    fn test_memo_length_rejection() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(PaymentTracker, ());
        let client = PaymentTrackerClient::new(&env, &contract_id);

        let long_memo = "This memo is definitely going to be way longer than the one hundred character limit we just imposed in the contract code to demonstrate validation functionality.";
        client.record_payment(&Address::generate(&env), &Address::generate(&env), &10, &String::from_str(&env, long_memo));
    }

    #[test]
    fn test_initial_counter_zero() {
        let env = Env::default();
        let contract_id = env.register(PaymentTracker, ());
        let client = PaymentTrackerClient::new(&env, &contract_id);
        assert_eq!(client.get_payment_count(), 0);
    }

    #[test]
    fn test_counter_increment_on_multiple_records() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(PaymentTracker, ());
        let client = PaymentTrackerClient::new(&env, &contract_id);

        client.record_payment(&Address::generate(&env), &Address::generate(&env), &10, &String::from_str(&env, "a"));
        client.record_payment(&Address::generate(&env), &Address::generate(&env), &20, &String::from_str(&env, "b"));
        assert_eq!(client.get_payment_count(), 2);
    }

    #[test]
    fn test_user_indexing_isolation() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(PaymentTracker, ());
        let client = PaymentTrackerClient::new(&env, &contract_id);

        let u1 = Address::generate(&env);
        let u2 = Address::generate(&env);

        client.record_payment(&u1, &Address::generate(&env), &10, &String::from_str(&env, "u1-p1"));
        client.record_payment(&u2, &Address::generate(&env), &10, &String::from_str(&env, "u2-p1"));

        assert_eq!(client.get_payments_by_sender(&u1).len(), 1);
        assert_eq!(client.get_payments_by_sender(&u2).len(), 1);
    }

    #[test]
    fn test_get_payment_full_detail() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(PaymentTracker, ());
        let client = PaymentTrackerClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        let amount = 500i128;
        let memo = String::from_str(&env, "FullDetail");

        let id = client.record_payment(&sender, &recipient, &amount, &memo);
        let record = client.get_payment(&id);

        assert_eq!(record.sender, sender);
        assert_eq!(record.recipient, recipient);
        assert_eq!(record.amount, amount);
        assert_eq!(record.memo, memo);
    }

    #[test]
    #[should_panic(expected = "Payment record not found")]
    fn test_get_payment_non_existent() {
        let env = Env::default();
        let contract_id = env.register(PaymentTracker, ());
        let client = PaymentTrackerClient::new(&env, &contract_id);
        client.get_payment(&404);
    }

    #[test]
    fn test_multiple_payments_single_user() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(PaymentTracker, ());
        let client = PaymentTrackerClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        client.record_payment(&sender, &Address::generate(&env), &10, &String::from_str(&env, "p1"));
        client.record_payment(&sender, &Address::generate(&env), &20, &String::from_str(&env, "p2"));
        client.record_payment(&sender, &Address::generate(&env), &30, &String::from_str(&env, "p3"));

        let ids = client.get_payments_by_sender(&sender);
        assert_eq!(ids.len(), 3);
        assert_eq!(ids.get(0).unwrap(), 1);
        assert_eq!(ids.get(2).unwrap(), 3);
    }

    #[test]
    fn test_large_amount_handling() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(PaymentTracker, ());
        let client = PaymentTrackerClient::new(&env, &contract_id);

        let max_val = 1_000_000_000_000_000_000i128; // Large Stroops
        let id = client.record_payment(&Address::generate(&env), &Address::generate(&env), &max_val, &String::from_str(&env, "whale"));
        assert_eq!(client.get_payment(&id).amount, max_val);
    }
}
