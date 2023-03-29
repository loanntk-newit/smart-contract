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
    string[] public keyStr;
    address[] public winningWallets; // sua con 1 vi
    bool public isCombinable = false;

    mapping(uint256 => bytes) public phaseValues;
    mapping(uint256 => string) public phaseKey;
    mapping(uint256 => mapping(uint256 => string)) newValues;

    constructor() ERC721A("COMBINE-ALPHABET-TEST", "CAT") {}

    function mint(uint256 quantity, string memory value) public payable {
        require(
            utils.isCharInString(value, getCurrentPhaseValue()),
            string.concat("value not in ", getCurrentPhaseValue())
        );
        require(msg.value >= quantity * price, "not enough eth");
        handleMint(msg.sender, quantity, value, false);
    }

    function mintPack() public payable {
        uint256 quantity = phaseValues[currentPhase].length;
        require(msg.value >= quantity * price, "not enough eth");
        handleMint(msg.sender, quantity, "", true);
    }

    function handleMint(
        address recipient,
        uint256 quantity,
        string memory value,
        bool _mintPack
    ) internal {
        require(currentPhase > 0, "Mint is closed");
        startNextPhase();
        require(
            utils.secondsRemaining(phaseEndTime) > 0,
            "Minting for this phase has ended"
        );
        if (_mintPack) {
            bytes memory str = bytes(getCurrentPhaseValue());
            uint256 index = 0;
            for (
                uint256 i = mintCount() + 1;
                i <= quantity + mintCount();
                ++i
            ) {
                bytes1 char = bytes1(str[index]);
                newValues[0][i] = string(abi.encodePacked(char));
                index++;
            }
        } else {
            for (
                uint256 i = mintCount() + 1;
                i <= quantity + mintCount();
                ++i
            ) {
                newValues[0][i] = value;
            }
        }

        _mint(recipient, quantity);
    }

    function combine(uint256[] memory tokens, uint256 _phase) public {
        require(isCombinable, "combining not active");
        require(_phase == currentPhase, "let's combine the right phase");
        string memory newValue = "";
        for (uint256 i = 0; i < tokens.length; i++) {
            require(_exists(tokens[i]), "has token burned");
            require(ownerOf(tokens[i]) == msg.sender, "must own all tokens");
            newValue = string.concat(newValue, getValue(tokens[i]));
        }
        if (bytes(newValue).length > 6) {
            revert("value no more than 6 characters");
        }

        for (uint256 i = 1; i < tokens.length; i++) {
            _burn(tokens[i]);
            newValues[_phase][tokens[i]] = "";
            newValues[0][tokens[0]] = newValue;
            emit MetadataUpdate(tokens[i]);
        }
        newValues[_phase][tokens[0]] = newValue;
        newValues[0][tokens[0]] = newValue;
        emit MetadataUpdate(tokens[0]);
    }

    // function matchStr
    // check isCombine = false
    // check xem da input keyStr cua phase do chua
    // check xem co trung voi keyStr khong thi cho combine

    function claimReward(uint256[] memory _tokens) public {
        string[] memory valueTokens = new string[](_tokens.length);

        for (uint256 i = 0; i < _tokens.length; i++) {
            require(ownerOf(_tokens[i]) == msg.sender, "must own all tokens");
            string memory value = getValue(_tokens[i]);
            valueTokens[i] = value;
        }

        bool isWin = utils.compareArrays(valueTokens, keyStr);
        require(isWin, "YOU LOST!");

        string memory newValue = "";
        for (uint256 i = 0; i < _tokens.length; i++) {
            require(ownerOf(_tokens[i]) == msg.sender, "must own all tokens");
            newValue = string.concat(newValue, getValue(_tokens[i]), " ");
        }
        for (uint256 i = 1; i < _tokens.length; i++) {
            _burn(_tokens[i]);
            newValues[0][_tokens[0]] = newValue;
            emit MetadataUpdate(_tokens[i]);
        }
        newValues[0][_tokens[0]] = newValue;
        emit MetadataUpdate(_tokens[0]);

        winningWallets.push(msg.sender);
    }

    function mintCount() public view returns (uint256) {
        return _totalMinted();
    }

    function getValue(uint256 tokenId) public view returns (string memory) {
        if (!_exists(tokenId)) {
            return "";
        } else {
            return newValues[0][tokenId];
        }
    }

    function getCurrentPhaseValue() public view returns (string memory) {
        return string(phaseValues[currentPhase]);
    }

    function getMetadata(
        uint256 tokenId,
        string memory value,
        bool combined,
        bool burned
    ) internal view returns (string memory) {
        string[4] memory baseColorNames = ["White", "Red", "Green", "Blue"];
        string memory json;

        if (burned) {
            json = string(
                abi.encodePacked(
                    '{"name": "BG_BLACK ',
                    utils.uint2str(tokenId),
                    ' [BURNED]", "description": "BG_BLACK Description.", "attributes":[{"trait_type": "Burned", "value": "Yes"}], "image": "data:image/svg+xml;base64,',
                    Base64.encode(bytes(renderSvg(value, baseColorNames[0]))),
                    '"}'
                )
            );
        } else {
            string memory path = string(
                abi.encodePacked(
                    "{'trait_type': 'Alphabet', 'value': '",
                    value,
                    "'}, "
                )
            );
            if (combined) {
                path = string(
                    abi.encodePacked(
                        "{'trait_type': 'Combine', 'value': '",
                        value,
                        "'}, "
                    )
                );
            }
            json = string(
                abi.encodePacked(
                    "{'name': 'BG_BLACK ",
                    utils.uint2str(tokenId),
                    "', 'description': 'BG_BLACK Description.', 'attributes':[",
                    path,
                    "{'trait_type': 'Mint Phase', 'value': '",
                    utils.uint2str(currentPhase),
                    "'}, {'trait_type': 'Burned', 'value': 'No'}, {'trait_type': 'Color', 'value': '",
                    baseColorNames[currentPhase],
                    "'}], 'image': 'data:image/svg+xml;base64,",
                    Base64.encode(
                        bytes(renderSvg(value, baseColorNames[currentPhase]))
                    ),
                    "'}"
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

    function renderSvg(string memory value, string memory color)
        internal
        pure
        returns (string memory svg)
    {
        svg = '<svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect id="bg" x="0" y="0" width="300" height="300" fill="#0C0C0C"/><style>';

        string memory styles = string(
            abi.encodePacked(
                "@import url('https://fonts.googleapis.com/css2?family=Beth+Ellen');",
                "body{margin:0}#bg{fill:#0C0C0C}div{display:table;width:300px;height:300px;}",
                "p{display:table-cell;text-align:center;vertical-align:middle;font-family:monospace;font-size:39px;word-spacing:-16px;color:",
                color,
                "}</style>"
            )
        );

        if (utils.compare(value, "")) {
            styles = string(
                abi.encodePacked(
                    styles,
                    "<g transform='matrix(0.3,0,0,0.3,80,80)'><path d='M295.617 0c-106.104 61.135-93.353 233.382-93.353 233.382s-46.676-15.559-46.676-85.573C99.9 180.1 62.235 242.166 62.235 311.176c0 103.115 83.591 186.706 186.706 186.706s186.706-83.591 186.706-186.706C435.646 159.478 295.617 128.36 295.617 0zm-30.276 433.549c-37.518 9.354-75.517-13.477-84.873-50.997-9.354-37.518 13.477-75.519 50.997-84.873 90.58-22.584 101.932-73.521 101.932-73.521s45.169 181.16-68.056 209.391z' fill='#a3a3a3' data-original='#000000'/></g>"
                )
            );
        } else {
            styles = string(
                abi.encodePacked(
                    styles,
                    "<foreignObject x='0' y='0' width='300' height='300'><body xmlns='http://www.w3.org/1999/xhtml'><div><p>",
                    value,
                    "</p></div></body></foreignObject>"
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

    function setKeyStr(string[] memory _keyStr) public onlyOwner {
        keyStr = _keyStr;
        isCombinable = false;
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

    function setPhaseValues(uint256 _phase, string memory _values)
        public
        onlyOwner
    {
        phaseValues[_phase] = bytes(_values);
    }

    function setPhaseKey(uint256 _phase, string memory _key) public onlyOwner {
        phaseKey[_phase] = _key;
    }

    function toggleCombinable() public onlyOwner {
        isCombinable = !isCombinable;
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
        bool combined;
        string memory value;

        if (!_exists(tokenId)) {
            value = "";
            burned = true;
            combined = false;
        } else {
            value = newValues[0][tokenId];
            burned = false;
            if (bytes(value).length > 1) {
                combined = true;
            } else {
                combined = false;
            }
        }

        return getMetadata(tokenId, value, combined, burned);
    }

    function withdraw(uint256 _amount) external onlyOwner {
        for (uint256 i = 0; i < winningWallets.length; ++i) {
            (bool hs, ) = payable(address(winningWallets[i])).call{
                value: (address(this).balance * _amount) / 100
            }("");
            require(hs);
        }
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }
}
