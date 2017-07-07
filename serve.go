package main

import (
	// "fmt"
	"net/http"
)

func main() {
	// http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
	// 	fmt.Printf(r.URL.Path[0:] + "\n")
	// 	http.ServeFile(w, r, r.URL.Path[0:])

	// })

	http.Handle("/", http.FileServer(http.Dir("")))

	http.ListenAndServe(":8080", nil)
}
