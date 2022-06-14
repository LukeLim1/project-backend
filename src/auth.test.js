import { authLoginV1, authRegisterV1 } from './auth';
import { clearV1 } from './other';

describe('authRegisterV1', () => {
    let regTest;

    beforeEach(() => {
        clearV1();    
        regTest = authRegisterV1('zachary-chan@gmail.com', 'z5312386', 'Zachary', 'Chan');  
    });
    
    test('simple lower case concatenation of new handle not taken yet', () => {
        expect(regTest).toBe('zacharychan')
    });
    test('handle has already been taken by one other person', () => {
        expect(regTest).toBe('zacharychan0');
    });
    test('handle has already been taken by 5 other people', () => {
        expect(regTest).toBe('zacharychan4');
    });
    test('handle longer than 20 characters with free handle', () => {
        expect(regTest).toBe('christopherconstanti');
    });
    test('handle longer than 20 characters but handle already taken by 1 person', () => {
        expect(regTest).toBe('christopherconstanti0');
    });
    test('handle longer than 20 characters but handle already taken by 5 other people', () => {
        expect(regTest).toBe('christopherconstanti4');
    });
});

describe('authLoginV1', () => {
    test('loginUserId matches a userID that has been registered', () => {
        clearV1();
        const regTest = authRegisterV1('zachary-chan@gmail.com', 'z5312386', 'zachary', 'chan');
        const loginTest = authLoginV1('zachary-chan@gmail.com', 'z5312386');
        expect(loginTest).toBe(regTest); 
    });
    
    let loginFail;
    beforeEach(() => {
        clearV1();    
        loginFail = authLoginV1('failing-test@gmail.com', 'shouldntWork'); 
    });
    
    test("Returns error object when loginUserId doesnt match a registered userId", () => {
        expect(loginFail).toBe({error: 'error'});
    });
    test("Returns error object when password is incorrect for valid email", () => {   
        expect(loginFail).toBe({error: 'error'});
    });
    test("Returns error object when password is correct for an invalid email", () => {
        expect(loginFail).toBe({error: 'error'});

    });
});    
