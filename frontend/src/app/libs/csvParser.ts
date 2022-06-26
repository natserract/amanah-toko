import formatISO from "date-fns/formatISO"
import { formatDate } from "../../utils/format";

const dateFormat = (date: number | Date) => {
  const iso = formatISO(date);
  return formatDate(iso)
}

export function flattenObject(ob: any) {
  var toReturn: any = {}

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue

    if (typeof ob[i] == 'object' && ob[i] !== null) {
      var flatObject = flattenObject(ob[i])
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue

        toReturn[i + '.' + x] = flatObject[x]
      }
    } else {
      toReturn[i] = ob[i]
    }
  }
  return toReturn
}

export const replacer = (key: string, value: string) =>
  value === null || value === undefined ? '' : value

export function csvDownload(dataset: Array<object>) {
  const date = new Date()
  const filename = `Export Data Amanah Toko ${date.toISOString()}`

  if (!dataset.length) return
  let flattenDataset = dataset.map((x: any) => flattenObject(x))
  const getHeader = flattenDataset.reduce(function (a, b) {
    return Object.keys(a).length > Object.keys(b).length ? a : b
  })

  let header = Object.keys(getHeader)
  let csv: Array<string> = flattenDataset.map((row) =>
    header
      .map((fieldName) => JSON.stringify(row[fieldName], replacer))
      .join(', ')
  )
  csv.unshift(header.join(', '))
  const csvString: string = csv.join('\n')
  var csvData = new Blob([csvString], {
    type: 'text/csv',
  })
  var csvUrl = URL.createObjectURL(csvData)
  var link = document.createElement('a')
  link.setAttribute('href', csvUrl)
  link.setAttribute('download', filename + '.csv')
  document.body.appendChild(link)

  link.click()
}

export function downloadList(dataset: Array<object>) {
  const date = new Date()
  const filename = `Export Data Amanah Toko ${date.toISOString()}`

  const selectedHeaders: string | string[] = []
  const dontInclude: string | string[] = []

  if (!dataset.length) return
  let flattenDataset = dataset.map((x: any) => flattenObject(x))
  const getHeader = flattenDataset.reduce(function (a, b) {
    return Object.keys(a).length > Object.keys(b).length ? a : b
  })

  let header = Object.keys(getHeader)
  header = header.filter(function(item,) {
    return selectedHeaders.includes(item)
  }).filter(function(item,) {
    return !dontInclude.includes(item.split(".")[item.split(".").length - 1])
  })
  let csv: Array<string> = flattenDataset.map((row) =>
    header
      .map(function(fieldName) {
        let item = row[fieldName]
        if (fieldName.includes("created_at")) {
          item = dateFormat(row[fieldName])
        }
        return JSON.stringify(item, replacer)
      })
      .join(',')
  )
  csv.unshift(header.join(','))
  const csvString: string = csv.join('\n')
  var csvData = new Blob([csvString], {
    type: 'text/csv',
  })
  var csvUrl = URL.createObjectURL(csvData)
  var link = document.createElement('a')
  link.setAttribute('href', csvUrl)
  link.setAttribute('download', filename + '.csv')
  document.body.appendChild(link)

  link.click()
}
