describe('Authentication Validation Tests', () => {

    const validateEmail = (email) => {
        return email && email.includes('@') && email.length > 5 ? true : "";
    };

    const validatePassword = (password) => {
        return password && password.length >= 6 ? true : "";
    };

    test('Valid email passes', () => {
        expect(validateEmail('test@example.com')).toBe(true);
    });

    test('Invalid email fails', () => {
        expect(validateEmail('testexample.com')).toBe("");
    });

    test('Valid password passes', () => {
        expect(validatePassword('password123')).toBe(true);
    });

    test('Invalid password fails', () => {
        expect(validatePassword('123')).toBe("");
    });
});