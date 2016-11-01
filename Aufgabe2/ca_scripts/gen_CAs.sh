#!/bin/bash

SSL="ssl"
APACHE="apache"
array=( $SSL $APACHE )
ROOTCADIR="rootCA"

# keys erzeugen
for i in "${array[@]}"
do
	openssl genrsa -out $i.key 2048
done

# csr erzeugen
openssl req -new -key $SSL.key -out $SSL.csr -subj "/C=DE/O=haw-hamburg/OU=informatik/CN=CA-diana-yavuz"
openssl req -new -key $APACHE.key -out $APACHE.csr -subj "/C=DE/O=haw-hamburg/OU=informatik/CN=diana-yavuz.informatik.haw-hamburg.de"

# zertifikate erzeugen
openssl x509 -req -in $SSL.csr -CA $ROOTCADIR/rootCA.pem -CAkey $ROOTCADIR/rootCA.key -CAserial $ROOTCADIR/rootCA.srl  -out $SSL.crt -days 28 -sha256
openssl x509 -req -in $APACHE.csr -CA ssl.crt -CAkey ssl.key -CAserial $SSL.srl  -out $APACHE.crt -days 28 -sha256


#openssl x509 -req -in device.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out device.crt -days 28 -sha256

#The first time you use your CA to sign a certificate you can use the -CAcreateserial option. This option will create a file (ca.srl) containing a serial number. You are probably going to create more certificate, and the next time you will have to do that use the -CAserial option (and no more -CAcreateserial) followed with the name of the file containing your serial number. This file will be incremented each time you sign a new certificate. This serial number will be readable using a browser (once the certificate is imported to a pkcs12 format). And we can have an idea of the number of certificate created by a CA.
