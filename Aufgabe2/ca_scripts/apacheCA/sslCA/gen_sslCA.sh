#!/bin/bash

SSL="sslCA"

# key erzeugen
openssl genrsa -out $SSL.key 2048

# csr erzeugen
openssl req -new -key $SSL.key -out $SSL.csr -subj "/C=DE/O=haw-hamburg/OU=informatik/CN=CA-diana-yavuz"

# zertifikat signieren
openssl ca -config _ssl.cnf -gencrl -in $SSL.csr -out $SSL.crt

