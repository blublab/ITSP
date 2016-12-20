#!/bin/bash

openssl genrsa -out client.key.pem 2048

openssl req -config openssl.cnf \
      -key client.key.pem \
	-subj "/C=DE/O=haw-hamburg/OU=informatik/CN=Team diana-yavuz"
      -new -sha256 -out client.csr.pem

 openssl ca -config openssl.cnf \
      -extensions usr_cert -days 375 -notext -md sha256 \
      -in client.csr.pem \
      -out client.cert.pem
