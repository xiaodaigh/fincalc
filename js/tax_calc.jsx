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
function incomeTax(income, incomeBracket = [18200, 37000, 87000, 180000, Infinity], 
	baseTax = [0, 0, 3572, 19822, 54232], marginalRate=[0, 0.19, 0.325, 0.37, 0.45]) {
	var bracket = incomeBracket.findIndex(
		function(incomeThreshold) { return this <= incomeThreshold}, 
		income);
	if (bracket == 0) return 0
	return baseTax[bracket] + marginalRate[bracket]*(income - incomeBracket[bracket-1])
}

// incomeBracket = [18200, 37000, 87000, 180000, Infinity]
// income = 180000
// incomeTax(30000, incomeBracket, [0, 0, 3572, 19822, 54232], [0, 0.19, 0.325, 0.37, 0.45])

// calculate salary given tax
function taxToSalary(tax, incomeBracket = [18200, 37000, 87000, 180000, Infinity], 
	baseTax = [0, 0, 3572, 19822, 54232], marginalRate=[0, 0.19, 0.325, 0.37, 0.45]) {
	if( tax <= 0) return 0

	var taxBracket = []

	var i = baseTax.findIndex(
		function(taxThreshold) {
			return this <= taxThreshold
		} , tax )
	
	if (i == 0) return 0
	else if (i == -1) i = incomeBracket.length

	var marginalIncome = (tax - baseTax[i-1])/marginalRate[i - 1]

	// console.log(baseTax[i-1], marginalRate[i - 1], incomeBracket[i-1])
	return incomeBracket[i - 2] + marginalIncome
}


// converts postTax income to salary
function postTaxToSalary(postTax, incomeBracket = [18200, 37000, 87000, 180000, Infinity], 
	baseTax = [0, 0, 3572, 19822, 54232], marginalRate=[0, 0.19, 0.325, 0.37, 0.45]) {

	// build a postTax bracket
	var postTaxBracket = []
	incomeBracket.forEach(function(inc, i, incArr) {
		var prevIncThreshold = 0
		if(i > 0) prevIncThreshold = incArr[i-1]

		// if Infinity is in the incomeBracket then postTaxBracket should be shorter by 1 in length
		if(isFinite(inc)) {
			postTaxBracket.push(inc - baseTax[i] - (inc - prevIncThreshold)*marginalRate[i])
		}
		
	})

	postTaxBracket.push(Infinity)

	var i = postTaxBracket.findIndex(function(postTaxThreshold) {
		return(this <= postTaxThreshold)
	}, postTax)

	//console.log(postTaxBracket)
	//console.log(i)

	///if(i == -1) i = incomeBracket.length-1

	var incomeThreshold =  i == 0 ? 0 : incomeBracket[i-1]
		
	//console.log([baseTax[i], incomeThreshold,marginalRate[i]])

	return (postTax + baseTax[i] - incomeThreshold*marginalRate[i])/(1-marginalRate[i])
}


function unAnnualiseSalaryFactor(frequency) {
	var mult
	switch (frequency) {
  		case "Monthly" : mult =1/12; break;
  		case "Fornightly" : mult = 1/26;  break;
  		case "Weekly" : mult = 1/50;  break;
  		case "Daily" : mult = 1/250;  break;
  		default: mult = 1
  	}
  	return mult;
}

function annualiseSalaryFactor(frequency) {
	var mult
	switch (frequency) {
  		case "Monthly" : mult =12; break;
  		case "Fornightly" : mult = 26;  break;
  		case "Weekly" : mult = 52;  break;
  		case "Day Rate" : mult = 250;  break;
  		default: mult = 1
  	}
  	return mult;
}	

function annualiseSalary(salary, frequency) {
	return salary * annualiseSalaryFactor(frequency)
}

function unAnnualiseSalary(annualSalary, frequency) {
  	return annualSalary / annualiseSalaryFactor(frequency);
}

//React JS calculator class
class TaxCalculator extends React.Component {
  constructor(props) {
    super(props);
    this.handleSalaryInputChange = this.handleSalaryInputChange.bind(this);
    this.handleTaxInputChange = this.handleTaxInputChange.bind(this)
    this.handlePostTaxChange = this.handlePostTaxChange.bind(this)
    this.handleFreqChange = this.handleFreqChange.bind(this)
    
    var newTax = incomeTax(props.salary)
    this.state = {
    	frequency:"Annual",
    	salaryInput:props.salary,
    	salary: props.salary, 
    	tax : newTax, 
    	taxInput:newTax,
    	medicareLevy:props.salary*0.025, 
    	superannuation : props.salary * props.super_pct/100, 
    	super_pct : props.super_pct, 
    	postTax : props.salary  - incomeTax(props.salary) - props.salary*0.025,
    	postTaxInput:props.salary  - incomeTax(props.salary) - props.salary*0.025
    	};
  }

  handleFreqChange(e) {
  	var newFrequency = e.target.value

  	var newSalaryInput = unAnnualiseSalary(this.state.salary, newFrequency)
  	var newTaxInput = Math.round(unAnnualiseSalary(incomeTax(this.state.salary), newFrequency))
  	var newMedicareLevy = newSalaryInput * 0.025
  	var newPostTaxInput = newSalaryInput - newTaxInput - newMedicareLevy

  	
  	this.setState({
  		salaryInput: Math.round(newSalaryInput),
  		taxInput: Math.round(newTaxInput), 
  		postTaxInput : Math.round(newPostTaxInput),
  		frequency : newFrequency
  	})
  }

