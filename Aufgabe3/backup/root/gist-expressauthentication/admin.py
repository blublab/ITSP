#!/usr/bin/python
# -*- coding: UTF-8 -*-

import redis 
import hashlib
import base64
import os
import math
import time
import sys, getopt

def helpAndExit():
	print 'USAGE: admin.py [-c <username> <password> <mail>] | [-l] | [-d <user>] | [-p <user> <newpassword> | [-m <user> <newmail>'
	sys.exit()

def createMail(username,mail,r):
	timestamp = math.floor(time.time() / 1000);
	timestamp_hash=hashlib.sha256(str(timestamp)).hexdigest();
	url='/verify/user='+username+'&token='+timestamp_hash;
	r.hset(username, "timestamp", timestamp)
	r.hset(username, "valid", False)
	fileName = "/mails/"+username+"_mail.html";
	fn = os.path.dirname(os.path.abspath(__file__)) + fileName
	fullUrl = 'https://diana-yavuz.informatik.haw-hamburg.de' + url;
	text= "Bitte klicke <a href="+fullUrl+">hier</a>, um deine Email zu verifizieren."
	f = open(fn,'w')
	f.write(text)
	
def main(argv):
	r = redis.StrictRedis(host='localhost', port=6379, db=0)
	if not argv:
		helpAndExit()
	opt = argv[0]
	if opt == '-h':
		helpAndExit()
	elif opt in ("-c"):
		if not len(argv) == 4:
			helpAndExit()
		username=argv[1]
		password=argv[2]
		mail=argv[3]
		userExists=r.keys(username)
		if not userExists:
			tmp = str(username)+str(password)
			hashPassword = base64.b64encode(hashlib.sha256(tmp).digest())
			r.hset(username, "password", hashPassword)
			r.hset(username, "mail", mail)
			createMail(username,mail,r)
			print "Nutzer "+str(username)+" angelegt."
		else:
			print "Nutzer "+str(username)+" existiert bereits!"
	elif opt in ("-p"):
		if not len(argv) == 3:
			helpAndExit()
		username=argv[1]
		password=argv[2]
		userExists=r.keys(username)
		if userExists:
			tmp = str(username)+str(password)
			hashPassword = base64.b64encode(hashlib.sha256(tmp).digest())
			r.hset(username, "password", hashPassword)
			print "Passwort für "+str(username)+" aktualisiert."
		else:
			print "Nutzer "+str(username)+" existiert nicht!" "\n"
	elif opt in ("-m"):
		if not len(argv) == 3:
			helpAndExit()
		username=argv[1]
		mail=argv[2]
		userExists=r.keys(username)
		if userExists:
			r.hset(username, "mail", mail)
			createMail(username,mail,r)
			print "Email für "+str(username)+" aktualisiert."
		else:
			print "Nutzer "+str(username)+" existiert nicht!" "\n"
	elif opt in ("-l"):
		users=r.keys('*')
		for user in users:
			print str(user)  + " " + str(r.hgetall(user)) + "\n"
	elif opt in ("-d"):
		r.delete(argv[1])
		print "Nutzer " + argv[1] + " gelöscht."
	else:
		helpAndExit()
	
	

if __name__ == "__main__":
   main(sys.argv[1:])
