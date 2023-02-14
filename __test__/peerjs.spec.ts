import { describe, expect, it } from "@jest/globals";

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
		expect.assertions(1);
    let resolver: () => void;
    let rejecter: (err: unknown) => void;
    const promise = new Promise<void>((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });

    const ls = spawn('node', [path.join(__dirname, '../', 'dist/bin/peerjs.js'), '--port', PORT]);
      ls.stdout.on('data', async (data: string) => {
      if (!data.includes('Started')) return;

      try {
        const resp = await makeRequest();
        expect(resp).toEqual(expectedJson);
        resolver();
      } catch (error) {
        rejecter(error);
      } finally {
        ls.kill('SIGKILL');
      }
    });

    return promise;
  });
});
