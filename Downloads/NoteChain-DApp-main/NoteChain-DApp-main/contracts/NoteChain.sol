// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NoteChain {
    struct Note {
        uint id;
        string content;
        string tag;
    }
     
    address public owner;
    constructor() {
        owner = msg.sender;
    }
    uint constant MAX_NOTES = 25;
    uint constant MAX_TAG_LENGTH = 20;
    uint constant MAX_CONTENT_LENGTH = 1000;

    mapping(address => Note[]) private userNotes;
    uint private globalNoteId;

    modifier onlyOwner() {
        require(msg.sender == address(this), "Only the contract owner can call this function");
        _;
    }
    function createNote(string memory _content, string memory _tag) public onlyOwner {
        require(userNotes[msg.sender].length < MAX_NOTES, "Maximum number of notes reached");
        require(bytes(_content).length > 0 && bytes(_content).length < MAX_CONTENT_LENGTH, "Content Invalid Length");
        require(bytes(_tag).length > 0 && bytes(_tag).length < MAX_TAG_LENGTH, "Tag Invalid Length");
        userNotes[msg.sender].push(Note(globalNoteId++, _content, _tag));
    }

    function getMyNotes() public view onlyOwner returns (Note[] memory) {
        return userNotes[msg.sender];
    }

    function updateNote(uint _id, string memory _content, string memory _tag) public onlyOwner{
        require(_id < globalNoteId, "Note ID does not exist");
        require(bytes(_content).length > 0 && bytes(_content).length < MAX_CONTENT_LENGTH, "Content Invalid Length");
        require(bytes(_tag).length > 0 && bytes(_tag).length < MAX_TAG_LENGTH, "Tag Invalid Length");
        Note[] storage notes = userNotes[msg.sender];
        for (uint i = 0; i < notes.length; i++) {
            if (notes[i].id == _id) {
                notes[i].content = _content;
                notes[i].tag = _tag;
                break;
            }
        }
    }

    function getNoteById(uint _id) public view onlyOwner returns (Note memory) {
        require(_id < globalNoteId, "Note ID does not exist");
        Note[] storage notes = userNotes[msg.sender];
        for (uint i = 0; i < notes.length; i++) {
            if (notes[i].id == _id) {
                return notes[i];
            }
        }
        revert("Note not found");
    }

    function getNotesByTag(string memory _tag) public view onlyOwner returns (Note[] memory) {
        require(bytes(_tag).length > 0, "Tag cannot be empty");
        Note[] storage notes = userNotes[msg.sender];
        uint count = 0;
        for (uint i = 0; i < notes.length; i++) {
            if (keccak256(abi.encodePacked(notes[i].tag)) == keccak256(abi.encodePacked(_tag))) {
                count++;
            }
        }

        Note[] memory taggedNotes = new Note[](count);
        uint index = 0;
        for (uint i = 0; i < notes.length; i++) {
            if (keccak256(abi.encodePacked(notes[i].tag)) == keccak256(abi.encodePacked(_tag))) {
                taggedNotes[index++] = notes[i];
            }
        }
        return taggedNotes;
    }

    function deleteNote(uint _id) public onlyOwner{
        require(_id < globalNoteId, "Note ID does not exist");
        require(userNotes[msg.sender].length > 0, "No notes to delete");
        Note[] storage notes = userNotes[msg.sender];
        for (uint i = 0; i < notes.length; i++) {
            if (notes[i].id == _id) {
                notes[i] = notes[notes.length - 1];
                notes.pop();
                break;
            }
        }
    }
}
