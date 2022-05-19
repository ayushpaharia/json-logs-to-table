#!/usr/bin/env node
import fs from "fs"
process.env.UV_THREADPOOL_SIZE = "12"

const file_name = process.argv[2]

let readStream = fs.createReadStream(file_name, {
  encoding: "utf8",
})

let file_size = 0
fs.stat(file_name, (err, stats) => {
  if (err) {
    console.log(err)
  } else {
    file_size = stats.blocks * stats.blksize
  }
})

const columns = new Set() // To keep a check of how many columns were created
const isPrefixEmpty = (prefix: string, key: string): string => {
  // If prefix is empty(when first element)
  return prefix === "" ? key : `${prefix}.${key}`
}
const makeColumn = (obj_data: any, prefix_string: string) => {
  // For every object parsed
  Object.entries(obj_data).forEach(([key, value]) => {
    const prefix = isPrefixEmpty(prefix_string, key)
    if (value !== null && typeof value === "object") {
      makeColumn(value, prefix)
    } else {
      columns.add(prefix)
      let stream = fs.createWriteStream(`./logs/${prefix}.column`, {
        flags: "a",
      })
      // Streams are non-blocking and is hence good for working with huge log files
      stream.once("open", () => {
        stream.write(`${value}\n`)
        stream.end()
      })
    }
  })
}
const processLogs = (data: any) => {
  try {
    // parse JSON from a log
    const obj_data = JSON.parse(data)

    // Make columns
    makeColumn(obj_data, "")
  } catch (error) {
    return data
  }
}

let flag = false // to check if a cut log was used
let cutline = "" // for cut log
console.time("time")
readStream.once("open", () => {
  readStream.on("data", (chnk: string) => {
    let chunks = chnk.split("\n")

    // to make up for logs broken up because of chunk sizelimit
    cutline += chunks[0]
    processLogs(cutline)
    if (flag) {
      cutline = ""
      flag = false
    }

    chunks.slice(1).forEach((line) => {
      let cutstring = processLogs(line)
      if (cutstring !== undefined) {
        cutline += cutstring
        flag = true
      }
      let percentDone = (readStream.bytesRead * 100) / file_size
      console.log(`${percentDone.toPrecision(5)}%`)
    })
  })
  readStream.on("end", () => {
    console.timeEnd("time")
    console.log(columns.size, "columns were created\n")
    console.log({ bytes_read: readStream.bytesRead })
    readStream.close()
  })
})
