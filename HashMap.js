"use strict";

/* 
- Hash maps = unordered associations between keys and values. (similar to objs)
- Hashmaps = data structure that uses the concept of hashing.
- Hashing = process of mapping a key to a position in the hash table
- Hash table = Storage that holds the records (the key and any value associated with the key). Hash maps require a 
- hash-table. The hash-table is usually implemented internally using an array. Each slot in the array holds a 
- key-value pair or is empty (null). Hash Function = maps keys to positions in the hash table.

- Collisions = when 2 unique keys hash to the same slot in the array
- Open addressing (collision resolution) = when a collision happens, it will hash the key to the empty slot nearest 
- to where it should live.
- Separate chaining (collision resolution) = uses linked lists to hash the keys that run into collision. 
- First slot contains the pointer to the head of the list. When a key collides with another, we use the next
- pointer to put the keys in a LL.

*/

class HashMap {
  constructor(initialCapacity = 8) {
    this.length = 0;
    this._hashTable = []; // holds all the data and is considered the hash table
    this._capacity = initialCapacity; // grows in chunks as you resize to a larger array when hash table is full (cuts down the number of memory allocations which need to take place)
    this._deleted = 0;
  }

  // takes a string and hashes it and outputs a number (djb2 algorithm);
  // provides index.
  static _hashString(string) {
    let hash = 5381;
    for (let i = 0; i < string.length; i++) {
      //Bitwise left shift with 5 0s - this would be similar to
      //hash*31, 31 being the decent prime number
      //but bit shifting is a faster way to do this
      //tradeoff is understandability
      hash = (hash << 5) + hash + string.charCodeAt(i);
      //converting hash to a 32 bit integer
      hash = hash & hash;
    }
    //making sure has is unsigned - meaning non-negtive number.
    return hash >>> 0;
  }

  get(key) {
    const index = this._findSlot(key);
    if (this._hashTable[index] === undefined) {
      throw new Error("Key error");
    }
    return this._hashTable[index].value;
  }

  set(key, value) {
    const loadRatio = (this.length + this._deleted + 1) / this._capacity; // why delete?
    if (loadRatio > HashMap.MAX_LOAD_RATIO) {
      this._resize(this._capacity * HashMap.SIZE_RATIO); // might be something you set to the hashpmap()
    }
    //Find the slot where this key should be in
    const index = this._findSlot(key);

    if (!this._hashTable[index]) {
      this.length++; // adds to length property once item is added. However, notice that this does NOT apply to collisions that are assigned same index
    }
    this._hashTable[index] = {
      // assigns value
      key,
      value,
      DELETED: false
    };
  }

  delete(key) {
    const index = this._findSlot(key);
    const slot = this._hashTable[index];
    if (slot === undefined) {
      throw new Error("Key error");
    }
    slot.DELETED = true;
    this.length--;
    this._deleted++; // sets the prop to deleted, but not deleted really till you remake the hashmap table again via resize.
  }

  // private helper function to find correct slot for given key

  _findSlot(key) {
    const hash = HashMap._hashString(key); //sum of ascii codes of each character in string / capacity = index.
    const start = hash % this._capacity;
    // linear probing occurs here. Finds next closest open slot ALONG the array. If nothing, then cycles back to beginning.
    // Even in searching for an item, once the sum of the ascii codes is divided by capacity, it must utilize linear probing to find
    // that item, which essentially will go through the same steps as when setting it.
    for (let i = start; i < start + this._capacity; i++) {
      const index = i % this._capacity;
      const slot = this._hashTable[index]; // i believe this represents the possible slots it can go in via linear probing.
      if (slot === undefined || (slot.key === key && !slot.DELETED)) {
        return index;
      }
    }
  }

  // above: because data can get huge, we use the max_load_capacity or load factor to make it reasonably smaller, so that if
  // linear probing occurs, it doesn't have to go through as much information as if there wasn't a max load capacity.
  // But linear probing might cause keys to bunch together, so you can try to do every 3rd slot along. (plus 3 rehash).

  _resize(size) {
    const oldSlots = this._hashTable;
    this._capacity = size;
    // Reset the length - it will get rebuilt as you add the items back.
    this.length = 0;
    this._deleted = 0;
    this._hashTable = [];

    for (const slot of oldSlots) {
      if (slot !== undefined && !slot.DELETED) {
        this.set(slot.key, slot.value);
      }
    }
  }
}

module.exports = { HashMap };
