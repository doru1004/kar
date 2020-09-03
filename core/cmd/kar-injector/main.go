package main

import (
	"crypto/tls"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.ibm.com/solsa/kar.git/core/internal/sidecar"
	"github.ibm.com/solsa/kar.git/core/pkg/logger"
)

var (
	certFile  string
	keyFile   string
	port      int
	verbosity string
)

func init() {
	flag.StringVar(&certFile, "tls_cert_file", "injector-tls.crt", "x509 Certificate for TLS")
	flag.StringVar(&keyFile, "tls_private_key_file", "injector-tls.key", "x509 private key matching -tls_cert_file")
	flag.IntVar(&port, "port", 8443, "port to listen on")
	flag.StringVar(&verbosity, "v", "info", "Logging verbosity")
}

func serve(w http.ResponseWriter, r *http.Request) {
	var body []byte
	if r.Body != nil {
		if data, err := ioutil.ReadAll(r.Body); err == nil {
			body = data
		}
	}
	logger.Debug("handling request: %s", body)

	contentType := r.Header.Get("Content-Type")
	if contentType != "application/json" {
		msg := fmt.Sprintf("contentType=%s, expect application/json", contentType)
		logger.Error(msg)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}

	responseObj, statusCode, err := sidecar.HandleAdmissionRequest(body)
	if err != nil {
		msg := fmt.Sprintf("Error while processing request: %v", err)
		logger.Error(msg)
		http.Error(w, err.Error(), statusCode)
		return
	}

	logger.Debug("sending response: %v %v", statusCode, responseObj)

	respBytes, err := json.Marshal(responseObj)
	if err != nil {
		logger.Error(err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(respBytes); err != nil {
		logger.Error(err.Error())
	}
}

func main() {
	flag.Parse()
	logger.SetVerbosity(verbosity)

	http.HandleFunc("/inject-sidecar", serve)

	sCert, err := tls.LoadX509KeyPair(certFile, keyFile)
	if err != nil {
		logger.Fatal("%v", err)
	}
	tlsConfig := tls.Config{Certificates: []tls.Certificate{sCert}}
	server := &http.Server{
		Addr:      fmt.Sprintf(":%d", port),
		TLSConfig: &tlsConfig,
	}

	err = server.ListenAndServeTLS("", "")
	if err != nil {
		logger.Fatal("%v", err)
	}
}
