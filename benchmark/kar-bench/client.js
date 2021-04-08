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

const { actor, sys, call } = require('kar-sdk')

if (!process.env.KAR_RUNTIME_PORT) {
  console.error('KAR_RUNTIME_PORT must be set. Aborting.')
  process.exit(1)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function measureCall(numDiscardedCalls, numTimedCalls) {
  // Result:
  sumOfAllCalls = 0

  // Variables created once.
  var result

  // Perform requests discarding the first numDiscardedCalls.
  for (let i = 0; i < numDiscardedCalls + numTimedCalls; i++) {
    var start = Date.now();
    result = await call('bench', 'bench-json', { 'body': 'test' })
    await result
    var callDuation = Date.now() - start;

    // Postprocessing.
    if (i >= numDiscardedCalls) {
      sumOfAllCalls += callDuation
      if (numTimedCalls < 50) {
        console.log(`Durations: ${i - numDiscardedCalls}: ${callDuation} ms`)
      }
    }
    await sleep(100)
  }
  return sumOfAllCalls
}

async function measureOneWayCall(numDiscardedCalls, numTimedCalls) {
  // Results:
  sumOfAllRequests = 0
  sumOfAllResponses = 0

  // Create variables once.
  var result
  var remoteStamp, localStamp

  // Perform requests discarding the first numDiscardedCalls.
  for (let i = 0; i < numDiscardedCalls + numTimedCalls; i++) {
    var start = Date.now();
    result = await call('bench', 'bench-json-one-way', { 'body': 'test' })
    remoteStamp = await result
    localStamp = Date.now();

    // Postprocessing.
    // HTTP2: if enabled then the stamp needs to be extracted from the body
    // explicitly otherwise the time stamp will be in remoteStamp.
    remoteStamp = remoteStamp.body

    var oneWayCall = parseInt(remoteStamp) - start;
    var responseCall = localStamp - parseInt(remoteStamp)
    if (i >= numDiscardedCalls) {
      sumOfAllRequests += oneWayCall
      sumOfAllResponses += responseCall
      if (numTimedCalls < 50) {
        console.log(`Durations: ${i - numDiscardedCalls}: ${oneWayCall} ms`)
      }
    }
    await sleep(100)
  }
  return [sumOfAllRequests, sumOfAllResponses]
}

async function measureActorCall(numDiscardedCalls, numTimedCalls) {
  // Result:
  sumOfAllCalls = 0

  // Variables created once.
  var response
  var actorClass = actor.proxy('BenchActor', 'TestActor')

  // Perform requests discarding the first numDiscardedCalls.
  for (let i = 0; i < numDiscardedCalls + numTimedCalls; i++) {
    var start = Date.now();
    response = await actor.call(actorClass, 'simpleMethod')
    var callDuation = Date.now() - start;

    // Postprocessing.
    if (i >= numDiscardedCalls) {
      sumOfAllCalls += callDuation
      if (numTimedCalls < 50) {
        console.log(`Durations: ${i - numDiscardedCalls}: ${callDuation} ms`)
      }
    }
    await sleep(100)
  }

  // Remove actor.
  await actor.remove(actorClass)
  return sumOfAllCalls
}

async function measureActorOneWayCall(numDiscardedCalls, numTimedCalls) {
  // Results:
  sumOfAllRequests = 0
  sumOfAllResponses = 0

  // Create variables once.
  var result
  var remoteStamp, localStamp
  var actorClass = actor.proxy('BenchActor', 'AnotherTestActor')

  // Perform requests discarding the first numDiscardedCalls.
  for (let i = 0; i < numDiscardedCalls + numTimedCalls; i++) {
    var start = Date.now();
    remoteStamp = await actor.call(actorClass, 'timedMethod')
    localStamp = Date.now();

    // Postprocessing.
    var oneWayCall = parseInt(remoteStamp) - start;
    var responseCall = localStamp - parseInt(remoteStamp)
    if (i >= numDiscardedCalls) {
      sumOfAllRequests += oneWayCall
      sumOfAllResponses += responseCall
      if (numTimedCalls < 50) {
        console.log(`Durations: ${i - numDiscardedCalls}: ${oneWayCall} ms`)
      }
    }
    await sleep(100)
  }

  // Remove actor.
  await actor.remove(actorClass)
  return [sumOfAllRequests, sumOfAllResponses]
}

// main method
async function main() {
  numTimedCalls = 100
  sumOfAllCalls = await measureCall(10, numTimedCalls)
  averageCallDuration = sumOfAllCalls / numTimedCalls
  console.log(`Average service call duration: ${averageCallDuration} ms`)

  {
    let [sumOfAllRequests, sumOfAllResponses] = await measureOneWayCall(10, numTimedCalls)
    averageRequestDuration = sumOfAllRequests / numTimedCalls
    averageResponseDuration = sumOfAllResponses / numTimedCalls
    console.log(`Average service request duration: ${averageRequestDuration} ms`)
    console.log(`Average service response duration: ${averageResponseDuration} ms`)
  }

  sumOfAllCalls = await measureActorCall(10, numTimedCalls)
  averageCallDuration = sumOfAllCalls / numTimedCalls
  console.log(`Average actor call duration: ${averageCallDuration} ms`)

  {
    let [sumOfAllRequests, sumOfAllResponses] = await measureActorOneWayCall(10, numTimedCalls)
    averageRequestDuration = sumOfAllRequests / numTimedCalls
    averageResponseDuration = sumOfAllResponses / numTimedCalls
    console.log(`Average actor request duration: ${averageRequestDuration} ms`)
    console.log(`Average actor response duration: ${averageResponseDuration} ms`)
  }

  await sys.shutdown()
}

// invoke main
main()
