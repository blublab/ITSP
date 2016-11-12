#!/bin/bash

# key erzeugen
openssl genrsa -aes256 -out rootCA.key 4096

openssl req -x509 -config _rootCA.cnf -key rootCA.key -new -subj "/C=DE/O=haw-hamburg/CN=CA" -days 7300 -sha256 -extensions v3_ca -out certs/rootCA.pem



