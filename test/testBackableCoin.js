var BackableTokenMock = artifacts.require("./BackableTokenMock.sol");
var ContentPool = artifacts.require("./ContentPool.sol");
var MemberRegistry = artifacts.require("./MemberRegistry.sol");

//var Web3 = require('web3');
//var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const BigNumber = web3.BigNumber;

const toAscii = require('../src/utils/helpers')


require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('BackableToken', function(accounts) {

	let contentPool;
	let memberRegistry;
	before(async function() {
		contentPool = await ContentPool.new();
		memberRegistry = await MemberRegistry.new();
	})

	beforeEach(async function() {
		await contentPool.clear();
	})

	it("should return the correct totalSupply after construction", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 100, accounts[1], 100);
		let totalSupply = await token.totalSupply();

		assert.equal(totalSupply, 200)
	})

	it("should not allow sending to yourself", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 900); 

		// can't back yourself, fool
		await token.back(accounts[0], 700, {from: accounts[0]}).should.be.rejectedWith('revert');
	})

	it("user can back a post", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 900);
		await token.register.sendTransaction('enodios', {from: accounts[1]});
		// user 1 posts a link
		await token.postLink("reddit.com", {from : accounts[1]});

		// link should have 0 backing
		// TODO should automatically have the poster's backing too

		// user 0 backs the link with 1000
		await token.backPost(0, 1000, {from: accounts[0]});

		// // link should now have 1000 backing
		const backing = await token.totalPostBacking(0);
		backing.toNumber().should.be.equal(1000);

		// // user 0 should have 0 available backing
		const tokensRemaining0 = await token.availableToBackPosts(accounts[0]);
		tokensRemaining0.toNumber().should.be.equal(0);

		// // user 1 should have 900 available backing
		const tokensRemaining1 = await token.availableToBackPosts(accounts[1]);
		tokensRemaining1.toNumber().should.be.equal(1900);
    })
    
    it("user cannot over-back a post", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 900);
        await token.register.sendTransaction('enodios', {from: accounts[1]});
                
		// user 1 posts a link
		await token.postLink("reddit.com", {from : accounts[1]});

		// user 0 backs the link with 1000
        await token.backPost(0, 1000, {from: accounts[0]});
        
		// user 0 backs the link with 1 more, which is too many
		await token.backPost(0, 1, {from: accounts[0]}).should.be.rejectedWith('revert');
	})

	it("should not allow double backing", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 900); 

		await token.back(accounts[1], 700, {from: accounts[0]});

		await token.back(accounts[1], 700, {from: accounts[0]}).should.be.rejectedWith('revert');
	})

	it("should not allow sending tokens when they are already backed", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 900); 

		await token.back(accounts[1], 700, {from: accounts[0]});

		await token.transfer(accounts[1], 400, {from: accounts[0]}).should.be.rejectedWith('revert');
	})

	it("should allow sending tokens after unbacking", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 0); 

		await token.back(accounts[1], 700, {from: accounts[0]});
		await token.unback(accounts[1], 700, {from: accounts[0]});

		await token.transfer(accounts[1], 400, {from: accounts[0]});

		let firstAccountBalance = await token.balanceOf(accounts[0]);

		assert.equal(firstAccountBalance, 1000 - 400);
	})

	it("should allow a user to register a name and receive token", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 0, accounts[1], 0); 

		await token.register('enodios');

		let [username, address, balance, backing, availableToBack] = await token.getMemberByAddress(accounts[0]);

		assert.equal(toAscii(username), 'enodios');
		assert.equal(balance.toNumber(), 1000);
	});

	it("should allow user to post Link", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 0);

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[1]});

		let [index, owner, link, backing] = await token.getLinkByIndex(0);
		assert.equal("reddit.com", toAscii(link));
		assert.equal(accounts[1], owner);

	})

	it("should get link count", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 0);

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[1]});

		let count = await token.getLinkCount();
		assert.equal(1, count);

	})

	it("should fail to get link and owner of out of bound index at border", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 0);

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[0]});
		await token.postLink("google.com", {from : accounts[1]});
		await token.getLinkByIndex(2).should.be.rejectedWith('revert');
	})

	it("publish single post above threshold", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 2000);

		await token.postLink("reddit2.com", {from : accounts[0]});
		await token.postLink("reddit.com", {from : accounts[0]});
		await token.backPost(1, 10, {from : accounts[1]});
		result = await token.publish();

		version = await token.currentVersion();
		// we need this because a block could have 0 or 2+ items
		blockLength = await token.getVersionLength(version);

		// what is this item?
		const [poster, content] = await token.getPublishedItem(version,blockLength-1);
		// console.log("content: " + toAscii(content))

		assert.equal(toAscii(content), 'reddit.com');
		// assert.equal( result.toNumber(), 1 );
	})

	it("should clear incoming post votes", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 2000);

		await token.postLink("reddit.com", {from : accounts[0]});
		await token.backPost(0, 10, {from : accounts[1]});
		
		const votesBefore = await token.totalPostBacking(0);
		assert.equal(votesBefore.toNumber(), 10);

		await token.clear();

		const votesAfter = await token.totalPostBacking(0);
		assert.equal(votesAfter.toNumber(), 0);
	})

	it("should clear outgoing post votes", async function() {
		let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 10);

		await token.postLink("reddit.com", {from : accounts[0]});
		await token.backPost(0, 10, {from : accounts[1]});
		
		const votesAvailableBefore = await token.availableToBackPosts(accounts[1]);
		assert.equal(votesAvailableBefore.toNumber(), 0);
		
		await token.clear();

		const votesAvailableAfter = await token.availableToBackPosts(accounts[1]);
		assert.equal(votesAvailableAfter.toNumber(), 10);
	})

	// it("publish single post below threshold", async function() {
	// 	let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 2000);

	// 	await token.postLink("reddit.com", {from : accounts[0]});
	// 	await token.backPost(0, 9, {from : accounts[1]});
	// 	await token.publish();

	// 	result = await token.getPublishedContent();

	// 	assert.equal( result.toNumber(), 0 );
	// })

	// it("publish twice with single post", async function() {
	// 	let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 2000);

	// 	await token.postLink("reddit.com", {from : accounts[0]});
	// 	await token.backPost(0, 1001, {from : accounts[1]});
	// 	await token.publish();
	// 	await token.publish();

	// 	const count = await token.getPublishedContent()
	// 	assert.equal( count, 1 );
	// })

})