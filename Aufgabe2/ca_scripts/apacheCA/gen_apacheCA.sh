#!/bin/bash

APACHE="diana-yavuz.informatik.haw-hamburg.de"
REL_PATH="`dirname \"$0\"`"


touch $REL_PATH/index.txt
# key erzeugen
openssl genrsa -out $REL_PATH/$APACHE.key 2048

# csr erzeugen
openssl req -new -key $REL_PATH/$APACHE.key -out $REL_PATH/$APACHE.csr -subj "/C=DE/O=haw-hamburg/OU=informatik/CN=diana-yavuz.informatik.haw-hamburg.de"

# zertifikat signieren
openssl ca -config $REL_PATH/_apache.cnf -extensions srv_cert -days 28 -gencrl -md sha256 -in $REL_PATH/$APACHE.csr -out $REL_PATH/$APACHE.crt


#openssl ca -config _apache.cnf -gencrl -in $APACHE.csr -out $APACHE.crt

rm $REL_PATH/index*

