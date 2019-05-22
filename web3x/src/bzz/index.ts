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

import swarm from 'swarm-js';
import { LegacyProvider } from '../providers/legacy-provider';

export class Bzz {
  public readonly pick?: any;

  constructor(private provider: LegacyProvider) {
    if (typeof document !== 'undefined') {
      // Only allow file picker when in browser.
      this.pick = swarm.pick;
    }
  }

  public download(bzzHash: string, localPath?: string) {
    swarm.at(this.provider).download(bzzHash, localPath);
  }

  public upload(mixed: string | Buffer | number[] | object) {
    swarm.at(this.provider).upload(mixed);
  }

  public isAvailable(swarmUrl: string) {
    swarm.at(this.provider).isAvailable(swarmUrl);
  }
}
