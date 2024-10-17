import { getLogFromRequest,getReportURL } from './sdk.ts'


const log = getLogFromRequest(new Request('http://localhost:3000/test'), '127.0.0.1')
const url  = getReportURL('http://localhost:8000',log)
console.log(url);

fetch(url)