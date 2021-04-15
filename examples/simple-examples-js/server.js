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
// > kar run -app demo -service myService node server.js

const express = require('express')

// Create an express application.
const app = express()

// Parse request bodies with application/json content type to json.
app.use(express.json())

// A route that accepts json and returns text/plain.
app.post('/hello', (req, res) => { res.send(`Hello ${req.body.name}!`) })

// Start server on port $KAR_APP_PORT.
console.log('Starting server...')
app.listen(process.env.KAR_APP_PORT, process.env.KAR_APP_HOST || '127.0.0.1')
