import { getLogFromRequest, getReportURL } from "./sdk.ts";

const log = getLogFromRequest(
  new Request("http://localhost:3000/test"),
  "127.0.0.1",
  "8888"
);
const url = getReportURL("http://localhost:8000", log);
fetch(url);

fetch("http://localhost:8000?events=8888", { method: "post" })
  .then((res) => res.json())
  .then((res) => {
    console.log(res);
  });
