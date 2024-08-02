export const loadUrl = (url: URL) => {
  if (url.protocol === "file:") {
    return Deno.readFile(url);
  } else {
    return fetch(url).then((res) => res.arrayBuffer());
  }
};
