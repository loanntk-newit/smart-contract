// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "erc721a/contracts/ERC721A.sol";
import "./Utilities.sol";

interface IERC4906 is IERC721A {
    event MetadataUpdate(uint256 _tokenId);
}

contract BG_BLACK is ERC721A, Ownable, IERC4906 {
    event CountdownExtended(uint256 _finalBlock);

    uint256 public price = 0;
    uint256 public currentPhase = 0;
    uint256 public mintDuration = 1 days;
    uint256 public mintPhaseDuration = 30 minutes;
    uint256 public phaseEndTime;
    uint256 public currentPhaseStart = block.timestamp;
    uint256 public winningToken;
    string public superKey;
    address public winningWallets;

    bool public isCombinable = false;

    mapping(uint256 => string) public phaseValues;
    mapping(uint256 => string[]) public phaseKey;
    mapping(uint256 => mapping(uint256 => string)) newValues;

    constructor() ERC721A("BG_BLACK", "BB") {}

    function mint(uint256 quantity, string memory value) public payable {
        require(bytes(value).length == 1, "can only choose 1 character");
        require(
            isCharInString(value, phaseValues[currentPhase]),
            string.concat("value not in ", phaseValues[currentPhase])
        );
        require(msg.value >= quantity * price, "not enough eth");
        handleMint(msg.sender, quantity, value, false);
    }

    function mintPack() public payable {
        uint256 quantity = bytes(phaseValues[currentPhase]).length;
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
            bytes memory str = bytes(phaseValues[currentPhase]);
            uint256 index = 0;
            for (
                uint256 i = mintCount() + 1;
                i <= quantity + mintCount();
                ++i
            ) {
                bytes1 char = bytes1(str[index]);
                newValues[0][i] = string(abi.encodePacked(char));
                newValues[currentPhase][i] = string(abi.encodePacked(char));
                index++;
            }
        } else {
            for (
                uint256 i = mintCount() + 1;
                i <= quantity + mintCount();
                ++i
            ) {
                newValues[0][i] = value;
                newValues[currentPhase][i] = value;
            }
        }

        _mint(recipient, quantity);
    }

    function combine(uint256[] memory tokens) public {
        require(isCombinable, "combining not active");
        string memory newValue = "";
        for (uint256 i = 0; i < tokens.length; i++) {
            require(_exists(tokens[i]), "has token burned");
            require(ownerOf(tokens[i]) == msg.sender, "must own all tokens");
            require(
                bytes(newValues[currentPhase][tokens[i]]).length > 0,
                "let's combine the right phase tokens"
            );
            newValue = string.concat(newValue, getValue(tokens[i]));
        }

        for (uint256 i = 1; i <= currentPhase; i++) {
            require(
                !utils.findString(newValue, phaseKey[i]),
                "cannot combine the value that is the key of the previous phase"
            );
        }

        for (uint256 i = 1; i < tokens.length; i++) {
            _burn(tokens[i]);
            newValues[currentPhase][tokens[i]] = "";
            newValues[0][tokens[i]] = "";
            emit MetadataUpdate(tokens[i]);
        }
        newValues[currentPhase][tokens[0]] = newValue;
        newValues[0][tokens[0]] = newValue;
        emit MetadataUpdate(tokens[0]);
    }

    function matchStr(uint256[] memory _tokens) public {
        require(
            !isCombinable,
            "cannot perform this action when combining is active"
        );

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
    }

    function claimReward(uint256[] memory _tokens) public {
        require(winningWallets == address(0), "The winner has been found");
        string memory newValue = "";

        for (uint256 i = 0; i < _tokens.length; i++) {
            require(ownerOf(_tokens[i]) == msg.sender, "must own all tokens");
            newValue = string.concat(newValue, getValue(_tokens[i]), " ");
        }

        bool isWin = utils.compare(string(newValue), string(superKey));
        require(isWin, "YOU LOST!");

        newValues[0][mintCount() + 1] = "KEY";
        winningToken = mintCount() + 1;
        _mint(msg.sender, 1);

        winningWallets = msg.sender;
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

    function getMetadata(
        uint256 tokenId,
        string memory value,
        bool combined,
        bool burned,
        bool isKey
    ) internal view returns (string memory) {
        string[4] memory baseColorNames = ["White", "Red", "Green", "Blue"];
        string memory json;

        if (isKey) {
            json = string(
                abi.encodePacked(
                    '{"name": "BG_BLACK [KEY]", ',
                    '"description": "BG_BLACK Description.", "attributes":[{"trait_type": "Key", "value": "Yes"}], "image": ',
                    '"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PScwIDAgMzAwIDMwMCcgZmlsbD0nbm9uZScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCBpZD0nYmcnIHg9JzAnIHk9JzAnIHdpZHRoPSczMDAnIGhlaWdodD0nMzAwJyBmaWxsPScjMEMwQzBDJy8+PHN0eWxlIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+Ym9keXttYXJnaW46MH0jYmd7ZmlsbDojMEMwQzBDfTwvc3R5bGU+PGcgdHJhbnNmb3JtPSdtYXRyaXgoMSAwIDAgMSAxMTAgMTEwKSc+PHBhdGggZD0nTSAyMy45MzggODkuNDUgbCAyLjU0MiAtMi41NDIgYyAwLjY4IC0wLjY4IDAuNjggLTEuNzgyIDAgLTIuNDYyIGwgLTIuMjc4IC0yLjI3OCBjIC0xLjAxNCAtMS4wMTQgLTEuMDE0IC0yLjY1OCAwIC0zLjY3MiBsIDMuMzE3IC0zLjMxNyBjIDEuMDE0IC0xLjAxNCAyLjY1OCAtMS4wMTQgMy42NzIgMCBsIDIuMjc4IDIuMjc4IGMgMC42OCAwLjY4IDEuNzgyIDAuNjggMi40NjIgMCBsIDIuNTQyIC0yLjU0MiBjIDAuNzMzIC0wLjczMyAwLjczMyAtMS45MjEgMCAtMi42NTQgbCAtOC42MDkgLTguNjA5IGMgLTcuMTQzIDQuMjk0IC0xMi44NDUgMTAuMDUxIC0xNy4xODkgMTcuMTg5IGwgOC42MDkgOC42MDkgQyAyMi4wMTcgOTAuMTgzIDIzLjIwNSA5MC4xODMgMjMuOTM4IDg5LjQ1IHonIHN0eWxlPSdmaWxsOiByZ2IoMjI2LDE4MywwKTsnLz48cGF0aCBkPSdNIDgyLjg5MSAxOC4zNTggTCA2OC44MDIgNC4yNjkgYyAtNS42OTIgLTUuNjkyIC0xNC45MiAtNS42OTIgLTIwLjYxMiAwIGwgLTUuMjc0IDUuMjc0IGMgLTUuNjkyIDUuNjkyIC01LjY5MiAxNC45MiAwIDIwLjYxMiBsIDMuODY2IDMuODY2IEwgMy4zOSA3Ny40MTMgYyAtMC43MzMgMC43MzMgLTAuNzMzIDEuOTIxIDAgMi42NTQgbCAzLjcwMyAzLjcwMyBjIDAuNzMzIDAuNzMzIDEuOTIxIDAuNzMzIDIuNjU0IDAgTCA1My4xNCA0MC4zNzcgbCAzLjg2NiAzLjg2NiBjIDUuNjkyIDUuNjkyIDE0LjkyIDUuNjkyIDIwLjYxMiAwIGwgNS4yNzQgLTUuMjc0IEMgODguNTgzIDMzLjI3OCA4OC41ODMgMjQuMDUgODIuODkxIDE4LjM1OCB6IE0gNzYuNjMgMzQuMjY0IGwgLTMuNzE4IDMuNzE4IGMgLTMuMDkzIDMuMDkzIC04LjEwNyAzLjA5MyAtMTEuMiAwIEwgNDkuMTc3IDI1LjQ0OCBjIC0zLjA5MyAtMy4wOTMgLTMuMDkzIC04LjEwNyAwIC0xMS4yIGwgMy43MTggLTMuNzE4IGMgMy4wOTMgLTMuMDkzIDguMTA3IC0zLjA5MyAxMS4yIDAgTCA3Ni42MyAyMy4wNjQgQyA3OS43MjMgMjYuMTU3IDc5LjcyMyAzMS4xNzEgNzYuNjMgMzQuMjY0IHonIHN0eWxlPSdmaWxsOiByZ2IoMjUyLDIwNCwwKTsnLz48L2c+PC9zdmc+',
                    '"}'
                )
            );
        } else if (burned) {
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
                    '{"trait_type": "Alphabet", "value": "',
                    value,
                    '"}, '
                )
            );
            if (combined) {
                path = string(
                    abi.encodePacked(
                        '{"trait_type": "Combine", "value": "',
                        value,
                        '"}, '
                    )
                );
            }
            json = string(
                abi.encodePacked(
                    '{"name": "BG_BLACK #',
                    utils.uint2str(tokenId),
                    '", "description": "BG_BLACK Description.", "attributes":[',
                    path,
                    '{"trait_type": "Mint Phase", "value": "',
                    utils.uint2str(currentPhase),
                    '"}, {"trait_type": "Burned", "value": "No"}, {"trait_type": "Color", "value": "',
                    baseColorNames[currentPhase - 1],
                    '"}], "image": "data:image/svg+xml;base64,',
                    Base64.encode(
                        bytes(
                            renderSvg(value, baseColorNames[currentPhase - 1])
                        )
                    ),
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

    function renderSvg(string memory value, string memory color)
        internal
        pure
        returns (string memory svg)
    {
        svg = '<svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect id="bg" x="0" y="0" width="300" height="300" fill="#0C0C0C"/><style>';

        string memory styles = string(
            abi.encodePacked(
                '@import url("https://fonts.googleapis.com/css2?family=Megrim");',
                "body{margin:0}#bg{fill:#0C0C0C}div{display:table;width:300px;height:300px;}",
                "p{display:table-cell;text-align:center;vertical-align:middle;font-family: 'Megrim', cursive; font-size:40px; color:",
                color,
                "}</style>"
            )
        );

        if (utils.compare(value, "")) {
            styles = string(
                abi.encodePacked(
                    styles,
                    '<g transform="matrix(0.3,0,0,0.3,80,80)"><path d="M295.617 0c-106.104 61.135-93.353 233.382-93.353 233.382s-46.676-15.559-46.676-85.573C99.9 180.1 62.235 242.166 62.235 311.176c0 103.115 83.591 186.706 186.706 186.706s186.706-83.591 186.706-186.706C435.646 159.478 295.617 128.36 295.617 0zm-30.276 433.549c-37.518 9.354-75.517-13.477-84.873-50.997-9.354-37.518 13.477-75.519 50.997-84.873 90.58-22.584 101.932-73.521 101.932-73.521s45.169 181.16-68.056 209.391z" fill="#a3a3a3" data-original="#000000"/></g>'
                )
            );
        } else {
            styles = string(
                abi.encodePacked(
                    styles,
                    '<foreignObject x="0" y="0" width="300" height="300"><body xmlns="http://www.w3.org/1999/xhtml"><div><p>',
                    value,
                    "</p></div></body></foreignObject>"
                )
            );
        }

        return string(abi.encodePacked(svg, styles, "</svg>"));
    }

    function isCharInString(string memory c, string memory s)
        internal
        pure
        returns (bool)
    {
        bytes memory bStr = bytes(s);
        bytes1 bChar = bytes1(bytes(c));

        for (uint256 i = 0; i < bStr.length; i++) {
            if (bStr[i] == bChar) {
                return true;
            }
        }
        return false;
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

    function setSuperKey(string[] memory _superKey) public onlyOwner {
        string memory newValue = "";
        for (uint256 i = 0; i < _superKey.length; i++) {
            newValue = string.concat(newValue, _superKey[i], " ");
        }
        superKey = newValue;
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
        phaseValues[_phase] = _values;
    }

    function setPhaseKey(uint256 _phase, string[] memory _key)
        public
        onlyOwner
    {
        phaseKey[_phase] = _key;
        isCombinable = false;
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
        bool isKey;
        string memory value;

        if (tokenId == winningToken) {
            isKey = true;
        } else {
            isKey = false;
        }

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

        return getMetadata(tokenId, value, combined, burned, isKey);
    }

    function withdraw(uint256 _amount) external onlyOwner {
        (bool hs, ) = payable(winningWallets).call{
            value: (address(this).balance * _amount) / 100
        }("");
        require(hs);
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }
}