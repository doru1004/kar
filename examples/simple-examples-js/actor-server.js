/*
 * Copyright IBM Corporation 2020,2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// In one console window run:
// > kar run -app demo -actors Accumulator,PersistentAccumulator node server.js

const express = require('express')
const { sys, actor } = require('kar-sdk')

// Create an express application.
const app = express()

class Accumulator {
    activate() { this.acc = 0 }
    add(v) { this.acc += v }
    get() { return this.acc }
}

class PersistentAccumulator {
    async activate() { this.acc = await actor.state.get(this, 'acc') | 0 }
    async add(v) { this.acc += v; await actor.state.set(this, 'acc', this.acc) }
    get() { return this.acc }
}

// Instantiate an actor runtime.
app.use(sys.actorRuntime({ Accumulator, PersistentAccumulator }))

// Start server on port $KAR_APP_PORT.
console.log('Starting server...')
app.listen(process.env.KAR_APP_PORT, process.env.KAR_APP_HOST || '127.0.0.1')
