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

// In another console window run:
// > kar run -app demo node client.js

const { actor } = require('kar-sdk')

async function main() {
  // Call the add method of the Accumulator actor.
  await actor.call(actor.proxy('Accumulator', 'myInstance'), 'add', 42)

  // Call and log the get method of the Accumulator actor to check correctness.
  console.log(await actor.call(actor.proxy('Accumulator', 'myInstance'), 'get'))

  // Call the add method of the PersistentAccumulator actor.
  await actor.call(actor.proxy('PersistentAccumulator', 'anotherInstance'), 'add', 42)

  // Call and log the get method of the PersistentAccumulator actor to check correctness.
  console.log(await actor.call(actor.proxy('PersistentAccumulator', 'anotherInstance'), 'get'))

  // Destroy actor instance with its persistent state.
  await actor.remove(actor.proxy('PersistentAccumulator', 'anotherInstance'))

  process.exit()
}

main()
