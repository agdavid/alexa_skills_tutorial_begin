from flask import Flask 
from flask import request
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello world!"

@app.route("/alexa_end_point", methods=['POST'])
def alexa():
    event = request.get_json()

    if __name__ == "__main__":
        app.run()