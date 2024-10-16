// src/helpers.ts
const randomElement = function (array) {
    console.log(array)
  let index = Math.floor(
    Math.random() * (array[Object.keys(array).pop()].maxIndex + 1)
  );
  for (let [userAgent, indexes] of Object.entries(array)) {
    if (index >= indexes.minIndex && index <= indexes.maxIndex) {
      return userAgent;
    }
  }
  return "No Agent Found";
};
const JSONIsFrequency = function (json) {
  const [userAgent, frequency] = Object.entries(json[Object.keys(json)[0]])[0];
  return !isNaN(frequency);
};
const JSONfrequencyNormalize = function (content2) {
  let contentParsed = {};
  for (let key in content2) {
    contentParsed[key] = {};
    let sortedFrequencies = Array.from(
      new Set(Object.values(content2[key]))
    ).sort();
    for (let [userAgent, frequency] of Object.entries(content2[key])) {
      contentParsed[key][userAgent] = sortedFrequencies.indexOf(frequency) + 1;
    }
  }
  return contentParsed;
};
const JSONinterval = function (content2) {
  let contentParsed = {};
  for (let key in content2) {
    contentParsed[key] = {};
    let minIndex = 0;
    for (let [userAgent, frequency] of Object.entries(content2[key])) {
      contentParsed[key][userAgent] = {
        minIndex,
        maxIndex: minIndex + frequency - 1,
      };
      minIndex = minIndex + frequency;
    }
  }
  return contentParsed;
};

import c from "https://unpkg.com/@tonyrl/rand-user-agent@2.0.81/data/user-agents.json" assert { type: 'json' };

let content = JSONfrequencyNormalize(c);
if (JSONIsFrequency(content)) {
  content = JSONinterval(content);
}
export const randUserAgent = function (
  device: string,
  browser: string | null = null,
  os: string | null = null
): string {
  let options: string[] = [];
  const keys = Object.keys(content);
  for (const index in keys) {
    let filter = true;
    if (keys[index].indexOf(device) === -1) {
      filter = false;
    }
    if (browser && keys[index].indexOf(browser) === -1) {
      filter = false;
    }
    if (os && keys[index].indexOf(os) === -1) {
      filter = false;
    }
    if (filter) {
      options.push(keys[index]);
    }
  }
  if (options.length === 0) {
    return randomElement(content);
  }
  return randomElement(
    content[options[Math.floor(Math.random() * options.length)]]
  );
};
