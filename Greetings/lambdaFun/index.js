'use strict';

module.exports = {
    handler
};

function handler(event, context) {
    try {
        let request = event.request;        
        /*
        request.type
        i)   LaunchRequest       Ex: "Open greeter"
        ii)  IntentRequest       Ex: "Say hello to John" or "ask greeter to say hello to John"
        iii) SessionEndedRequest Ex: "exit" or error or timeout
        */
    
        if (request.type === 'LaunchRequest') {
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
        } else if (request.type === 'IntentRequest') {
            if (request.intent.name === 'HelloIntent') {
                let name = request.intent.slots.FirstName.value;
                let options = {};
                options.speechText = `Hello ${name}. `;
                options.speechText += getTiming();
                options.endSession = true;
                let response = buildResponse(options);
                context.succeed(response);
                
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
    // see https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#response-body-syntax
    let response = {
        version: "1.0",
        response: {
            outputSpeech: {
            type: "PlainText",
            text: options.speechText
            },
            shouldEndSession: options.endSession
        }
    };

    if (options.repromptText) {
        response.response.reprompt = {
            outputSpeech: {
                type: "PlainText",
                text: options.repromptText
              }
        };
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