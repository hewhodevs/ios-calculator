// Note that this file depends on math.js
// for more info on math.js visit  https://mathjs.org/

// Calculator Registers Setup, used to store values
let register1 = "";
let register2 = "";
// store last clicked operation and input state
let operation = "";
let operationButton = "";
let awaitingInput = false;
let previousClickedButton = "";

// ------- Utility (light grey) button operations ----------

function acOnClick() {
  let acButton = document.getElementById("ac");
  animateButton(acButton);
  setDisplay("0");
  showAllClear();
  register1 = "";
  register2 = "";
  operation = "";
  notAwaitingInput(operationButton);
  previousClickedButton = acButton;
}

function plusMinusOnClick() {
  let plusMinusButton = document.getElementById("plus-minus");
  animateButton(plusMinusButton);
  let currentText = getDisplaytext();
  if (currentText !== "0") {
    if (currentText.charAt(0) === "-") {
      setDisplay(currentText.substr(1));
    } else {
      setDisplay("-" + currentText);
    }
  }
  previousClickedButton = plusMinusButton;
}

function decimalOnClick() {
  let decimalButton = document.getElementById("decimal");
  // handle button animation
  animateButton(decimalButton);

  let displayText = getDisplaytext();
  // dont allow multiple decimal points like 00.00.1
  if (displayText.includes(".") === false) {
    setDisplay(displayText + ".");
    showClear();
  }
  previousClickedButton = decimalButton;
}

function percentOnClick() {
  // need to handle the case of 8 - 6 % (which is 8-0.48 = 7.52)
  let percentButton = document.getElementById("percent");
  animateButton(percentButton);
  let displayValue = getDisplayValue();
  let percentValue;
  // dont convert already displayed "Error" results to a percentage
  if (getDisplaytext() === "Error") {
    return;
  }
  // case when % button is clicked immeadiately after inputting a number
  if (register1 === "" && register2 === "") {
    percentValue = math.divide(
      math.bignumber(displayValue),
      math.bignumber(100)
    );
  } else if (register1 !== "") {
    // Case where we need to calculate the percentage of the existing input
    // i.e. button combination 8 - 6 % ==> 8 - (0.06 * 8) ==> 8 - 0.48 = 7.52
    let percentage = math.divide(
      math.bignumber(displayValue),
      math.bignumber(100)
    );
    percentValue = math.multiply(percentage, register1);
  }
  percentValue = math.format(percentValue);
  let formattedResult = formatNumber(percentValue);
  setDisplay(parseFloat(formattedResult));
  previousClickedButton = percentButton;
}

// ------- Dark grey buttons (numbers) functions ----------

function numberOnClick(numberButton) {
  animateButton(numberButton);
  // handle the button input
  let number = numberButton.textContent;
  let displayText = getDisplaytext();
  if (displayText.length > 8 && awaitingInput === false) {
    // do nothing as 9 digit input max reached and not awaiting a new input
  } else if (displayText === "0") {
    // catch rolling start 0's like 00001
    if (number !== "0") {
      setDisplay(number);
      showClear();
    }
  } else if (awaitingInput === true) {
    // make operation revert to orange color if providing new input
    setDisplay(number);
    awaitingInput = false;
    notAwaitingInput(operationButton);
  } else {
    // else append new number to whats already showing
    setDisplay((displayText += number));
  }
  previousClickedButton = numberButton;
}

// ------- Orange button (operations) functions ----------

function divideOnClick() {
  let clickedButton = document.getElementById("divide");
  operationClicked("/", clickedButton);
}

function multiplyOnClick() {
  let clickedButton = document.getElementById("multiply");
  operationClicked("*", clickedButton);
}

function subtractionOnClick() {
  let clickedButton = document.getElementById("minus");
  operationClicked("-", clickedButton);
}

function additionOnClick() {
  let clickedButton = document.getElementById("plus");
  operationClicked("+", clickedButton);
}

function operationClicked(clickedOperation, clickedButton) {
  if (awaitingInput === true) {
    // support switching between operations (+, -, *, /) when clicked in succession
    operation = clickedOperation;
    notAwaitingInput(operationButton);
    showAwaitingInput(clickedButton);
  } else {
    if (operation !== "") {
      let result;
      register2 = getDisplayValue();
      if (operation === "+") {
        result = math.add(math.bignumber(register1), math.bignumber(register2));
      } else if (operation === "-") {
        result = math.subtract(
          math.bignumber(register1),
          math.bignumber(register2)
        );
      } else if (operation === "/") {
        result = math.divide(
          math.bignumber(register1),
          math.bignumber(register2)
        );
      } else if (operation === "*") {
        result = math.multiply(
          math.bignumber(register1),
          math.bignumber(register2)
        );
      }
      let formattedResult = formatNumber(result);
      setDisplay(formattedResult);
      register1 = result;
    } else {
      register1 = getDisplayValue();
    }
    operation = clickedOperation;
    showAwaitingInput(clickedButton);
  }
  previousClickedButton = clickedButton;
  console.log(`register 1: ${register1}`);
  console.log(`register 2: ${register2}`);
}

