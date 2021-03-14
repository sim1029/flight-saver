import React, { useState } from "react";
import {
 Box,
 Button,
 Collapsible,
 Heading,
 Grommet,
 Layer,
 ResponsiveContext,
 Form,
 FormField,
 TextInput,
 DateInput,
 Card,
 CardHeader,
 CardBody,
 CardFooter,
 Text,
 InfiniteScroll
} from 'grommet';
import { FormClose, Configure, Ticket, FormNextLink } from 'grommet-icons';

const theme = {
  global: {
    colors: {
      brand: '#00739D',
      focus: '#00739D'
    },
    font: {
      family: 'Roboto',
      size: '18px',
      height: '20px',
    },
  },
};

const defaultValue = {
  originplace: '',
  destinationplace: '',
  inbound: '',
  outbound: '',
};

const AppBar = (props) => (
  <Box
    tag='header'
    direction='row'
    align='center'
    justify='between'
    background='brand'
    pad={{ left: 'medium', right: 'small', vertical: 'small' }}
    elevation='medium'
    style={{ zIndex: '1' }}
    {...props}
  />
);

var myCurrency = {}

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      showSidebar: false,
      value: defaultValue,
      flights: [],
      originVal: "",
      currency: "USD",
      currencyFormLabel: "Select Currency (USD)",
      currencySymbol: "$",
      airportNames: [],
      currencyArr: [],
      value2: {
        currency: ""
      },
    }
    this.create = this.create.bind(this);
    this.createSuggestions = this.createSuggestions.bind(this);
    this.createCurrency = this.createCurrency.bind(this);
    this.suggestCurrency = this.suggestCurrency.bind(this);
    this.createCurrency();
  }

  create(value, currency) {
    // get all entities - GET
    const originplace = value.originplace.substr(value.originplace.indexOf("(")+1, value.originplace.indexOf(")"));
    const destinationplace = value.destinationplace.substr(value.destinationplace.indexOf("(")+1, value.destinationplace.indexOf(")"));
    const outbound = value.outbound.substr(0, value.outbound.indexOf('T'));
    const inbound = "/" + value.inbound.substr(0, value.outbound.indexOf('T'));
    fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browseroutes/v1.0/US/${currency}/en-US/${originplace}/${destinationplace}/${outbound}${inbound}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": "ed870dc8bcmsheb9498735096d60p1ac767jsn0505c11878f0"
      }
    })
    .then(response => response.json())
    .then(response => {
      console.log(response);
      var newFlights = [];
      for(var i = 0; i<response.Quotes.length; i++){
        var newFlight = {carrier: "", price: ""}
        var carrier = response.Carriers.find(item => item.CarrierId === response.Quotes[i].OutboundLeg.CarrierIds[0]);
        var departing = response.Places.find(item => item.PlaceId === response.Quotes[i].OutboundLeg.OriginId);
        var returning = response.Places.find(item => item.PlaceId === response.Quotes[i].OutboundLeg.DestinationId);
        newFlight.carrier = carrier.Name;
        newFlight.price = response.Quotes[i].MinPrice;
        newFlight.originName = departing.Name;
        newFlight.originSymbol = departing.IataCode;
        newFlight.destinationSymbol = returning.IataCode;
        newFlight.destinationName = returning.Name;
        newFlights.push(newFlight);
      }
      this.setState({
        flights: newFlights,
      });
    })
    .catch(err => { console.log(err);
    });
  }

  createSuggestions(value){
    fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/US/USD/en-US/?query=${value}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-key": "2cb41ceb4bmsh64790deead62888p18e177jsn0e5c901f9ff5",
      	"x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
      	"useQueryString": true
      }
    })
    .then(response => response.json())
    .then(response => {
      var newAirportNames = [];
      var suggestions = response.Places;
      for(var i = 0; i<suggestions.length; i++){
        newAirportNames[i] = suggestions[i].PlaceName + " (" + suggestions[i].PlaceId + ")";
      }
      this.setState({
        airportNames: newAirportNames
      })
    })
    .catch(err => { console.log(err);
    });
  }

  createCurrency(){
    fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/reference/v1.0/currencies`, {
    	"method": "GET",
    	"headers": {
    		"x-rapidapi-key": "2cb41ceb4bmsh64790deead62888p18e177jsn0e5c901f9ff5",
    		"x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com"
    	}
    })
    .then(response => response.json())
    .then(response => {
      myCurrency = response.Currencies;
    })
    .catch(err => {
    	console.error(err);
    });
  }

  suggestCurrency(value){
    var curr = []
    for(var i=0; i<myCurrency.length; i++){
      var item = myCurrency[i];
      if(item.Code.includes(value.toUpperCase())){
        curr.push(item.Code);
      }
      if(curr.length > 8) break;
    };
    console.log(curr);
    this.setState({
      currencyArr: curr
    })
  }

  render() {
    return (
      <Grommet theme={theme} full>
      <ResponsiveContext.Consumer>
      {size => (
        <Box fill>
          <AppBar>
            <Heading level='3' margin='none'>Flight-Saver</Heading>
            <Button
              color = "light-1"
              label={this.state.currency}
              onClick={() => {
                this.setState({
                  showSidebar: !this.state.showSidebar
                })
              }}
            />
          </AppBar>
          <Box direction='row' alignSelf="center" flex overflow={{ horizontal: 'hidden' }}>
            <Box alignSelf="start" justify='center' direction="column" margin="medium">
              <Box justify='stretch'>
                <Form
                  value={this.state.value}
                  onChange={value => {
                    if(this.state.originVal !== value.originplace) this.createSuggestions(value.originplace);
                    else this.createSuggestions(value.destinationplace);
                    this.setState({
                      value: value,
                      originVal: value.originplace
                    });
                  }}
                  onReset={event => {
                    this.setState({
                      value: defaultValue,
                      flights: []
                    })
                  }
                  }
                  onSubmit={event =>
                    {
                      this.create(event.value, this.state.currency);
                    }
                  }
                >
                  <Box direction="row" gap="medium">
                    <FormField label="Leaving from" name="originplace" required>
                      <TextInput name="originplace" suggestions={this.state.airportNames} />
                    </FormField>
                    <FormField label="Going to" name="destinationplace" required>
                      <TextInput name="destinationplace" suggestions={this.state.airportNames} />
                    </FormField>
                    <FormField name="outbound" label="Departing" required>
                      <DateInput format="mm/dd/yyyy" label="Departing" name="outbound"/>
                    </FormField>
                    <FormField name="inbound" label="Returning">
                      <DateInput format="mm/dd/yyyy" label="Returning" name="inbound"/>
                    </FormField>
                    <Box alignSelf="center">
                      <Button type="submit" label="Search" primary margin="xsmall"/>
                      <Button type="reset" label="Reset" margin="xsmall"/>
                    </Box>
                  </Box>
                </Form>
              </Box>
              <Box overflow="auto" margin="medium" fill="vertical">
                <InfiniteScroll items={this.state.flights}>
                  {(item) => (
                    <Box justify='center' direction="row" margin="small" flex={false}>
                      <Card height="xsmall" fill="horizontal" basis="2/3" background="light-1" pad="small">
                        <CardHeader fill="horizontal">
                          <Text size="xlarge" color="neutral-3">{item.carrier}</Text><Text size="2xl" weight="bold">{this.state.currencySymbol}{item.price}</Text>
                        </CardHeader>
                        <CardBody>
                          <Text weight="bold" size="small">{item.originName} ({item.originSymbol}) <FormNextLink/> {item.destinationName} ({item.destinationSymbol})</Text>
                        </CardBody>
                      </Card>
                    </Box>
                  )}
                </InfiniteScroll>
              </Box>
            </Box>
          {(!this.state.showSidebar || size !== 'small') ? (
            <Collapsible direction="horizontal" open={this.state.showSidebar}>
              <Box
                 flex
                 width='medium'
                 background='light-2'
                 elevation='small'
                 align='center'
                 justify='center'
                 direction="column"
              >
                <Form
                  value={this.state.value2}
                  onChange={value => {
                    this.suggestCurrency(value.currency);
                    this.setState({
                      value2: value,
                    });
                  }}
                  onSubmit={event =>
                    {
                      var newCurrency = myCurrency.find(item => item.Code === event.value.currency.toUpperCase());
                      var newStr = "Select Currency (" + newCurrency.Code + ")";
                      this.setState({
                        value2: {
                          currency: ""
                        },
                        currency: newCurrency.Code,
                        currencySymbol: newCurrency.Symbol,
                        currencyFormLabel: newStr,
                        showSidebar: false
                      })
                      this.create(this.state.value, newCurrency.Code);
                    }
                  }
                >
                  <FormField label={this.state.currencyFormLabel} name="currency" required>
                    <TextInput name="currency" suggestions={this.state.currencyArr} />
                  </FormField>
                  <Box alignSelf="center">
                    <Button type="submit" label="Enter" primary margin="xsmall"/>
                  </Box>
                </Form>
              </Box>
            </Collapsible>
          ): (
            <Layer>
              <Box
                 background='light-2'
                 tag='header'
                 justify='end'
                 align='center'
                 direction='row'
               >
                 <Button
                   icon={<FormClose />}
                   onClick={() => this.setState({
                     showSidebar: false
                   })}
                 />
               </Box>
              <Box
                fill
                background='light-2'
                align='center'
                justify='center'
              >
              sidebar
              </Box>
            </Layer>
          )}
          </Box>
        </Box>
      )}
      </ResponsiveContext.Consumer>
      </Grommet>
    );
  }
}

export default App;
