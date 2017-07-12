"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var singlesMedicareLevyThreshold1 = 21655;

// code to obtain the query from URL
// taken from https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// var taxTblMap = new Map();

// // setting the values
// taxTblMap.set(2016, [
// 	[18200, 37000, 87000, 180000],
// 	[0, 0.19, 0.325, 0.37, 0.45],
// 	[0, 0, 3572, 19822, 54232]
// 	] );

//calculate tax
function incomeTax(income) {
  var incomeBracket = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [18200, 37000, 87000, 180000, Infinity];
  var baseTax = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0, 3572, 19822, 54232];
  var marginalRate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [0, 0.19, 0.325, 0.37, 0.45];

  var bracket = incomeBracket.findIndex(function (incomeThreshold) {
    return this <= incomeThreshold;
  }, income);
  if (bracket == 0) return 0;
  return baseTax[bracket] + marginalRate[bracket] * (income - incomeBracket[bracket - 1]);
}

// incomeBracket = [18200, 37000, 87000, 180000, Infinity]
// income = 180000
// incomeTax(30000, incomeBracket, [0, 0, 3572, 19822, 54232], [0, 0.19, 0.325, 0.37, 0.45])

// calculate salary given tax
function taxToSalary(tax) {
  var incomeBracket = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [18200, 37000, 87000, 180000, Infinity];
  var baseTax = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0, 3572, 19822, 54232];
  var marginalRate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [0, 0.19, 0.325, 0.37, 0.45];

  if (tax <= 0) return 0;

  var taxBracket = [];

  var i = baseTax.findIndex(function (taxThreshold) {
    return this <= taxThreshold;
  }, tax);

  if (i == 0) return 0;else if (i == -1) i = incomeBracket.length;

  var marginalIncome = (tax - baseTax[i - 1]) / marginalRate[i - 1];

  // console.log(baseTax[i-1], marginalRate[i - 1], incomeBracket[i-1])
  return incomeBracket[i - 2] + marginalIncome;
}

// converts postTax income to salary
function postTaxToSalary(postTax) {
  var incomeBracket = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [18200, 37000, 87000, 180000, Infinity];
  var baseTax = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0, 3572, 19822, 54232];
  var marginalRate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [0, 0.19, 0.325, 0.37, 0.45];


  // build a postTax bracket
  var postTaxBracket = [];
  incomeBracket.forEach(function (inc, i, incArr) {
    var prevIncThreshold = 0;
    if (i > 0) prevIncThreshold = incArr[i - 1];

    // if Infinity is in the incomeBracket then postTaxBracket should be shorter by 1 in length
    if (isFinite(inc)) {
      postTaxBracket.push(inc - baseTax[i] - (inc - prevIncThreshold) * marginalRate[i]);
    }
  });

  postTaxBracket.push(Infinity);

  var i = postTaxBracket.findIndex(function (postTaxThreshold) {
    return this <= postTaxThreshold;
  }, postTax);

  //console.log(postTaxBracket)
  //console.log(i)

  ///if(i == -1) i = incomeBracket.length-1

  var incomeThreshold = i == 0 ? 0 : incomeBracket[i - 1];

  //console.log([baseTax[i], incomeThreshold,marginalRate[i]])

  return (postTax + baseTax[i] - incomeThreshold * marginalRate[i]) / (1 - marginalRate[i]);
}

function unAnnualiseSalaryFactor(frequency) {
  var mult;
  switch (frequency) {
    case "Monthly":
      mult = 1 / 12;break;
    case "Fornightly":
      mult = 1 / 26;break;
    case "Weekly":
      mult = 1 / 52;break;
    case "Daily":
      mult = 1 / 250;break;
    default:
      mult = 1;
  }
  return mult;
}

function annualiseSalaryFactor(frequency) {
  var mult;
  switch (frequency) {
    case "Monthly":
      mult = 12;break;
    case "Fornightly":
      mult = 26;break;
    case "Weekly":
      mult = 52;break;
    case "Day Rate":
      mult = 250;break;
    default:
      mult = 1;
  }
  return mult;
}

function annualiseSalary(salary, frequency) {
  return salary * annualiseSalaryFactor(frequency);
}

function unAnnualiseSalary(annualSalary, frequency) {
  return annualSalary / annualiseSalaryFactor(frequency);
}

function medicareLevy(annualSalary) {
  var medicareLevyRate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.02;
  var singlesMedicareLevyThreshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : singlesMedicareLevyThreshold1;

  return annualSalary <= singlesMedicareLevyThreshold ? 0 : annualSalary * medicareLevyRate;
}

//React JS calculator class

