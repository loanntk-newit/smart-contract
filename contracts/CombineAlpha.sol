// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "erc721a/contracts/ERC721A.sol";
import "./Utilities.sol";

interface IERC4906 is IERC721A {
    event MetadataUpdate(uint256 _tokenId);
}

contract CombineAlphabet is ERC721A, Ownable, IERC4906 {
    event CountdownExtended(uint256 _finalBlock);

    uint256 public price = 0;
    uint256 public currentPhase = 0;
    uint256 public mintDuration = 1 minutes;
    uint256 public mintPhaseDuration = 2 minutes;
    uint256 public phaseEndTime;
    uint256 public currentPhaseStart = block.timestamp;
    string public keyStr;
    string[] public winningWallets;
    bool public isCombinable = false;

    mapping(uint256 => mapping(uint256 => string)) newValues;
    mapping(uint256 => uint256) baseColors;

    constructor() ERC721A("COMBINE-ALPHABET-TEST", "CAT") {}

    function mint(uint256 quantity) public payable {
        require(msg.value >= quantity * price, "not enough eth");
        handleMint(msg.sender, quantity);
    }

    function handleMint(address recipient, uint256 quantity) internal {
        require(currentPhase > 0, "Mint is closed");
        startNextPhase();
        require(
            utils.secondsRemaining(phaseEndTime) > 0,
            "Minting for this phase has ended"
        );
        for (uint256 i = mintCount() + 1; i <= quantity + mintCount(); ++i) {
            newValues[0][i] = utils.initValue(i, currentPhase);
        }

        _mint(recipient, quantity);
    }

    function combine(uint256[] memory tokens, uint256 _phase) public {
        require(isCombinable, "combining not active");
        require(_phase == currentPhase, "let's combine the right phase");
        string memory newValue = "";
        for (uint256 i = 0; i < tokens.length; i++) {
            require(ownerOf(tokens[i]) == msg.sender, "must own all tokens");
            newValue = string.concat(newValue, getValue(tokens[i]));
        }
        if (bytes(newValue).length > 4) {
            revert("value no more than 4 characters");
        }

        for (uint256 i = 1; i < tokens.length; i++) {
            _burn(tokens[i]);
            newValues[_phase][tokens[i]] = "";
            newValues[0][tokens[0]] = newValue;
            baseColors[tokens[i]] = 0;
            emit MetadataUpdate(tokens[i]);
        }
        newValues[_phase][tokens[0]] = newValue;
        newValues[0][tokens[0]] = newValue;
        baseColors[tokens[0]] = utils.randomRange(tokens[0], 1, 4);
        emit MetadataUpdate(tokens[0]);
    }

    function getValue(uint256 tokenId) public view returns (string memory) {
        if (!_exists(tokenId)) {
            return "";
        } else if (!utils.compare(newValues[0][tokenId], "")) {
            return newValues[0][tokenId];
        } else {
            return utils.initValue(tokenId, currentPhase);
        }
    }

    function mintCount() public view returns (uint256) {
        return _totalMinted();
    }

    function getBaseColorName(uint256 index)
        internal
        pure
        returns (string memory)
    {
        string[4] memory baseColorNames = ["White", "Red", "Green", "Blue"];
        return baseColorNames[index];
    }

    function getMetadata(
        uint256 tokenId,
        string memory value,
        uint256 baseColor,
        bool burned
    ) internal view returns (string memory) {
        uint256[3] memory rgbs = utils.getRgbs(tokenId, baseColor);
        string memory json;

        if (burned) {
            json = string(
                abi.encodePacked(
                    '{"name": "COMBINE_ALPHABET ',
                    utils.uint2str(tokenId),
                    ' [BURNED]", "description": "Alphabet are art, and we are artists.", "attributes":[{"trait_type": "Burned", "value": "Yes"}], "image": "data:image/svg+xml;base64,',
                    Base64.encode(bytes(renderSvg(value, rgbs))),
                    '"}'
                )
            );
        } else {
            json = string(
                abi.encodePacked(
                    '{"name": "COMBINE_ALPHABET ',
                    utils.uint2str(tokenId),
                    '", "description": "Alphabet are art, and we are artists.", "attributes":[{"trait_type": "Alphabet", "value": "',
                    value,
                    '"},{"trait_type": "Mint Phase", "value": ',
                    utils.uint2str(currentPhase),
                    '},{"trait_type": "Burned", "value": "No"},{"trait_type": "Base Color", "value": "',
                    getBaseColorName(baseColor),
                    '"},{"trait_type": "Color", "value": "RGB(',
                    utils.uint2str(rgbs[0]),
                    ",",
                    utils.uint2str(rgbs[1]),
                    ",",
                    utils.uint2str(rgbs[2]),
                    ')"}], "image": "data:image/svg+xml;base64,',
                    Base64.encode(bytes(renderSvg(value, rgbs))),
                    '"}'
                )
            );
        }

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    function renderSvg(string memory value, uint256[3] memory rgbs)
        internal
        pure
        returns (string memory svg)
    {
        svg = '<svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect id="bg" x="0" y="0" width="300" height="300" fill="#0C0C0C"/><style>';

        string memory styles = string(
            abi.encodePacked(
                "*{fill:rgb(",
                utils.uint2str(rgbs[0]),
                ",",
                utils.uint2str(rgbs[1]),
                ",",
                utils.uint2str(rgbs[2]),
                ")}#bg{fill:#0C0C0C}text{font-size: 70px;font-family: sans-serif;}</style>"
            )
        );

        if (utils.compare(value, "")) {} else {
            styles = string(
                abi.encodePacked(
                    styles,
                    '<text xmlns="http://www.w3.org/2000/svg" x="150" y="150" dominant-baseline="middle" text-anchor="middle">',
                    value,
                    " </text>"
                )
            );
        }

        return string(abi.encodePacked(svg, styles, "</svg>"));
    }

    function startNextPhase() internal {
        uint256 elapsed = block.timestamp - currentPhaseStart;
        if (elapsed >= mintPhaseDuration) {
            currentPhase++;
            if (currentPhase > 4) {
                return;
            }
            currentPhaseStart = block.timestamp;
            phaseEndTime = block.timestamp + mintDuration;
        }
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    function setKeyStr(string memory _keyStr) public onlyOwner {
        keyStr = _keyStr;
    }

    function setCurrentPhase(uint256 _currentPhase) public onlyOwner {
        currentPhase = _currentPhase;
        currentPhaseStart = block.timestamp;
        phaseEndTime = block.timestamp + mintDuration;
    }

    function setMintDuration(uint256 _mintDuration) public onlyOwner {
        mintDuration = _mintDuration;
    }

    function setMintPhaseDuration(uint256 _mintPhaseDuration) public onlyOwner {
        mintPhaseDuration = _mintPhaseDuration;
    }

    function toggleCombinable() public onlyOwner {
        isCombinable = !isCombinable;
    }

    function airdrop(address _to, uint256[] memory _tokens) external onlyOwner {
        // Check token trúng giải không
        // Burn tất cả các tokens
        // Ghép thành tokens key
        // Lưu wallet trung giải
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
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
        } else if (!utils.compare(newValues[0][tokenId], "")) {
            value = newValues[0][tokenId];
            burned = false;
        } else {
            value = utils.initValue(tokenId, currentPhase);
            burned = false;
        }

        return getMetadata(tokenId, value, baseColors[tokenId], burned);
    }

    function withdraw(address[] memory _to, uint256 _amount)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < _to.length; ++i) {
            (bool hs, ) = payable(address(_to[i])).call{
                value: (address(this).balance * _amount) / 100
            }("");
            require(hs);
        }
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }
}
