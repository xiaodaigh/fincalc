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
//incomeTax(30000, incomeBracket, [0, 0, 3572, 19822, 54232], [0, 0.19, 0.325, 0.37, 0.45])

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

// taxToSalary(20000, 
// 	incomeBracket, [0, 0, 3572, 19822, 54232],
// 	 [0, 0.19, 0.325, 0.37, 0.45])

//React JS calculator class
class TaxCalculator extends React.Component {
  constructor(props) {
    super(props);
    this.handleSalaryChange = this.handleSalaryChange.bind(this);
    this.handleTaxChange = this.handleTaxChange.bind(this)
    this.handlePostTaxChange = this.handlePostTaxChange.bind(this)

    this.state = {
    	salary: props.salary, 
    	tax : incomeTax(props.salary), 
    	medicareLevy:props.salary*0.025, 
    	superannuation : props.salary * props.super_pct/100, 
    	super_pct : props.super_pct, 
    	postTax : props.salary  - incomeTax(props.salary) - props.salary*0.025
    	};
  }

  handleSalaryChange(e) {
  	var etv = eval(e.target.value)
    if (isFinite(etv)) {
    	var new_tax = incomeTax(etv)
    	var new_post_tax = etv - new_tax
    	var new_medicareLevy = etv * 0.025
    	this.setState({
	    	salary : e.target.value, 
	    	tax: Math.round(new_tax), 
	    	postTax: Math.round(new_post_tax - new_medicareLevy),
	    	medicareLevy : new_medicareLevy,
	    	superannuation : etv * this.state.super_pct/100
    	});
    } else {
    	this.setState({
    		salary: e.target.value, 
    		super_pct : this.state.super_pct
    	})
    }
  }

  handleTaxChange(e) {
  	var etv = eval(e.target.value)
  	if (isFinite(etv)) {
  		var new_sal = taxToSalary(etv)
    	var new_post_tax = new_sal - etv
    	var new_medicareLevy = new_sal * 0.025
  		this.setState({salary : Math.round(new_sal), tax: e.target.value, 
  			postTax : Math.round(new_post_tax),
  			medicareLevy : new_medicareLevy,
  			superannuation : new_sal * this.state.super_pct/100});
  	} else {
  		this.setState({tax: e.target.value});
  	}
  }

  handlePostTaxChange(e) {
  	var etv = eval(e.target.value)
  	if (isFinite(etv)) {
  		var new_sal = postTaxToSalary(etv);
  		var new_tax = incomeTax(new_sal)
		var new_medicareLevy = new_sal * 0.025	
  		this.setState({salary : Math.round(new_sal), tax: Math.round(new_tax), 
  			postTax:e.target.value, 
  			medicareLevy : new_medicareLevy,
  			superannuation : new_sal * this.state.super_pct/100
  		});
  	} else {
  		this.setState({postTax: e.target.value});
  	}
  }

  render() {
    const salary = this.state.salary;
    const tax = this.state.tax;
    const medicareLevy = this.state.medicareLevy;
    const superannuation = this.state.superannuation;
    const super_pct = this.state.super_pct;
    const postTax = this.state.postTax;


    return (
     <form> 
     	<div className="row">
			<div className="two columns">
				<label for="frequency">Frequency</label>
				<select className = "u-full-width" id="frequency">
					<option value="Annual">Annual</option>
					<option value="Monthly">Monthly</option>
					<option value="Fornightly">Fornightly</option>
					<option value="Weekly">Weekly</option>
					<option value="Day Rate">Day Rate</option>
				</select>		
			</div>
			<div className="two columns">
				<label htmlFor="salaryInput">Salary ${Math.round(eval(salary)).toLocaleString()} </label>
				<input className = "u-full-width" placeholder={Math.round(salary)} value = {salary} id="salaryInput" onChange = {this.handleSalaryChange}/>
			</div>
	
	      	<div className="two columns">
	      		<label htmlFor="taxInput">Tax ${Math.round(eval(tax)).toLocaleString()} </label>
				<input className = "u-full-width" placeholder={Math.round(tax)} value = {tax} id="taxInput" onChange = {this.handleTaxChange}/>
			</div>
			<div className="two columns">
	      		<label htmlFor="afterTaxInput">Post tax ${Math.round(eval(postTax)).toLocaleString()} </label>
				<input className = "u-full-width" placeholder={Math.round(postTax)} value = {postTax} id="afterTaxInput" onChange = {this.handlePostTaxChange}/>
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
	<div class = "row">
		<h3> Calculation 1</h3>
	</div>
	<TaxCalculator salary = "80000" super_pct = "9.5"/> 

	<div class = "row">
		<h3> Calculation 2</h3>
	</div>
	<TaxCalculator  salary = "70000" super_pct = "9.5"/>
	</div>,
		document.getElementById('root')
);