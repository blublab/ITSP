#!/bin/bash

SSL="sslCA"
REL_PATH="`dirname \"$0\"`"

touch $REL_PATH/index.txt

# key erzeugen
openssl genrsa -out $REL_PATH/$SSL.key 2048


# csr erzeugen
openssl req -new -key $REL_PATH/$SSL.key -out $REL_PATH/$SSL.csr -subj "/C=DE/O=haw-hamburg/OU=informatik/CN=CA-diana-yavuz"


openssl ca -config $REL_PATH/_ssl.cnf -extensions v3_intermediate_ca -gencrl -days 28 -md sha256 -in $REL_PATH/$SSL.csr -out $REL_PATH/$SSL.crt


rm $REL_PATH/index*

# zertifikat signieren
#openssl ca -config _ssl.cnf -gencrl -x509 -in $SSL.csr -out $SSL.crt