  handleSalaryInputChange(e) {
  	var newSalaryInput = eval(e.target.value)

    if (isFinite(newSalaryInput)) {
    	var newSalary = annualiseSalary(newSalaryInput, this.state.frequency)
    	var newTax = incomeTax(newSalary)
    	var newMedicareLevy = newSalary * 0.025	
    	var newPostTax = newSalary - newTax - newMedicareLevy

	  	var newTaxInput = Math.round(unAnnualiseSalary(newTax, frequency))
	  	var newMedicareLevy = newSalaryInput * 0.025
	  	var newPostTaxInput = newSalaryInput - newTaxInput - newMedicareLevy
	    	
    	this.setState({
	    	salary : Math.round(newSalary),
	    	salaryInput: e.target.value,
	    	tax: Math.round(newTax), 
	    	postTax: Math.round(newPostTax - newMedicareLevy),
	    	medicareLevy : Math.round(newMedicareLevy),
	    	superannuation : Math.round(newSalary * this.state.super_pct/100),
	    	taxInput:newTaxInput,
	    	postTaxInput:newPostTax
    	});
    } else {
    	this.setState({
    		salaryInput : e.target.value
    	})
    }
  }

  handleTaxInputChange(e) {
  	var newTaxInput = eval(e.target.value)
  
  	if (isFinite(newTaxInput)) {
  		var newTax = annualiseSalary(newTaxInput, this.state.newTaxInput)
  		var newSal = taxToSalary(newTax)
    	var newMedicareLevy = newSal * 0.025
    	var newPostTax = newSal - newTax - newMedicareLevy
  		this.setState({
  			salary : Math.round(newSal), 
  			salaryInput : Math.round(newSal), 
  			tax : Math.round(newTax),
  			taxInput: e.target.value, 
  			postTax : Math.round(newPostTax),
  			medicareLevy : Math.round(newMedicareLevy),
  			superannuation : Math.round(newSal * this.state.super_pct/100)});
  	} else {
  		this.setState({taxInput: e.target.value});
  	}
  }

  handlePostTaxChange(e) {
  	var newPostTaxInput = eval(e.target.value)

  	if (isFinite(newPostTaxInput)) {
  		var newPostTax = annualiseSalary(newPostTaxInput, this.state.frequency)
  		var newSalary = postTaxToSalary(newPostTax);
  		var newTax = incomeTax(newSalary)
		var newMedicareLevy = newSalary * 0.025	
  		this.setState({
  			salary : Math.round(newSalary),
  			tax: Math.round(newTax), 
  			postTax:e.target.value, 
  			medicareLevy : newMedicareLevy,
  			superannuation : newSalary * this.state.super_pct/100,
  			salaryInput : unAnnualiseSalary(newSalary, this.state.frequency),
  			taxInput : unAnnualiseSalary(newTax, this.state.frequency),
  			postTaxInput : e.target.value
  		});
  	} else {
  		this.setState({postTaxInput: e.target.value});
  	}
  }

  render() {
    const salary = this.state.salary;
    const tax = this.state.tax;
    const medicareLevy = this.state.medicareLevy;
    const superannuation = this.state.superannuation;
    const super_pct = this.state.super_pct;
    const postTax = this.state.postTax;
    const salaryInput = this.state.salaryInput
    const taxInput = this.state.taxInput
    const postTaxInput = this.state.postTaxInput

    return (
     <form> 
     	<div className="row">
			<div className="two columns">
				<label htmlFor="frequency">Frequency</label>
				<select className = "u-full-width" id="frequency" onChange = {this.handleFreqChange}>
					<option value="Annual">Annual</option>
					<option value="Monthly">Monthly</option>
					<option value="Fornightly">Fornightly</option>
					<option value="Weekly">Weekly</option>
					<option value="Day Rate">Day Rate</option>
				</select>		
			</div>
			<div className="two columns">
				<label htmlFor="salaryInput">Salary ${Math.round(eval(salary)).toLocaleString()} </label>
				<input className = "u-full-width" placeholder={Math.round(salaryInput)} value = {salaryInput} id="salaryInput" onChange = {this.handleSalaryInputChange}/>
			</div>
	
	      	<div className="two columns">
	      		<label htmlFor="taxInput">Tax ${Math.round(eval(tax)).toLocaleString()} </label>
				<input className = "u-full-width" placeholder={Math.round(tax)} value = {taxInput} id="taxInput" onChange = {this.handleTaxInputChange}/>
			</div>
			<div className="two columns">
	      		<label htmlFor="afterTaxInput">Post tax ${Math.round(eval(postTax)).toLocaleString()} </label>
				<input className = "u-full-width" value = {postTaxInput} id="afterTaxInput" onChange = {this.handlePostTaxChange}/>
	      	</div>
	      	<div className="two columns">
	      		<label htmlFor="medicareLevy_show">Medicare Levy </label>
	      		<div id = "medicareLevy_show">{Math.round(medicareLevy).toLocaleString()}</div>
	      	</div>
			<div className="two columns">
	      		<label htmlFor="superannuation_show">Superannuation ${superannuation.toLocaleString()} @ {super_pct}% </label>
	      		<div id = "superannuation_show">{Math.round(superannuation)}</div>
	      	</div>
		</div>
		<div className="row">

		</div>
	</form>
      );
		}
}

ReactDOM.render(
	<div>
	<div className = "row">
		<h3> Calculation 1</h3>
	</div>
	<TaxCalculator salary = "78000" super_pct = "9.5"/> 

	<div className = "row">
		<h3> Calculation 2</h3>
	</div>
	<TaxCalculator  salary = "65000" super_pct = "9.5"/>
	</div>,
		document.getElementById('root')
);