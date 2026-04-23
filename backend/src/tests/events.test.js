describe('Events Validation Tests', () => {

    const validateEventTitle = (title) => {
        return title && title.length >= 3 ? true : "";
    };

    test('Valid event title passes', () => {
        expect(validateEventTitle('Yoga Class')).toBe(true);
    });

    test('Invalid event title fails', () => {
        expect(validateEventTitle('Yo')).toBe("");
    });

    test('Empty title fails', () => {
        expect(validateEventTitle('')).toBe("");
    });
});