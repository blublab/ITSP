#!/bin/bash

echo 01 > $REL_PATH/serial

REL_PATH="`dirname \"$0\"`"

# key erzeugen
openssl genrsa -out $REL_PATH/rootCA.key 2048

# csr erzeugen
#openssl req -new -key rootCA.key -out certs/rootCA.csr -subj "/C=DE/O=haw-hamburg/CN=CA"

# zertifikat signieren
#openssl ca  -config _rootCA.cnf -gencrl -in certs/rootCA.csr -out certs/rootCA.crt

openssl req -config $REL_PATH/_rootCA.cnf -key $REL_PATH/rootCA.key -new -x509 -days 7300 -sha256 -extensions v3_ca -out $REL_PATH/certs/rootCA.crt

