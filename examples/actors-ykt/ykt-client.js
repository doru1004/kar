const { actor, shutdown, broadcast } = require('kar')

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const truthy = s => s && s.toLowerCase() !== 'false' && s !== '0'

async function testTermination (failure) {
  if (failure) {
    console.log('FAILED; setting non-zero exit code')
    process.exitCode = 1
  } else {
    console.log('SUCCESS')
    process.exitCode = 0
  }

  if (!truthy(process.env.KUBERNETES_MODE)) {
    console.log('Requesting server shutdown')
    await broadcast('shutdown')
  }

  console.log('Terminating sidecar')
  await shutdown()
}

function prettyPrintHistogram (header, bucketSizeInMS, histogram) {
  console.log(header)
  for (const i in histogram) {
    console.log(`\t<${(parseInt(i) + 1) * bucketSizeInMS}ms\t${histogram[i] || 0}`)
  }
}
async function main () {
  let failure = false

  const company = 'IBM'
  const researchDivision = {
    Yorktown: { workers: 20, thinkms: 2000, steps: 10, days: 2 },
    Cambridge: { workers: 10, thinkms: 1000, steps: 40, days: 1 },
    Almaden: { workers: 15, thinkms: 500, steps: 10, days: 5 }
  }

  console.log(`Starting simulation: ${JSON.stringify(researchDivision)}`)

  for (const site in researchDivision) {
    await actor.call('Site', site, 'resetDelayStats')
    await actor.call('Site', site, 'siteReport')
    await actor.call('Company', company, 'hire', Object.assign({ site }, researchDivision[site]))
  }

  while (true) {
    await sleep(5000)
    const employees = await actor.call('Company', 'IBM', 'count')
    console.log(`Num employees is ${employees}`)
    if (employees === 0) {
      for (const site in researchDivision) {
        console.log(`Valiadating ${site}`)
        const sr = await actor.call('Site', site, 'siteReport')
        if (sr.siteEmployees !== 0) {
          console.log(`FAILURE: ${sr.siteEmployees} stranded employees at ${site}`)
          failure = true
        }
        prettyPrintHistogram(`Reminder Delays for ${site}`, sr.delaysBucketMS, sr.reminderDelays)
        const count = sr.reminderDelays.reduce((x, y) => x + y, 0)
        const expectedSteps = researchDivision[site].workers * researchDivision[site].steps * researchDivision[site].days
        if (count !== expectedSteps) {
          console.log(`FAILURE: At ${site} expected ${expectedSteps} steps, but actual value is ${count}`)
          failure = true
        }
      }
      break
    }
  }

  testTermination(failure)
}

main()
