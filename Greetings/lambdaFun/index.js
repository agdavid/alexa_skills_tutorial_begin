'use strict';

let http = require('http');

module.exports = {
    handler
};

function handler(event, context) {
    try {
        if (process.env.NODE_ENV==='development') {
            console.log(JSON.stringify(event, undefined, 2));
        }
        
        let request = event.request;        
        /*
        request.type
        i)   LaunchRequest       Ex: "Open greeter"
        ii)  IntentRequest       Ex: "Say hello to John" or "ask greeter to say hello to John"
        iii) SessionEndedRequest Ex: "exit" or error or timeout
        */
       let session = event.session;
       if(!event.session.attributes) {
           event.session.attributes = {};
       }
    
        if (request.type === 'LaunchRequest') {
            handleLaunchRequest(context);
        } else if (request.type === 'IntentRequest') {
            if (request.intent.name === 'HelloIntent') {
                handleHelloIntent(context, request);
            } else if (request.intent.name === 'QuoteIntent') {
                handleQuoteIntent(context, session);
            } else if (request.intent.name === 'AnotherQuoteIntent') {
                handleAnotherQuoteIntent(context, session);
            } else if (request.intent.name === 'AMAZON.StopIntent' || request.intent.name === 'AMAZON.CancelIntent') {
                handleStopOrCancelIntent(context);
            } else {
                throw 'Unknown intent type';
            }
        } else if (request.type === 'SessionEndedRequest') {
    
        } else {
            throw 'Unknown intent type';
        }
    } catch(e) {
        context.fail(`Error: ${e}`);
    }
};

function buildResponse(options) {
    if (process.env.NODE_ENV==='development') {
        console.log(JSON.stringify(options, undefined, 2));
    }

    // see https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#response-body-syntax
    let response = {
        version: "1.0",
        response: {
            outputSpeech: {
            type: "SSML",
            ssml: "<speak>"+options.speechText+"</speak>"
            },
            shouldEndSession: options.endSession
        }
    };

    if (options.repromptText) {
        response.response.reprompt = {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>"+options.repromptText+"</speak>"
              }
        };
    }

    if (options.cardTitle) {
        response.response.card = {
            type: "Simple",
            title: options.cardTitle,
        }

        if(options.imageUrl) {
            response.response.card.type="Standard";
            response.response.card.text = options.cardContent;
            response.response.card.image = {
                smallImageUrl: options.imageUrl,
                largeImageUrl: options.imageUrl
            };
        } else {
            response.response.card.content = options.cardContent
        }
    }

    if(options.session && options.session.attributes) {
        response.sessionAttributes = options.session.attributes;
    }

    return response;
};

function getTiming() {
    let myDate = new Date();
    let hours = myDate.getUTCHours() - 8; // adjust for PST timezone
    if (hours < 0) {
        hours = hours + 24;
    }

    if (hours < 12) {
        return "Good morning. ";
    } else if (hours < 18)  {
        return "Good afternoon. ";
    } else {
        return "Good evening. ";
    }
};

function getQuote(callback) {
    let url = 'http://api.forismatic.com/api/1.0/json?method=getQuote&lang=en&format=json';
    let req = http.get(url, function(res) {
        let body = "";
        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            body = body.replace(/\\/g,'');
            let quote = JSON.parse(body);
            callback(quote.quoteText);
        });
    });

    req.on('error', function(err) {
        callback('', err);
    });
}

function handleLaunchRequest(context) {
    let options = {};
    // set options
    // skill instruction
    options.speechText = 'Welcome to Greetings skill. Using our skill you can greet your guests. Whom do you want to greet?';
    // on silence
    options.repromptText = 'You can say for example, say hello to John.';
    options.endSession = false;
    // create response matching ASK syntax
    let response = buildResponse(options);
    // send response
    context.succeed(response);
}

function handleHelloIntent(context, request) {
    let name = request.intent.slots.FirstName.value;
    let options = {};
    options.speechText = `Hello ${name}. This session is open. `;
    options.speechText += getTiming();
    options.cardTitle=`Hello ${name}`;
    getQuote(function(quote,err){
        if(err) {
            context.fail(err);
        } else {
            options.speechText += quote;
            options.cardContent = quote;
            options.imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Hello_smile.png';
            options.endSession = false;
            let response = buildResponse(options);
            context.succeed(response);
        }
    });
}

function handleQuoteIntent(context, session) {
    let options = {};
    options.session = session;
    options.speechText = `Here is your quote. `;
    getQuote(function(quote,err){
        if(err) {
            context.fail(err);
        } else {
            options.speechText += quote;
            options.speechText += " Do you want to listen to one more quote?";
            options.repromptText = "You can say yes or one more. ";
            options.session.attributes.quoteIntent = true;
            options.endSession = false;
            let response = buildResponse(options);
            context.succeed(response);
        }
    });
}

function handleAnotherQuoteIntent(context, session) {
    let options = {};
    options.session = session;
    if (session.attributes.quoteIntent) {
        options.speechText = `Back for more. Here is your quote. `;
        getQuote(function(quote,err){
            if(err) {
                context.fail(err);
            } else {
                options.speechText += quote;
                options.speechText += " Do you want to listen to one more quote?";
                options.repromptText = "You can say yes or one more. ";
                options.session.attributes.quoteIntent = true;
                options.endSession = false;
                let response = buildResponse(options);
                context.succeed(response);
            }
        });
    } else {
        options.speechText = " Wrong invocation of this intent. ";
        options.endSession = true;
        context.succeed(buildResponse(options));
    }
}

function handleStopOrCancelIntent(context) {
    let options = {};
    options.speechText = 'All quoted out? Goodbye.';
    options.endSession = true;
    let response = buildResponse(options);
    context.succeed(response);
}