/*
  This file is part of web3x.

  web3x is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  web3x is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with web3x.  If not, see <http://www.gnu.org/licenses/>.
*/

import { outputBlockFormatter } from './output-block-formatter';

describe('formatters', function() {
  describe('outputBlockFormatter', function() {
    it('should return the correct value', function() {
      expect(
        outputBlockFormatter({
          hash: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
          parentHash: '0x83ffb245cfced97ccc5c75253d6960376d6c6dea93647397a543a72fdaea5265',
          miner: '0xdcc6960376d6c6dea93647383ffb245cfced97cf',
          stateRoot: '0x54dda68af07643f68739a6e9612ad157a26ae7e2ce81f77842bb5835fbcde583',
          sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
          bloom: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
          difficulty: '0x3e8',
          totalDifficulty: '0x3e8',
          number: '0x3e8',
          gasLimit: '0x3e8',
          gasUsed: '0x3e8',
          timestamp: '0x3e8',
          extraData: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
          nonce: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
          size: '0x3e8',
        }),
      ).toEqual({
        hash: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
        parentHash: '0x83ffb245cfced97ccc5c75253d6960376d6c6dea93647397a543a72fdaea5265',
        miner: '0xDCc6960376d6C6dEa93647383FfB245CfCed97Cf',
        stateRoot: '0x54dda68af07643f68739a6e9612ad157a26ae7e2ce81f77842bb5835fbcde583',
        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        bloom: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
        difficulty: '1000',
        totalDifficulty: '1000',
        number: 1000,
        gasLimit: 1000,
        gasUsed: 1000,
        timestamp: 1000,
        extraData: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
        nonce: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
        size: 1000,
      });
    });
    it('should return the correct value, when null values are present', function() {
      expect(
        outputBlockFormatter({
          hash: null,
          parentHash: '0x83ffb245cfced97ccc5c75253d6960376d6c6dea93647397a543a72fdaea5265',
          miner: null,
          stateRoot: '0x54dda68af07643f68739a6e9612ad157a26ae7e2ce81f77842bb5835fbcde583',
          sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
          bloom: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
          difficulty: '0x3e8',
          totalDifficulty: '0x3e8',
          number: null,
          gasLimit: '0x3e8',
          gasUsed: '0x3e8',
          timestamp: '0x3e8',
          extraData: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
          nonce: null,
          size: '0x3e8',
        }),
      ).toEqual({
        hash: null,
        parentHash: '0x83ffb245cfced97ccc5c75253d6960376d6c6dea93647397a543a72fdaea5265',
        miner: null,
        stateRoot: '0x54dda68af07643f68739a6e9612ad157a26ae7e2ce81f77842bb5835fbcde583',
        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        bloom: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
        difficulty: '1000',
        totalDifficulty: '1000',
        number: null,
        gasLimit: 1000,
        gasUsed: 1000,
        timestamp: 1000,
        extraData: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
        nonce: null,
        size: 1000,
      });
    });
  });
});
