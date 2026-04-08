import { docIndexRegex, docIndexRegexG } from "../validation/general";

export function formatDocNum(docNum: string, index: number) {
  const now = new Date();
  const year = `${now.getFullYear()}`;
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  docNum = docNum.replace(/{Y}/g, year);
  docNum = docNum.replace(/{M}/g, month);
  docNum = docNum.replace(/{D}/g, day);

  const matches = [...docNum.matchAll(docIndexRegexG)];
  matches.forEach((match) => {
    let indexLength = parseInt(match[1]) || 1;
    if (indexLength < 1) indexLength = 1;
    if (indexLength > 16) indexLength = 16;
    const indexStr = `${index}`.padStart(indexLength, "0");
    docNum = docNum.replace(docIndexRegex, indexStr);
  });
  return docNum;
}
