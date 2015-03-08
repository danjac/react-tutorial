jest.dontMock('../UserStore');

describe('UserStore', function() {

    it('sets user to null on logout', function() {
        console.log("OK");
        var UserStore = require('../UserStore');
        UserStore.logout();
        expect(UserStore.getDefaultData() === null);
    });
});



