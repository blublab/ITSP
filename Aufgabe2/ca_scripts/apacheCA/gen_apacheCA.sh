#!/bin/bash

APACHE="diana-yavuz.informatik.haw-hamburg.de"

# key erzeugen
openssl genrsa -out $APACHE.key 2048

# csr erzeugen
openssl req -new -key $APACHE.key -out $APACHE.csr -subj "/C=DE/O=haw-hamburg/OU=informatik/CN=diana-yavuz.informatik.haw-hamburg.de"

# zertifikat signieren
openssl ca -config _apache.cnf -gencrl -in $APACHE.csr -out $APACHE.crt

