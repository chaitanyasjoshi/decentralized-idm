// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;

contract IdentityManager {

  struct User {
    string encryptionPublicKey;
    string entity;
  }

  struct Document {
    address issuer;
    string name;
    bytes data;
  }

  struct Template {
    address issuer;
    string name;
    string data;
  }

  struct Request {
    address requestor;
    address owner;
    string docName;
    bytes properties;
    string status;
  }

  mapping(address => User) userDb;
  mapping(string => address) usernameDb;
  mapping(address => Document[]) identities;
  mapping(address => Request[]) ownerRequests;
  mapping(address => Request[]) verifierRequests;
  Template[] templates;

  event UserAuthenticated (
    string status,
    string message,
    address user
  );

  event DocumentIssued (
    address owner,
    address issuer
  );

  event TemplateCreated (
    address issuer,
    string name
  );

  event RequestGenerated (
    address verifier,
    address owner
  );

  event RequestStatusUpdated (
    address verifier,
    address owner
  );

  function login(string memory _entity, string memory _username) public returns(bool) {
    require(bytes(_entity).length > 0);
    require(bytes(_username).length > 0);

    if (!compareStringsbyBytes(userDb[msg.sender].encryptionPublicKey, '') && compareStringsbyBytes(userDb[msg.sender].entity, _entity) && usernameDb[_username] == msg.sender) {
      // Success
      emit UserAuthenticated('Success', 'Login successful', msg.sender);
      return true;
    } else if (!compareStringsbyBytes(userDb[msg.sender].encryptionPublicKey, '') && compareStringsbyBytes(userDb[msg.sender].entity, _entity) && usernameDb[_username] != msg.sender) {
      // Incorrect username
      emit UserAuthenticated('Failure', 'Incorrect username', msg.sender);
      return false;
    } else {
      // Failure
      emit UserAuthenticated('Failure', 'User does not exist', msg.sender);
      return false;
    }
  }

  function register(string memory _encryptionPublicKey, string memory _entity, string memory _username) public {
    require(bytes(_encryptionPublicKey).length > 0);
    require(bytes(_entity).length > 0);
    require(bytes(_username).length > 0);

    if (compareStringsbyBytes(userDb[msg.sender].encryptionPublicKey, '') && compareStringsbyBytes(userDb[msg.sender].entity, '') && usernameDb[_username] == address(0)) {
      // Success
      userDb[msg.sender] = User(_encryptionPublicKey, _entity);
      usernameDb[_username] = msg.sender;
      emit UserAuthenticated('Success', 'Registration successful', msg.sender);
    } else if (compareStringsbyBytes(userDb[msg.sender].encryptionPublicKey, '') && compareStringsbyBytes(userDb[msg.sender].entity, '') && usernameDb[_username] != address(0)) {
      // Incorrect username
      emit UserAuthenticated('Failure', 'Please use another username', msg.sender);
      revert();
    } else if (compareStringsbyBytes(userDb[msg.sender].encryptionPublicKey, _encryptionPublicKey) && compareStringsbyBytes(userDb[msg.sender].entity, _entity) && usernameDb[_username] == msg.sender) {
      // Failure
      emit UserAuthenticated('Failure', 'User already registered', msg.sender);
      revert();
    } else {
      // Failure
      emit UserAuthenticated('Failure', append('User already registered as ', userDb[msg.sender].entity), msg.sender);
      revert();
    }
  }

  function issueDocument(string memory _name, bytes memory _data, address _owner) public {
    require(bytes(_name).length > 0);
    require(bytes(_data).length > 0);
    require(_owner != msg.sender, 'You cannot issue document for yourself');

    identities[_owner].push(Document(msg.sender, _name, _data));
    emit DocumentIssued(_owner, msg.sender);
  }

  function createTemplate(string memory _name, string memory _data) public {
    for (uint256 index = 0; index < templates.length; index++) {
      if (compareStringsbyBytes(templates[index].name, _name)) {
        revert('Template already exists');
      }
    }
    templates.push(Template(msg.sender, _name, _data));
    emit TemplateCreated(msg.sender, _name);
  }

  function getTemplates() view public returns(address[] memory, string[] memory, string[] memory) {
    uint _templateCount = templates.length;
    address[] memory _issuer = new address[](_templateCount);
    string[] memory _name = new string[](_templateCount);
    string[] memory _data = new string[](_templateCount);

    for (uint256 index = 0; index < _templateCount; index++) {
      Template memory _tempCopy = templates[index];
      _issuer[index] = _tempCopy.issuer;
      _name[index] = _tempCopy.name;
      _data[index] = _tempCopy.data;
    }

    return (_issuer, _name, _data);
  }

  function getDocuments() view public returns(address[] memory, string[] memory, bytes[] memory) {
    uint _documentCount = identities[msg.sender].length;
    address[] memory _issuer = new address[](_documentCount);
    string[] memory _name = new string[](_documentCount);
    bytes[] memory _data = new bytes[](_documentCount);

    for (uint256 index = 0; index < _documentCount; index++) {
      Document memory _docCopy = identities[msg.sender][index];
      _issuer[index] = _docCopy.issuer;
      _name[index] = _docCopy.name;
      _data[index] = _docCopy.data;
    }

    return (_issuer, _name, _data);
  }

  function getDocument(string memory _name) view public returns(address, string memory, bytes memory) {
    for (uint256 index = 0; index < identities[msg.sender].length; index++) {
      Document memory _docCopy = identities[msg.sender][index];
      if (compareStringsbyBytes(_name, _docCopy.name)) {
        return (_docCopy.issuer, _docCopy.name, _docCopy.data);
      } else {
        revert('User does not have specified document');
      }
    }
  }

  function getDocumentCount() view public returns(uint) {
    return identities[msg.sender].length;
  }

  function requestVerification(address _owner, string memory _docName, bytes memory _properties) public {
    require(msg.sender != _owner, 'Cannot request verification for yourself');
    require(bytes(_docName).length > 0);
    require(bytes(_properties).length > 0);

    for (uint256 index = 0; index < verifierRequests[msg.sender].length; index++) {
      if (compareStringsbyBytes(verifierRequests[msg.sender][index].docName, _docName) && verifierRequests[msg.sender][index].owner == _owner) {
        revert('You have already requested this document');
      }
    }

    ownerRequests[_owner].push(Request(msg.sender, _owner, _docName, _properties, 'Requested'));
    verifierRequests[msg.sender].push(Request(msg.sender, _owner, _docName, _properties, 'Requested'));
    emit RequestGenerated(msg.sender, _owner);
  }

  function updateRequestStatus(address _verifier, string memory _docName, string memory _newStatus, bytes memory _properties) public {
    require(_verifier != msg.sender, 'Verifier cannot update request status');
    require(bytes(_docName).length > 0);

    for (uint256 index = 0; index < ownerRequests[msg.sender].length; index++) {
      if (compareStringsbyBytes(ownerRequests[msg.sender][index].docName, _docName) && ownerRequests[msg.sender][index].requestor == _verifier) {
        ownerRequests[msg.sender][index].status = _newStatus;
        break;
      }
    }

    for (uint256 index = 0; index < verifierRequests[_verifier].length; index++) {
      if (compareStringsbyBytes(verifierRequests[_verifier][index].docName, _docName) && verifierRequests[_verifier][index].owner == msg.sender) {
        verifierRequests[_verifier][index] = Request(_verifier, msg.sender, _docName, _properties, _newStatus);
        break;
      }
    }

    emit RequestStatusUpdated(_verifier, msg.sender);
  }

  function getOwnerRequests() view public returns(address[] memory, string[] memory, bytes[] memory, string[] memory) {
    uint _reqCount = ownerRequests[msg.sender].length;
    address[] memory _requestor = new address[](_reqCount);
    string[] memory _docName = new string[](_reqCount);
    bytes[] memory _properties = new bytes[](_reqCount);
    string[] memory _status = new string[](_reqCount);

    for (uint256 index = 0; index < _reqCount; index++) {
      Request memory _reqCopy = ownerRequests[msg.sender][index];
      _requestor[index] = _reqCopy.requestor;
      _docName[index] = _reqCopy.docName;
      _properties[index] = _reqCopy.properties;
      _status[index] = _reqCopy.status;
    }

    return (_requestor, _docName, _properties, _status);
  }

  function getVerifierRequests() view public returns(address[] memory, string[] memory, bytes[] memory, string[] memory) {
    uint _reqCount = verifierRequests[msg.sender].length;
    address[] memory _owner = new address[](_reqCount);
    string[] memory _docName = new string[](_reqCount);
    bytes[] memory _properties = new bytes[](_reqCount);
    string[] memory _status = new string[](_reqCount);

    for (uint256 index = 0; index < _reqCount; index++) {
      Request memory _reqCopy = verifierRequests[msg.sender][index];
      _owner[index] = _reqCopy.owner;
      _docName[index] = _reqCopy.docName;
      _properties[index] = _reqCopy.properties;
      _status[index] = _reqCopy.status;
    }

    return (_owner, _docName, _properties, _status);
  }

  function getEncryptionPublicKey(address _owner) view public returns(string memory) {
    require(_owner != address(0));

    return userDb[_owner].encryptionPublicKey;
  }

  function compareStringsbyBytes(string memory s1, string memory s2) public pure returns(bool) {
    return keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
  }

  function append(string memory a, string memory b) internal pure returns (string memory) {
    return string(abi.encodePacked(a, b));
  }
}