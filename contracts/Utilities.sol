// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library utils {
    function uint2str(uint256 _i)
        internal
        pure
        returns (string memory _uintAsString)
    {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function compare(string memory str1, string memory str2)
        internal
        pure
        returns (bool)
    {
        return
            keccak256(abi.encodePacked(str1)) ==
            keccak256(abi.encodePacked(str2));
    }

    function randomString(
        uint256 input,
        uint256 length,
        bytes memory chars
    ) internal pure returns (string memory) {
        require(length <= 4, "Length cannot be greater than 4");
        require(length >= 1, "Length cannot be Zero");
        bytes memory randomWord = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            uint256 randomNumber = random(input, chars.length, i);
            randomWord[i] = chars[randomNumber];
        }
        return string(randomWord);
    }

    function random(
        uint256 input,
        uint256 number,
        uint256 counter
    ) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input, counter))) % number;
    }

    function randomRange(
        uint256 input,
        uint256 min,
        uint256 max
    ) internal pure returns (uint256) {
        uint256 randRange = max - min;
        return
            max -
            (uint256(keccak256(abi.encodePacked(input + 2023))) % randRange) -
            1;
    }

    function initValue(uint256 tokenId, uint256 phase)
        internal
        pure
        returns (string memory value)
    {
        if (phase == 1) {
            value = randomString(tokenId, 1, "ENDIROGLPHW");
        } else if (phase == 2) {
            value = randomString(tokenId, 1, "FLEKITWORDN");
        } else if (phase == 3) {
            value = randomString(tokenId, 1, "WORTHMEALPS");
        } else if (phase == 4) {
            value = randomString(tokenId, 1, "INHALEFOWDP");
        }
        return value;
    }

    function compareArrays(string[] memory array1, string[] memory array2)
        internal
        pure
        returns (bool)
    {
        if (array1.length != array2.length) {
            return false;
        }
        for (uint256 i = 0; i < array1.length; i++) {
            bytes32 hash1 = keccak256(abi.encodePacked(array1[i]));
            bytes32 hash2 = keccak256(abi.encodePacked(array2[i]));
            if (hash1 != hash2) {
                return false;
            }
        }
        return true;
    }

    function getRgbs(uint256 tokenId, uint256 baseColor)
        internal
        pure
        returns (uint256[3] memory rgbValues)
    {
        if (baseColor > 0) {
            for (uint256 i = 0; i < 3; i++) {
                if (baseColor == i + 1) {
                    rgbValues[i] = 255;
                } else {
                    rgbValues[i] = randomRange(tokenId + i, 0, 256);
                }
            }
        } else {
            for (uint256 i = 0; i < 3; i++) {
                rgbValues[i] = 255;
            }
        }
        return rgbValues;
    }

    function secondsRemaining(uint256 end) internal view returns (uint256) {
        if (block.timestamp <= end) {
            return end - block.timestamp;
        } else {
            return 0;
        }
    }
}
