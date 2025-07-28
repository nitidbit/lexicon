import { KeyPath } from '../collection'
import uniq from 'lodash/uniq'

class KeysAndDates {
  public timeMillis:number // milliseconds since epoch
  public keyPath:string

  constructor(time, keyPath) {
    this.timeMillis = time
    this.keyPath = keyPath
  }

}

export class RecentKeyTracker {
  protected  keysAndDates:Array<KeysAndDates>

  constructor() {
    this.keysAndDates = []
  }

  add(keyPath, timestamp:number=null) {
    timestamp ||= Date.now()

    this.keysAndDates.push(new KeysAndDates(timestamp, keyPath))
  }

  recent() {
    this.cullOldEntries()
    return uniq(
      this.keysAndDates
        .map( keyAndDate => keyAndDate.keyPath )
        .sort()
    )
  }

  cullOldEntries(ageFilterSec=3) {
    // Find first entry that's not too old
    const thresholdMillis = Date.now() - ageFilterSec * 1000
    const firstRecentIndex = this.keysAndDates.findIndex(
      keyAndDate => keyAndDate.timeMillis > thresholdMillis )

    // delete entries 0..(not too old)-1
    this.keysAndDates = this.keysAndDates.slice(firstRecentIndex)
  }
}
