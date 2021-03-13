const { assert } = require('chai');

const IdentityManager = artifacts.require('../contracts/IdentityManager.sol');

require('chai').use(require('chai-as-promised')).should();

contract('IdentityManager', ([issuer, owner, verifier]) => {
  let identityManager;

  before(async () => {
    identityManager = await IdentityManager.deployed();
  });

  describe('Deployment', async () => {
    it('Deploys successfully', async () => {
      const address = await identityManager.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });
  });

  describe('Identity issuer', async () => {
    let result;

    before(async () => {
      result = await identityManager.issueDocument(
        'Aadhar',
        'Document data',
        owner,
        { from: issuer }
      );
    });

    it('Issues document', async () => {
      // SUCCESS
      const event = result.logs[0].args;
      assert.equal(event.name, 'Aadhar', 'Document name is correct');
      assert.equal(event.data, 'Document data', 'Document data is correct');
      assert.equal(event.owner, owner, 'Owner is correct');
      assert.equal(event.issuer, issuer, 'Issuer is correct');

      // FAILURE: Post must have content
      await identityManager.issueDocument('', '', owner, { from: issuer })
        .should.be.rejected;
      await identityManager.issueDocument('Aadhar', 'Document data', owner, {
        from: owner,
      }).should.be.rejected;
    });

    it('Creates template', async () => {
      let response = await identityManager.createTemplate(
        'Aadhar',
        'Template data',
        {
          from: issuer,
        }
      );

      // SUCCESS;
      const event = response.logs[0].args;
      assert.equal(event.name, 'Aadhar', 'Template name is correct');
      assert.equal(event.data, 'Template data', 'Template data is correct');
      assert.equal(event.issuer, issuer, 'Issuer is correct');
    });
  });

  describe('Identity verifier', async () => {
    let result;

    before(async () => {
      result = await identityManager.getTemplates();
    });

    it('Retrives templates', async () => {
      const { 0: _issuer, 1: _name, 2: _data } = result;
      assert.equal(_issuer, issuer, 'Template issuer is correct');
      assert.equal(_name, 'Aadhar', 'Template name is correct');
      assert.equal(_data, 'Template data', 'Template data is correct');
    });

    it('Requests verification', async () => {
      let response = await identityManager.requestVerification(
        owner,
        'Aadhar',
        'Properties JSON',
        { from: verifier }
      );

      const event = response.logs[0].args;
      assert.equal(event.verifier, verifier, 'Verifier is correct');
      assert.equal(event.owner, owner, 'Document owner is correct');
      assert.equal(event.docName, 'Aadhar', 'Document name is correct');
      assert.equal(
        event.properties,
        'Properties JSON',
        'Requested properties are correct'
      );
      assert.equal(event.status, 'Requested', 'Request status is correct');
    });

    it('View verification requests', async () => {
      const result = await identityManager.getVerifierRequests({
        from: verifier,
      });
      const { 0: _owner, 1: _docName, 2: _properties, 3: _status } = result;
      assert.equal(_owner, owner, 'Document owner is correct');
      assert.equal(_docName, 'Aadhar', 'Document name is correct');
      assert.equal(
        _properties,
        'Properties JSON',
        'Requested properties are correct'
      );
      assert.equal(_status, 'Requested', 'Verification status is correct');
    });
  });

  describe('Identity owner', async () => {
    it('Retrives documents', async () => {
      const result = await identityManager.getDocument('Aadhar', {
        from: owner,
      });
      const { 0: _issuer, 1: _docName, 2: _data } = result;
      assert.equal(_issuer, issuer, 'Document issuer is correct');
      assert.equal(_docName, 'Aadhar', 'Document name is correct');
      assert.equal(_data, 'Document data', 'Document data is correct');
    });

    it('Retrives document count', async () => {
      let count = await identityManager.getDocumentCount({
        from: owner,
      });

      // SUCCESS
      assert.equal(count, 1, 'Document count is correct');

      // FAILURE
      await identityManager.getDocumentCount(owner, { from: verifier }).should
        .be.rejected;
    });

    it('View verification requests', async () => {
      const result = await identityManager.getOwnerRequests({ from: owner });
      const { 0: _requestor, 1: _docName, 2: _properties, 3: _status } = result;
      assert.equal(_requestor, verifier, 'Verification requestor is correct');
      assert.equal(_docName, 'Aadhar', 'Document name is correct');
      assert.equal(
        _properties,
        'Properties JSON',
        'Requested properties are correct'
      );
      assert.equal(_status, 'Requested', 'Verification status is correct');
    });

    it('Updates verification request status', async () => {
      let response = await identityManager.updateRequestStatus(
        verifier,
        'Aadhar',
        'Approved',
        'Document properties',
        { from: owner }
      );

      const event = response.logs[0].args;
      assert.equal(event.verifier, verifier, 'Verifier is correct');
      assert.equal(event.owner, owner, 'Document owner is correct');
      assert.equal(event.docName, 'Aadhar', 'Document name is correct');
      assert.equal(
        event.status,
        'Approved',
        'Verification request status is correct'
      );
    });
  });
});