function equalsOnClick() {
  let equalsButton = document.getElementById("equals");
  animateButton(equalsButton);
  let operationButtonsids = ["divide", "multiply", "minus", "plus", "equals"];

  if (awaitingInput === true) {
    notAwaitingInput(operationButton);
  }
  // if we previously displayed an error result, any following operation will still result in Error
  if (register1 === "Error") {
    setDisplay("Error");
    previousClickedButton = equalsButton;
    return;
  }
  // if displaing Error, then skip (i.e. clicking equals does nothing in this case)
  if (getDisplaytext() !== "Error") {
    if (operation !== "") {
      // handle consecutive clicks of the equals / operation button (allows for operation repetition of the same increment);
      // i.e. 1 + 1 = 2 => + 1 = 3 => + 1 = 4 => etc
      if (operationButtonsids.indexOf(previousClickedButton.id) !== -1) {
        if (register2 === "") {
          register2 = getDisplayValue();
        }
      } else {
        register2 = getDisplayValue();
      }

      // perform calculation
      let result;
      if (register1 !== "Error") {
        if (operation === "+") {
          result = math.add(
            math.bignumber(register1),
            math.bignumber(register2)
          );
        } else if (operation === "-") {
          result = math.subtract(
            math.bignumber(register1),
            math.bignumber(register2)
          );
        } else if (operation === "/") {
          if (register2 === 0) {
            // divide by zero case
            result = "Error";
          } else {
            result = math.divide(
              math.bignumber(register1),
              math.bignumber(register2)
            );
          }
        } else if (operation === "*") {
          result = math.multiply(
            math.bignumber(register1),
            math.bignumber(register2)
          );
        }
        register1 = result;
        if (result === "Error") {
          setDisplay(result);
        } else {
          // format result from bignumber with mathjs
          result = math.format(result);
          // then check if result needs to be formatted as exponential
          let formattedResult = formatNumber(result);
          setDisplay(formattedResult);
        }
        awaitingInput = true;
      }
    }
  }
  previousClickedButton = equalsButton;
}

// ------- HELPER FUNCTIONS ----------

function getDisplayValue() {
  let display = document.getElementById("display-text");
  // remove any ',' characters first else parseFloat will return NaN
  let numberText = display.textContent.replace(",", "");
  return parseFloat(numberText);
}

function getDisplaytext() {
  return document.getElementById("display-text").textContent;
}

function setDisplay(str) {
  let display = document.getElementById("display-text");
  // confirm we were passes a string. If not convert the number we were passed to string
  if (typeof str !== "string") {
    str = str.toString();
  }
  // scale the font-size to fit the display screen depending on length of string
  display.textContent = str;
  if (str.length < 6) {
    display.style.fontSize = "90px";
  } else if (str.length < 7) {
    display.style.fontSize = "80px";
  } else if (str.length < 8) {
    display.style.fontSize = "74px";
  } else if (str.length < 9) {
    display.style.fontSize = "66px";
  } else {
    display.style.fontSize = "58px";
  }
}

function formatNumber(str) {
  if (typeof str !== "string") {
    str = str.toString();
  }
  let formattedResult = parseFloat(str);
  let positiveResult = formattedResult;
  if (positiveResult < 0) {
    // convert to a positive value to check magnitude in next step to determine if we need to convert to exponential
    positiveResult = positiveResult * -1;
  }
  // if num < 0.0000001 || num > 100000000
  // then convert to exponential to fit on display
  if (positiveResult < 0.0000001 || positiveResult > 100000000) {
    if (formattedResult !== 0) {
      // convert to exponential provided result is not equal to 0
      formattedResult = parseFloat(str).toExponential(4);
    }
  }
  // check for cases where we have trailing 0's i.e. 1.0000e+18
  // use toExponentila(0) to mimic functionality of iOS calulator results display i.e. 1e+18
  if (formattedResult.toString().substring(1, 7) === ".0000e") {
    formattedResult = parseFloat(str).toExponential(0);
  }
  // use replace to remove + for positive exponentials to mimic display of iOS calc for positice exponentials
  let resultString = formattedResult.toString().replace("+", "");

  // handle decimal results formatting, and decimal place location
  // i.e. test case Pi (22/7 = 3.14285714)
  // and test case 9999 / 22 = 454.5
  // and test case 78524 / 64 = 1226.9375
  if (resultString.length > 9) {
    // get index of decimal point
    let decimalCharIndex = resultString.indexOf(".");
    // get substring up to decimal point
    let integralString = resultString.substring(0, decimalCharIndex);
    // count substring for placeholder size
    let integralLength = integralString.length;
    // x in toFixed(x) = 9 - substring.length; (as can only display at most 9 characters on the calc display)
    formattedResult = formattedResult.toFixed(9 - integralLength);
  }
  return formattedResult.toString().replace("+", "");
}

function showAwaitingInput(button) {
  awaitingInput = true;
  button.className = "awaiting-input";
  operationButton = button;
}

function notAwaitingInput(button) {
  awaitingInput = false;
  button.className = "not-awaiting-input";
}

function showClear() {
  let acButton = document.getElementById("ac");
  acButton.textContent = "C";
}

function showAllClear() {
  let acButton = document.getElementById("ac");
  acButton.textContent = "AC";
}

function animateButton(myElement) {
  // restarts the button fade animation when fast clicks occur in quick succession
  // read about animation restarts at https://css-tricks.com/restart-css-animation/
  var newButton = myElement.cloneNode(true);
  myElement.parentNode.replaceChild(newButton, myElement);

  // manage button on click background fade animation, see https://stackoverflow.com/a/55346254
  newButton.classList.add("animating");
  var listener = newButton.addEventListener("animationend", function() {
    newButton.classList.remove("animating");
    newButton.removeEventListener("animationend", listener);
  });
}
