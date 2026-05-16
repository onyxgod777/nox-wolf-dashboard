// Script to update the contract's baseURI (run locally when John approves)
const { createWalletClient, createPublicClient, http, getContract } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { polygon } = require('viem/chains');
const fs = require('fs');

const RPC = 'https://polygon.drpc.org';
const CONTRACT = '0xa40e696a27333733083f57ec34ebba2a328abcc7';
const NEW_BASE = 'ipfs://bafybeih2cidkedrjakz4mhlku5j6fom3kjtlkknz5zuffnx36ucvid75pq/';
const JOHN = '0xdd6c62f07C9E51b54CDD7935e45A2DFA840F12e0';

// To use: provide John's private key as env var JOHN_KEY
async function main() {
  if (!process.env.JOHN_KEY) {
    console.log('❌ Set JOHN_KEY env var (John\\'s private key)');
    console.log('Or John can call setBaseURI from the dashboard');
    return;
  }

  const key = process.env.JOHN_KEY.startsWith('0x') ? process.env.JOHN_KEY : '0x' + process.env.JOHN_KEY;
  const account = privateKeyToAccount(key);
  const wallet = createWalletClient({ account, chain: polygon, transport: http(RPC) });
  const pub = createPublicClient({ chain: polygon, transport: http(RPC) });

  console.log('Updating baseURI...');
  const hash = await wallet.writeContract({
    address: CONTRACT,
    abi: JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/.openclaw/workspace/nox-wolf-contract/out/NoxWolf.abi.json')),
    functionName: 'setBaseURI',
    args: [NEW_BASE],
  });
  const receipt = await pub.waitForTransactionReceipt({ hash, timeout: 60000 });
  console.log('✅ baseURI updated! Tx:', receipt.transactionHash);
}
main().catch(e => console.error('Error:', e.message));