var TaxCalculator = function (_React$Component) {
  _inherits(TaxCalculator, _React$Component);

  function TaxCalculator(props) {
    _classCallCheck(this, TaxCalculator);

    var _this = _possibleConstructorReturn(this, (TaxCalculator.__proto__ || Object.getPrototypeOf(TaxCalculator)).call(this, props));

    _this.handleSalaryInputChange = _this.handleSalaryInputChange.bind(_this);
    _this.handleTaxInputChange = _this.handleTaxInputChange.bind(_this);
    _this.handlePostTaxChange = _this.handlePostTaxChange.bind(_this);
    _this.handleFreqChange = _this.handleFreqChange.bind(_this);

    var newTax = incomeTax(props.salary);
    _this.state = {
      frequency: "Annual",
      salaryInput: props.salary,
      salary: props.salary,
      tax: newTax,
      taxInput: newTax,
      medicareLevy: medicareLevy(props.salary),
      medicareLevyInput: medicareLevy(props.salary),
      superannuation: props.salary * props.super_pct / 100,
      superannuationInput: props.salary * props.super_pct / 100,
      super_pct: props.super_pct,
      postTax: props.salary - incomeTax(props.salary) - props.salary * 0.02,
      postTaxInput: props.salary - incomeTax(props.salary) - props.salary * 0.02
    };
    return _this;
  }

  _createClass(TaxCalculator, [{
    key: "handleFreqChange",
    value: function handleFreqChange(e) {
      var newFrequency = e.target.value;

      var newSalaryInput = unAnnualiseSalary(this.state.salary, newFrequency);
      var newTaxInput = Math.round(unAnnualiseSalary(incomeTax(this.state.salary), newFrequency));
      var newMedicareLevy = medicareLevy(this.state.salary);
      var newMedicareLevyInput = unAnnualiseSalary(newMedicareLevy, newFrequency);
      var newPostTaxInput = newSalaryInput - newTaxInput - newMedicareLevyInput;
      var newSuper = Math.round(this.state.salary * this.state.super_pct / 100);
      this.setState({
        salaryInput: Math.round(newSalaryInput),
        taxInput: Math.round(newTaxInput),
        postTaxInput: Math.round(newPostTaxInput),
        frequency: newFrequency,
        medicareLevyInput: newMedicareLevyInput,
        superannuationInput: unAnnualiseSalary(newSuper, newFrequency)
      });
    }
  }, {
    key: "handleSalaryInputChange",
    value: function handleSalaryInputChange(e) {
      try {
        var newSalaryInput = eval(e.target.value);
      } catch (err) {
        //do nothing
        //console.log(err)
      }
      if (isFinite(newSalaryInput)) {
        var newSalary = annualiseSalary(newSalaryInput, this.state.frequency);
        var newTax = incomeTax(newSalary);
        var newMedicareLevy = medicareLevy(newSalary);
        var newPostTax = newSalary - newTax - newMedicareLevy;

        var newTaxInput = Math.round(unAnnualiseSalary(newTax, this.state.frequency));
        var newMedicareLevyInput = unAnnualiseSalary(newMedicareLevy, this.state.frequency);
        var newPostTaxInput = newSalaryInput - newTaxInput - newMedicareLevyInput;
        var newSuper = Math.round(newSalary * this.state.super_pct / 100);

        this.setState({
          salary: Math.round(newSalary),
          salaryInput: e.target.value,
          tax: Math.round(newTax),
          taxInput: newTaxInput,
          postTax: Math.round(newPostTax),
          postTaxInput: newPostTaxInput,
          medicareLevy: Math.round(newMedicareLevy),
          superannuation: newSuper,
          medicareLevyInput: newMedicareLevyInput,
          superannuationInput: unAnnualiseSalary(newSuper, this.state.frequency)
        });
      } else {
        this.setState({
          salaryInput: e.target.value
        });
      }
    }
  }, {
    key: "handleTaxInputChange",
    value: function handleTaxInputChange(e) {
      try {
        var newTaxInput = eval(e.target.value);
      } catch (err) {}

      if (isFinite(newTaxInput)) {
        var newTax = annualiseSalary(newTaxInput, this.state.frequency);
        var newSalary = taxToSalary(newTax);
        var newMedicareLevy = newSalary * 0.02;
        var newPostTax = newSalary - newTax - newMedicareLevy;

        var newSuper = Math.round(newSalary * this.state.super_pct / 100);

        this.setState({
          salary: Math.round(newSalary),
          salaryInput: Math.round(unAnnualiseSalary(newSalary, this.state.frequency)),
          tax: Math.round(newTax),
          taxInput: e.target.value,
          postTax: Math.round(newPostTax),
          postTaxInput: Math.round(unAnnualiseSalary(newPostTax, this.state.frequency)),
          medicareLevy: Math.round(newMedicareLevy),
          superannuation: newSuper,
          medicareLevyInput: unAnnualiseSalary(newMedicareLevy, this.state.frequency),
          superannuationInput: unAnnualiseSalary(newSuper, this.state.frequency)
        });
      } else {
        this.setState({ taxInput: e.target.value });
      }
    }
  }, {
    key: "handlePostTaxChange",
    value: function handlePostTaxChange(e) {
      try {
        var newPostTaxInput = eval(e.target.value);
      } catch (err) {}

      if (isFinite(newPostTaxInput)) {
        var newPostTax = annualiseSalary(newPostTaxInput, this.state.frequency);
        var newSalary = postTaxToSalary(newPostTax);
        var newTax = incomeTax(newSalary);
        var newMedicareLevy = medicareLevy(newSalary);
        var newSuper = Math.round(newSalary * this.state.super_pct / 100);

        this.setState({
          salary: Math.round(newSalary),
          tax: Math.round(newTax),
          postTax: e.target.value,
          medicareLevy: Math.round(newMedicareLevy),
          superannuation: Math.round(newSalary * this.state.super_pct / 100),
          salaryInput: Math.round(unAnnualiseSalary(newSalary, this.state.frequency)),
          taxInput: Math.round(unAnnualiseSalary(newTax, this.state.frequency)),
          postTaxInput: e.target.value,
          medicareLevyInput: Math.round(unAnnualiseSalary(newMedicareLevy, this.state.frequency)),
          superannuationInput: Math.round(unAnnualiseSalary(newSuper, this.state.frequency))
        });
      } else {
        this.setState({ postTaxInput: e.target.value });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var salary = this.state.salary;
      var tax = this.state.tax;
      var medicareLevy = this.state.medicareLevy;
      var superannuation = this.state.superannuation;
      var super_pct = this.state.super_pct;
      var postTax = this.state.postTax;
      var salaryInput = this.state.salaryInput;
      var taxInput = this.state.taxInput;
      var postTaxInput = this.state.postTaxInput;
      var medicareLevyInput = this.state.medicareLevyInput;
      var superannuationInput = this.state.superannuationInput;

      return React.createElement(
        "form",
        null,
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "div",
            { className: "two columns" },
            React.createElement(
              "label",
              { htmlFor: "frequency" },
              "Frequency"
            ),
            React.createElement(
              "select",
              { className: "u-full-width", id: "frequency", onChange: this.handleFreqChange },
              React.createElement(
                "option",
                { value: "Annual" },
                "Annual"
              ),
              React.createElement(
                "option",
                { value: "Monthly" },
                "Monthly"
              ),
              React.createElement(
                "option",
                { value: "Fornightly" },
                "Fornightly"
              ),
              React.createElement(
                "option",
                { value: "Weekly" },
                "Weekly"
              ),
              React.createElement(
                "option",
                { value: "Day Rate" },
                "Day Rate"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "two columns" },
            React.createElement(
              "label",
              { htmlFor: "salaryInput" },
              "Salary $",
              Math.round(eval(salary)).toLocaleString(),
              " "
            ),
            React.createElement("input", { className: "u-full-width", placeholder: Math.round(salaryInput), value: salaryInput, id: "salaryInput", onChange: this.handleSalaryInputChange })
          ),
          React.createElement(
            "div",
            { className: "two columns" },
            React.createElement(
              "label",
              { htmlFor: "taxInput" },
              "Tax $",
              Math.round(eval(tax)).toLocaleString(),
              " "
            ),
            React.createElement("input", { className: "u-full-width", placeholder: Math.round(tax), value: taxInput, id: "taxInput", onChange: this.handleTaxInputChange })
          ),
          React.createElement(
            "div",
            { className: "two columns" },
            React.createElement(
              "label",
              { htmlFor: "afterTaxInput" },
              "Post tax $",
              Math.round(eval(postTax)).toLocaleString(),
              " "
            ),
            React.createElement("input", { className: "u-full-width", value: postTaxInput, id: "afterTaxInput", onChange: this.handlePostTaxChange })
          ),
          React.createElement(
            "div",
            { className: "two columns" },
            React.createElement(
              "label",
              { htmlFor: "medicareLevy_show" },
              "Medicare Levy $",
              medicareLevy
            ),
            React.createElement(
              "div",
              { id: "medicareLevy_show" },
              Math.round(medicareLevyInput).toLocaleString()
            )
          ),
          React.createElement(
            "div",
            { className: "two columns" },
            React.createElement(
              "label",
              { htmlFor: "superannuation_show" },
              "Superannuation $",
              superannuation.toLocaleString(),
              " @ ",
              super_pct,
              "% "
            ),
            React.createElement(
              "div",
              { id: "superannuation_show" },
              Math.round(superannuationInput)
            )
          )
        ),
        React.createElement("div", { className: "row" })
      );
    }
  }]);

  return TaxCalculator;
}(React.Component);

ReactDOM.render(React.createElement(
  "div",
  null,
  React.createElement(
    "div",
    { className: "row" },
    React.createElement(
      "h5",
      null,
      " Calculation 1"
    )
  ),
  React.createElement(TaxCalculator, { salary: "78000", super_pct: "9.5" }),
  React.createElement(
    "h5",
    null,
    " Calculation 2"
  ),
  React.createElement(TaxCalculator, { salary: "65000", super_pct: "9.5" })
), document.getElementById('root'));