const shuffle = require('knuth-shuffle').knuthShuffle
const storageAdapter = require('../../../../storage-adapter')
const Card = require('../../../../../decks/decks/spanish-vocabulary/card')

const HIGH_PRIORITY_CAPACITY = 8
const LOW_PRIORITY_CAPACITY = 32

class Store {
  constructor () {
    this.connection = storageAdapter.connect()
  }

  getNextCard (deck) {
    const vacanciesHP = HIGH_PRIORITY_CAPACITY - this.connection.getLengthOfHighPriorityWorkingSet(deck)
    if (vacanciesHP >= HIGH_PRIORITY_CAPACITY / 2) {
      this._refillHighPriorityWorkingSet(deck, vacanciesHP)
    }
    
    const item = this.connection.peekFromHighPriorityWorkingSet(deck)
    const flashcard = new Card(item).renderRandomVariant()
    return flashcard
  }

  _refillHighPriorityWorkingSet (deck, vacanciesHP) {
    const sizeLP = this.connection.getLengthOfLowPriorityWorkingSet(deck)
    const numItemsToGetFromLP = Math.min(HIGH_PRIORITY_CAPACITY / 4, sizeLP)
    const numItemsToGetFromBacklog = vacanciesHP - numItemsToGetFromLP

    for (let i = 0; i < numItemsToGetFromLP; i++) {
      const item = this.connection.dequeueFromLowPriorityWorkingSet(deck)
      this.connection.enqueueIntoHighPriorityWorkingSet(deck, item)
    }

    for (let i = 0; i < numItemsToGetFromBacklog; i++) {
      const item = this.connection.popFromBacklog(deck)
      this.connection.enqueueIntoHighPriorityWorkingSet(deck, item)
    }
  }
}

module.exports = new Store()