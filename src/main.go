package main


import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io"
	"math/rand"
	"math"
	"log"
	"net/http"
	"strconv"
)

type Input struct {
	Observation Observation `json:"observation"`
	Epicenter   Epicenter   `json:"epicenter"`
}

type Observation struct {
	Lat  float32 `json:"lat"`
	Long float32 `json:"long"`
}

type Epicenter struct {
	Lat       float32 `json:"lat"`
	Long      float32 `json:"long"`
	Magnitude float32 `json:"magnitude"`
}

type Output struct {
	Status int
	Result string
	Scale float32
	Scaleranges []int
}

func jsonHandler(rw http.ResponseWriter, req *http.Request) {
	output := Output{ Status: 0, Result: "default", Scale: 0, Scaleranges: []int{0,0,0,0,0,0,0,0}}

	defer func() {
		outjson, e := json.Marshal(output)
		if e != nil {
			fmt.Println(e)
		}
		rw.Header().Set("Content-Type", "application/json")
		fmt.Fprint(rw, string(outjson))
	}()
	if req.Method != "POST" {
		output.Result = "Not post..."
		return
	}

	if req.Header.Get("Content-Type") != "application/json" {
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	//To allocate slice for request body
	length, err := strconv.Atoi(req.Header.Get("Content-Length"))
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	//Read body data to parse json
	body := make([]byte, length)
	length, err = req.Body.Read(body)
	if err != nil && err != io.EOF {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	//parse json
	var jsonBody Input
	err = json.Unmarshal(body[:length], &jsonBody)
	if err != nil {
		output.Status = 1
		output.Result = "Parse Error!"
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}
	//震度　= -1.872377 + 0.947802 * マグニチュード　- 0.004825 * 震央距離
	//distance = np.sqrt(((minpoint[0] - longitude) / 0.0111) ** 2 + ((minpoint[1] - latitude) / 0.0091) ** 2)

	//magnitude = 8.0

	//earthquake = np.random.normal(-1,1) + 0.947802 * magnitude - 0.004825 * distance
	randvalue := rand.NormFloat64()
	output.Scale = float32(randvalue + float64(0.947802 * jsonBody.Epicenter.Magnitude) - 0.004825 * math.Sqrt(float64(((jsonBody.Epicenter.Long - jsonBody.Observation.Long) / 0.0111) * ((jsonBody.Epicenter.Long - jsonBody.Observation.Long) / 0.0111) + ((jsonBody.Epicenter.Lat - jsonBody.Observation.Lat) / 0.0091) * ((jsonBody.Epicenter.Lat - jsonBody.Observation.Lat) / 0.0091))))
	for i, _ := range output.Scaleranges {
		output.Scaleranges[i] = int((float32(randvalue) + 0.947802 * jsonBody.Epicenter.Magnitude - (float32(i) + 0.5)) / 0.004825)
		if output.Scaleranges[i] < 0 {
			output.Scaleranges[i] = 0
		}
	}
	fmt.Println(jsonBody)
	if output.Scale < 0 {
		output.Status = 2
		output.Scale = 0
		output.Result = "Scale is Negative Number!"
	}
	rw.WriteHeader(http.StatusOK)
}

func main() {
	router := mux.NewRouter()

	// 静的ファイルの提供
	// $PROROOT/template/map.html が http://localhost:8080/template/map.html でアクセスできる
	router.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("."))))

	http.Handle("/", router)
	log.Fatal(http.ListenAndServe(":8080", router))
}

