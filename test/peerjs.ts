import { expect } from 'chai';
import http from 'http';
import expectedJson from '../app.json';
import { spawn } from 'child_process';
import path from 'path';

const PORT = '9000';

async function makeRequest() {
  return new Promise<object>((resolve, reject) => {
    http.get(`http://localhost:${PORT}/`, resp => {
      let data = '';

      resp.on('data', chunk => {
        data += chunk;
      });

      resp.on('end', () => {
        resolve(JSON.parse(data));
      });

    }).on("error", err => {
      console.log("Error: " + err.message);
      reject(err);
    });
  });
}

describe('Check bin/peerjs', () => {
  it('should return content of app.json file', async () => {
    let resolver: () => void;
    let rejecter: (err: Error) => void;
    const promise = new Promise<void>((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });

    const ls = spawn('node', [path.join(__dirname, '../', 'bin/peerjs'), '--port', PORT]);

    ls.stdout.on('data', async (data: string) => {
      if (!data.includes('Started')) return;

      try {
        const resp = await makeRequest();
        expect(resp).to.deep.eq(expectedJson);
        resolver();
      } catch (error) {
        rejecter(error);
      } finally {
        ls.kill('SIGINT');
      }
    });

    return promise;
  });
});
