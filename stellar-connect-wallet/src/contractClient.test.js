import { isValidStellarAddress } from './contractClient';

describe('contractClient utilities', () => {
  // ─── Test: Stellar address validation ─────────────────────────────────────

  test('isValidStellarAddress correctly validates addresses', () => {
    // Valid Stellar public key (56 chars, starts with G, base32)
    const validAddress = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';
    expect(isValidStellarAddress(validAddress)).toBe(true);

    // Invalid: too short
    expect(isValidStellarAddress('GAAZI4TCR3TY5')).toBe(false);

    // Invalid: doesn't start with G
    expect(isValidStellarAddress('SAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7')).toBe(false);

    // Invalid: empty string
    expect(isValidStellarAddress('')).toBe(false);

    // Invalid: null
    expect(isValidStellarAddress(null)).toBe(false);

    // Invalid: undefined
    expect(isValidStellarAddress(undefined)).toBe(false);

    // Invalid: contains lowercase
    expect(isValidStellarAddress('gaazi4tcr3ty5ojhctjc2a4qsy6cjwjh5iajtgkin2er7lbnvkoccwn7')).toBe(false);

    // Invalid: wrong length (55 chars)
    expect(isValidStellarAddress('GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN')).toBe(false);
  });
});
