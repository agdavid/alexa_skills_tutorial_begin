module.exports = {
    handler
};

function handler(event, context) {

    var request = event.request;

    /*
    request.type
    i)   LaunchRequest       Ex: "Open greeter"
    ii)  IntentRequest       Ex: "Say hello to John" or "ask greeter to say hello to John"
    iii) SessionEndedRequest Ex: "exit" or error or timeout
    */

    if (request.type === 'LaunchRequest') {
        
    } else if (request.type === 'IntentRequest') {

    } else if (request.type === 'SessionEndedRequest') {

    } else {
        context.fail('Unknown intent type');
    }
}