const ones = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];
const tens = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];
const teens = [
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

/**
 * Convert a number to words
 * @param {number} num The number to convert
 * @returns {string} The number in words
 */
function convertNumberToWords(num) {
  if (num === 0) {
    return "zero";
  }

  if (num < 0) {
    return "minus " + convertNumberToWords(Math.abs(num));
  }

  let words = "";

  if (Math.floor(num / 1000000) > 0) {
    words += convertNumberToWords(Math.floor(num / 1000000)) + " million ";
    num %= 1000000;
  }

  if (Math.floor(num / 1000) > 0) {
    words += convertNumberToWords(Math.floor(num / 1000)) + " thousand ";
    num %= 1000;
  }

  if (Math.floor(num / 100) > 0) {
    words += convertNumberToWords(Math.floor(num / 100)) + " hundred ";
    num %= 100;
  }

  if (num > 0) {
    if (words !== "") {
      words += "and ";
    }

    if (num < 10) {
      words += ones[num];
    } else if (num >= 10 && num < 20) {
      words += teens[num - 10];
    } else {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) {
        words += "-" + ones[num % 10];
      }
    }
  }

  return words;
}

export default convertNumberToWords;
