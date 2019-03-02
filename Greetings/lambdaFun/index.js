module.exports = {
    handler
};

function handler(event, context) {

    let request = event.request;
    let response;
    let options;
    /*
    request.type
    i)   LaunchRequest       Ex: "Open greeter"
    ii)  IntentRequest       Ex: "Say hello to John" or "ask greeter to say hello to John"
    iii) SessionEndedRequest Ex: "exit" or error or timeout
    */

    if (request.type === 'LaunchRequest') {
        // set options object
        options = {
            // skill instruction
            speechText: 'Welcome to Greetings skill. Using our skill you can greet your guests. Whom do you want to greet?',
            // on silence
            repromptText: 'You can say for example, say hello to John.',
            endSession: false
        };
        // create response matching ASK syntax
        response = buildResponse(options);
        // send response
        context.succeed(response);
    } else if (request.type === 'IntentRequest') {

    } else if (request.type === 'SessionEndedRequest') {

    } else {
        context.fail('Unknown intent type');
    }
}

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
}