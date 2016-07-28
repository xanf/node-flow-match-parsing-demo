/* @flow */
import fetch from 'isomorphic-fetch';
import { Readable } from 'stream';
import debugFn from 'debug';

const debug = debugFn('match');

class MatchLogStream extends Readable {
  matchTime :number
  matchData: Array<Object>

  constructor(matchData: Array<Object>) {
    super({ objectMode: true });
    this.matchData = [...matchData];
    this.matchTime = 0;

  }

  _read() {
    debug('read requested');
    const nextEvent = this.matchData.shift();
    if (!nextEvent) {
      this.push(null);
      return;
    }

    const timeDifference = nextEvent.matchTime - this.matchTime;
    setTimeout(() => {
      debug('data arrived');
      this.push(nextEvent);
      this.matchTime = nextEvent.matchTime;
    }, timeDifference * 1000);
  }
}

async function start() {
  const data = await fetch('https://jambler.com/app/tournaments/520/dynamic')
    .then(r => r.json())
  ;
  const myMatchStream = new MatchLogStream(data.matchLog);
  // myMatchStream.on('data', event => {
  //   console.log(`[${event.matchTime}] ${event.info}`);
  // });

  // setInterval(() => {
  //   let event;
  //   while (event = myMatchStream.read()) {
  //     console.log(`[${event.matchTime}] ${event.info}`);
  //   }
  // }, 10000);

  myMatchStream.on('readable', () => {
    debug('event readable');
    setTimeout(() => {
      debug('actual read');
      let event;
      while (event = myMatchStream.read()) {
        console.log(`[${event.matchTime}] ${event.info}`);
      }
    }, 10000);
  });
}

start();
