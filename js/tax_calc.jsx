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

    	//calculate tax
    	function income_tax(sal) {
    		if (sal <= 18200) {
    			return 0
    		} else if (sal <= 37000) {
    			return (sal - 18200)*0.19
    		} else if (sal <= 87000) {
    			return (sal - 37000)*0.325 + 3572
    		} else if (sal <= 180000) {
    			return (sal - 87000)*0.37 + 19822
    		} else if (sal > 180000) {
    			return (sal - 180000)*0.45 + 54232
    		}
    	}

        class TaxCalculator extends React.Component {
		  constructor(props) {
		    super(props);
		    this.handleSalaryChange = this.handleSalaryChange.bind(this);
		    this.handleTaxChange = this.handleTaxChange.bind(this)
		    this.handlePostTaxChange = this.handlePostTaxChange.bind(this)

		    this.state = {
		    	salary: props.salary, 
		    	tax : income_tax(props.salary), 
		    	medicareLevy:props.salary*0.025, 
		    	superannuation : props.salary * props.super_pct/100, 
		    	super_pct : props.super_pct, 
		    	postTax : props.salary  - income_tax(props.salary)
		    	};
		  }

		  handleSalaryChange(e) {
		    if (Number.isInteger(eval(e.target.value))) {
		    	this.setState({
		    	salary : e.target.value, 
		    	tax: income_tax(eval(e.target.value)), medicareLevy : eval(e.target.value) * 0.025});
		    	console.log("2")
		    } else {
		    	this.setState({salary: e.target.value, super_pct : this.state.super_pct })
		    	console.log("3")
		    }
		  }

		  handleTaxChange(e) {
		  	console.log("wassup")
		  	if (Number.isInteger(parseInt(e.target.value))) {
		  		this.setState({salary : parseInt(e.target.value)/0.3, tax: parseInt(e.target.value), medicareLevy : this.state.salary * 0.025});
		  	} else {
		  		this.setState({tax: e.target.value});
		  	}
		  }

		  handlePostTaxChange(e) {
		  	
		  }

		  render() {
		    const salary = this.state.salary;
		    const tax = this.state.tax;
		    const medicareLevy = this.state.medicareLevy;
		    const superannuation = this.state.superannuation;
		    const super_pct = this.state.super_pct;
		    const postTax = this.state.postTax;


		    return (
		     <div className = "container example-grid docs-example"> 
		     	<div className="row">
     		      	<div className="three columns">
     		      		<label htmlFor="salaryInput">Input salary ${eval(salary)} </label>
						<input className = "u-full-width" placeholder={salary} id="salaryInput" onChange = {this.handleSalaryChange}/>
     		      	</div>
     		      	<div className="three columns">
     		      		<label htmlFor="taxInput">Input tax ${eval(tax)} </label>
						<input className = "u-full-width" placeholder={tax} id="taxInput" onChange = {this.handleTaxChange}/>
					</div>
					<div className="three columns">
     		      		<label htmlFor="afterTaxInput">Post tax ${eval(postTax)} </label>
						<input className = "u-full-width" placeholder={postTax} id="afterTaxInput" onChange = {this.handlePostTaxChange}/>
     		      	</div>
     		      	<div className="two columns">
     		      		<label htmlFor="medicareLevy_show">Medicare Levy </label>
     		      		<div id = "medicareLevy_show">{medicareLevy}</div>
     		      	</div>
					<div className="two columns">
     		      		<label htmlFor="superannuation_show">Superannuation ${superannuation} @ {super_pct}% </label>
     		      		<div id = "superannuation_show">{superannuation}</div>
     		      	</div>
				</div>
			</div>
		      );
  			}
		}

		ReactDOM.render(
			<div>
			<h2> Calculation 1</h2>
			<TaxCalculator salary = "80000" super_pct = "9.5"/> 

			<h2>Calculation 2 for comparison</h2>
			<TaxCalculator  salary = "70000" super_pct = "9.5"/>
			</div>,
  			document.getElementById('root')
		);