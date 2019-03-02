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

import { ContractAbiDefinition, ContractEventEntry, ContractFunctionEntry } from '.';
import { LogResponse } from '../../formatters';

export class ContractAbi {
  public functions: ContractFunctionEntry[];
  public events: ContractEventEntry[];
  public ctor: ContractFunctionEntry;
  public fallback?: ContractFunctionEntry;

  constructor(definition: ContractAbiDefinition) {
    this.functions = definition.filter(e => e.type === 'function').map(entry => new ContractFunctionEntry(entry));
    this.events = definition.filter(e => e.type === 'event').map(entry => new ContractEventEntry(entry));
    const ctor = definition.find(e => e.type === 'constructor');
    this.ctor = new ContractFunctionEntry(ctor || { type: 'constructor' });
    const fallback = definition.find(e => e.type === 'fallback');
    if (fallback) {
      this.fallback = new ContractFunctionEntry(fallback);
    }
  }

  public findEntryForLog(log: LogResponse) {
    return this.events.find(abiDef => abiDef.signature === log.topics[0]);
  }

  public decodeAnyEvent(log: LogResponse) {
    const event = this.findEntryForLog(log);
    if (!event) {
      throw new Error(`Unable to find matching event signature for log: ${log.id}`);
    }
    return event.decodeEvent(log);
  }
}
