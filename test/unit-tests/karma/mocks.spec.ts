import { mockFriends } from '../../mocks/mocks';

describe('Mocks', () => {
    it('should be able to mock friends', () => {
        const friends = mockFriends();
        expect(friends.length).toBe(5);
    });
});
