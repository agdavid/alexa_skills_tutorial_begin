from flask import Flask 
from flask import request
from flask import make_response
import json
import datetime

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello world!"

# curl -H "Content-Type: application/json" --data @event.json http://127.0.0.1:5000/alexa_end_point
# curl -H "Content-Type: application/json" --data @event.json https://99aec5db.ngrok.io/alexa_end_point
@app.route("/alexa_end_point", methods=['POST'])
def alexa():
    event = request.get_json() 
    req = event['request']

    if req['type'] == 'LaunchRequest':
        return handle_launch_request()
    elif req['type'] == 'IntentRequest':
        if req['intent']['name'] == 'HelloIntent':
            return handle_hello_intent(req)
        else:
            return "", 400
    elif req['type'] == 'SessionEndedRequest':
        pass

def handle_hello_intent(req):
    'Handles hello intent and returns response'

    name = req['intent']['slots']['FirstName']['value']
    res = Response()
    res.speech_text = 'Hello {0} . '.format(name)
    res.speech_text += get_wish()
    return res.build_response()

def get_wish():
    'Return good morning/afternoon/evening depending on time of day'

    current_time = datetime.datetime.utcnow()
    hours = current_time.hour-8
    if hours < 0:
        hours = 24+hours

    if hours < 12:
        return 'Good morning. '
    elif hours < 18:
       return 'Good afternoon. '
    else:
        return 'Good evening. '

def handle_launch_request():
    'Handles launch request and generates response'
    res = Response()
    res.speech_text = 'Welcome to Greetings skill. Using our skill you can greet your guests. Whom do you want to greet?'
    res.reprompt_text = 'You can say for example, say hello to John.'
    res.end_session = False

    return res.build_response()

class Response(object):
    'Alexa skill response object with helper functions'

    def __init__(self):
        self.speech_text = None 
        self.reprompt_text = None 
        self.end_session = True 
    
    def build_response(self):
        'Builds alexa response and returns'

        fnl_response = {
            'version': '1.0',
            'response': {
                'outputSpeech': {
                    'type': 'SSML',
                    'ssml': '<speak>'+self.speech_text+'</speak>'
                },
                'shouldEndSession': self.end_session
            }
        }

        if self.reprompt_text:
                fnl_response['response']['reprompt'] = {
                    'outputSpeech': {
                        'type': 'SSML',
                        'ssml': '<speak>'+self.reprompt_text+'</speak>'
                    }
                }
        
        http_response = make_response(json.dumps(fnl_response))
        http_response.headers['Content-Type'] = 'application/json'
        return http_response

if __name__ == "__main__":
    # app.run()
    port = int(os.getenv('PORT', 5000))
    print "Starting app on port %d" % port
    app.run(debug=False, port=port, host='0.0.0.0')