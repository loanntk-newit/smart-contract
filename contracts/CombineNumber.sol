// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/ERC721A.sol";
import "./Utilities.sol";
import "./Segments.sol";

interface IERC4906 is IERC721A {
    event MetadataUpdate(uint256 _tokenId);
}

contract CombineNumber is ERC721A, Ownable, IERC4906 {
    uint256 public price = 0;
    bool public isCombinable = false;

    mapping(uint256 => string) newValues;
    mapping(uint256 => uint256) baseColors;

    constructor() ERC721A("COMBINE-NUMBER-TEST", "CBNT") {}

    function mint(uint256 quantity) public payable {
        require(msg.value >= quantity * price, "not enough eth");
        _mint(msg.sender, quantity);
    }

    function combine(uint256[] memory tokens) public {
        require(isCombinable, "combining not active");
        string memory newValue;
        for (uint256 i = 0; i < tokens.length; i++) {
            require(ownerOf(tokens[i]) == msg.sender, "must own all tokens");
            newValue = string.concat(newValue, getValue(tokens[i]));
        }
        if (bytes(newValue).length > 4) {
            revert("value no more than 4 characters");
        }
        
        for (uint256 i = 1; i < tokens.length; i++) {
            _burn(tokens[i]);
            newValues[tokens[i]] = "";
            baseColors[tokens[i]] = 0;
            emit MetadataUpdate(tokens[i]);
        }

        newValues[tokens[0]] = newValue;
        baseColors[tokens[0]] = utils.randomRange(tokens[0], 1, 4);
        emit MetadataUpdate(tokens[0]);
    }

    function getValue(uint256 tokenId) public view returns (string memory) {
        if (!_exists(tokenId)) {
            return "";
        } else if (!utils.compare(newValues[tokenId], "")) {
            return newValues[tokenId];
        } else {
            return utils.randomString(tokenId, 1);
        }
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721A, IERC721A)
        returns (string memory)
    {
        bool burned;
        string memory value;

        if (utils.compare(newValues[tokenId], "") && !_exists(tokenId)) {
            value = "";
            burned = true;
        } else if (!utils.compare(newValues[tokenId], "")) {
            value = newValues[tokenId];
            burned = false;
        } else {
            value = utils.randomString(tokenId, 1);
            burned = false;
        }

        return
            segments.getMetadata(tokenId, value, baseColors[tokenId], burned);
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    function toggleCombinable() public onlyOwner {
        isCombinable = !isCombinable;
    }

    function withdraw() external onlyOwner {
        require(payable(msg.sender).send(address(this).balance));
    }
}
