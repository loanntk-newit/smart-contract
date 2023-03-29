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

    function secondsRemaining(uint256 end) internal view returns (uint256) {
        if (block.timestamp <= end) {
            return end - block.timestamp;
        } else {
            return 0;
        }
    }
}
