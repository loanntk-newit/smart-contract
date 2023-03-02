// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Utilities.sol";
import "./Segments.sol";
import "./IERC4906.sol";

contract CombineNumber is ERC721A, Ownable, IERC4906 {
    event CountdownExtended(uint256 _finalBlock);

    uint256 public price = 0;
    bool public isCombinable = false;
    uint256 public finalMintingBlock;
    string public luckyNumber;

    mapping(uint256 => string) newValues;
    mapping(uint256 => uint256) baseColors;

    constructor() ERC721A("COMBINE-NUMBER-TEST", "CBNT") {}

    function mint(uint256 quantity) public payable {
        require(msg.value >= quantity * price, "not enough eth");
        handleMint(msg.sender, quantity);
    }

    function handleMint(address recipient, uint256 quantity) internal {
        uint256 supply = _totalMinted();
        if (supply >= 1000) {
            require(
                utils.secondsRemaining(finalMintingBlock) > 0,
                "mint is closed"
            );
            if (supply < 5000 && (supply + quantity) >= 5000) {
                finalMintingBlock = block.timestamp + 24 hours;
                emit CountdownExtended(finalMintingBlock);
            }
        } else if (supply + quantity >= 1000) {
            finalMintingBlock = block.timestamp + 24 hours;
            emit CountdownExtended(finalMintingBlock);
        }
        _mint(recipient, quantity);
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
        if (
            !utils.compare(luckyNumber, "") &&
            utils.compare(luckyNumber, newValue)
        ) {
            revert(
                string.concat(
                    "can't combine because lucky number is ",
                    luckyNumber
                )
            );
        }
        for (uint256 i = 1; i < tokens.length; i++) {
            _burn(tokens[i]);
            newValues[tokens[i]] = "";
            baseColors[tokens[i]] = 0;
            emit MetadataUpdate(tokens[i]);
        }

        newValues[tokens[0]] = newValue;
        baseColors[tokens[0]] = utils.random(tokens[0], 1, 4);
        emit MetadataUpdate(tokens[0]);
    }

    function getValue(uint256 tokenId) public view returns (string memory) {
        if (!_exists(tokenId)) {
            return "";
        } else if (!utils.compare(newValues[tokenId], "")) {
            return newValues[tokenId];
        } else {
            return utils.initValue(tokenId);
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

        if (!_exists(tokenId)) {
            value = "";
            burned = true;
        } else if (!utils.compare(newValues[tokenId], "")) {
            value = newValues[tokenId];
            burned = false;
        } else {
            value = utils.initValue(tokenId);
            burned = false;
        }

        return
            segments.getMetadata(tokenId, value, baseColors[tokenId], burned);
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    function getSecondsRemaining() public view returns (uint256) {
        return utils.secondsRemaining(finalMintingBlock);
    }

    function mintCount() public view returns (uint256) {
        return _totalMinted();
    }

    function toggleCombinable() public onlyOwner {
        isCombinable = !isCombinable;
    }

    function withdraw() external onlyOwner {
        require(payable(msg.sender).send(address(this).balance));
    }

    function randomLuckyNumber() public onlyOwner {
        luckyNumber = utils.randomString(block.timestamp, 4);
    }

    function fixedLuckyNumber() public onlyOwner {
        luckyNumber = "0123";
    }
}
