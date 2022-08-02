from flask import Flask, request
from xml.dom import minidom
from flask_cors import CORS
import pyotp
import secrets
import string
import base64
import segno
import requests

users = {'a@b.c':'ABDSE','c@q.i':'EDOQD'}
qrfile = "qrcode.svg"

def user_exists(email):
	if email in users:
		return True
	return False

def save_user(email,key):
	users[email] = key

def get_key(email):
	return users[email]

# returns one-time passcode auth string
def get_auth_string(email,key):
	return pyotp.totp.TOTP(key).provisioning_uri(name=email, issuer_name='Your business')

def save_qr(auth_str, filename):
	segno.make(auth_str).save(filename)

def get_svg_path(filename):
	doc = minidom.parse(filename)
	path_string = [path.getAttribute('d') for path 
									in doc.getElementsByTagName('path')]
	doc.unlink()
	return path_string[0]


app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

@app.route("/generate", methods=["POST"])
def generate():

	if user_exists(request.json['email']):
		secret_key = get_key(request.json['email'])
		return {
			"exists": True, 
			"path": ""
		}
	else:
		base32 = string.ascii_uppercase + "234567"
		size = 16 
		secret_key = ''.join([secrets.choice(base32) for n in range(16)])

		save_qr(get_auth_string(request.json['email'], secret_key), qrfile)	

		save_user(request.json['email'],secret_key)

		return {
			"exists": False, 
			"path": get_svg_path(qrfile)
		}

@app.route("/verify", methods=["POST"])
def verify():
	test_otp_code = pyotp.TOTP(get_key(request.json['email']))	
	if test_otp_code.now() == request.json['passcode']:
		return "valid" 
	return "invalid" 

if __name__ == "__main__":
	app.run(debug=True)