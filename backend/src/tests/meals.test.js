describe('Meals Validation Tests', () => {

    const validateMealName = (name) => {
        return name && name.length >= 3 ? true : "";
    };

    const validatePortions = (portions) => {
        return portions >= 1 && portions <= 20 ? true : false;
    };

    test('Valid meal name passes', () => {
        expect(validateMealName('Chicken Biryani')).toBe(true);
    });

    test('Invalid meal name fails', () => {
        expect(validateMealName('')).toBe("");
    });

    test('Valid portions passes', () => {
        expect(validatePortions(4)).toBe(true);
    });

    test('Invalid portions (0) fails', () => {
        expect(validatePortions(0)).toBe(false);
    });

    test('Invalid portions (too high) fails', () => {
        expect(validatePortions(30)).toBe(false);
    });
});