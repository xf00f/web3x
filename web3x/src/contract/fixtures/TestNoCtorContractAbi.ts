import { ContractAbi} from '../../contract';
export default new ContractAbi([
  {
    "constant": false,
    "inputs": [
      {
        "components": [
          {
            "name": "status",
            "type": "bool"
          }
        ],
        "name": "nestedStruct",
        "type": "tuple"
      }
    ],
    "name": "addStruct",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
]);