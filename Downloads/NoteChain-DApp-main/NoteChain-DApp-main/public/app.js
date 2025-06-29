const CONTRACT_ADDRESS = '';
let CONTRACT_ABI;

let provider, signer, contract;
let currentAccount;

async function connectWallet() {
  const choice = document.getElementById('providerSelect').value;

  if (choice === 'metamask') {
    if (!window.ethereum) return alert("MetaMask not found!");
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
  } else {
    provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
  }

  signer = provider.getSigner();
  currentAccount = await signer.getAddress();

  document.getElementById('wallet-status').innerText = `Connected: ${currentAccount}`;

  const res = await fetch('abi.json'); // Save ABI as `abi.json`
  CONTRACT_ABI = await res.json();

  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  await renderNotes();

  document.getElementById('connectWalletBtn').disabled = true;
}

async function addNote() {
  const content = document.getElementById('noteContent').value.trim();
  const tag = document.getElementById('noteTag').value.trim();
  if (!content) return alert("Note content required");

  await contract.createNote(content, tag);
  document.getElementById('noteContent').value = '';
  document.getElementById('noteTag').value = '';
  await renderNotes();
}

async function renderNotes() {
  if (!contract) return;

  const notes = await contract.getMyNotes();
  const search = document.getElementById('searchInput').value.toLowerCase();

  const list = document.getElementById('notesList');
  list.innerHTML = '';

  notes.forEach(note => {
    if (
      note.content.toLowerCase().includes(search) ||
      note.tag.toLowerCase().includes(search)
    ) {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="note-header">${note.tag || "[No Tag]"}</div>
        <div>${note.content}</div>
        <button class="editBtn" onclick="editNote(${note.id}, '${note.content}', '${note.tag}')">Edit</button>
        <button class="deleteBtn" onclick="deleteNote(${note.id})">Delete</button>
      `;
      list.appendChild(li);
    }
  });
}

async function editNote(id, oldContent, oldTag) {
  const newContent = prompt("Edit content:", oldContent);
  if (!newContent) return;
  const newTag = prompt("Edit tag:", oldTag);

  await contract.updateNote(id, newContent, newTag);
  await renderNotes();
}

async function deleteNote(id) {
  await contract.deleteNote(id);
  await renderNotes();
}

document.getElementById('connectWalletBtn').onclick = connectWallet;
document.getElementById('addNoteBtn').onclick = addNote;
document.getElementById('clearNotesBtn').onclick = () => {
document.getElementById('searchInput').value = '';
document.getElementById('notesList').innerHTML = '';
};
