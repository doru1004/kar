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

const { call } = require('kar-sdk')

async function main() {
  // Call to myService's hello endpoint.
  const result = await call('myService', 'hello', { name: 'John' })

  // Log result of service invocation.
  console.log(result)

  process.exit()
}

main()
