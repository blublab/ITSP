#!/bin/bash

REL_PATH="`dirname \"$0\"`"
echo 01 > $REL_PATH/serial

# key erzeugen
openssl genrsa -out $REL_PATH/rootCA.key 2048

# csr erzeugen
openssl req -x509 -key $REL_PATH/rootCA.key -config $REL_PATH/_rootCA.cnf -days 7300 -sha256 -extensions v3_ca -subj "/C=DE/O=haw-hamburg/CN=CA" -out certs/rootCA.crt

# zertifikat signieren
#openssl ca -config $REL_PATH/_rootCA.cnf -extensions v3_ca -selfsign -gencrl -days 1000 -md sha256 -in $REL_PATH/certs/rootCA.csr -out $REL_PATH/certs/rootCA.crt


#openssl req -config $REL_PATH/_rootCA.cnf -key $REL_PATH/rootCA.key -new -x509 -days 7300 -sha256 -extensions v3_ca -out $REL_PATH/certs/rootCA.crt

