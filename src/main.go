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
	_ "github.com/go-sql-driver/mysql"
)

type Position struct {
	Lat float32 `json:"lat"`
	Long float32 `json:"long"`
}

type Observation struct {
	Pos Position `json:"pos"`
}

type Epicenter struct {
	Pos Position `json:"pos"`
	Mag float32 `json:"mag"`
}

type Input struct {
	Observation Observation `json:"observation"`
	Epicenter   Epicenter   `json:"epicenter"`
}

type Output struct {
	Status int
	Result string
	Scale string
	Scaleranges []int
	Observation Position
	Epicenter Position
}

func main() {
	router := mux.NewRouter()

	router.HandleFunc("/sim/{mode}", JsonHandler)

	// 静的ファイルの提供
	// $PROROOT/template/map.html が http://localhost:8080/template/map.html でアクセスできる
	router.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("."))))

	http.Handle("/", router)
	log.Fatal(http.ListenAndServe(":8080", router))
}

func JsonHandler(rw http.ResponseWriter, req *http.Request) {
	fmt.Print("jsonHandler entered.")
	output := Output{Status: 0, Result: "default", Scale: "0", Scaleranges: []int{0, 0, 0, 0, 0, 0, 0, 0}}

	vars := mux.Vars(req)
	output.Result = vars["mode"] + "モードでアクセスを受けました"

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
	var input Input
	err = json.Unmarshal(body[:length], &input)
	if err != nil {
		output.Status = 1
		output.Result = "Parse Error!"
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	randvalue := rand.NormFloat64() - 1
	scale := float32(randvalue + float64(0.947802 * input.Epicenter.Mag) - 0.004825 * math.Sqrt(float64(((input.Epicenter.Pos.Long - input.Observation.Pos.Long) / 0.0111) * ((input.Epicenter.Pos.Long - input.Observation.Pos.Long) / 0.0111) + ((input.Epicenter.Pos.Lat - input.Observation.Pos.Lat) / 0.0091) * ((input.Epicenter.Pos.Lat - input.Observation.Pos.Lat) / 0.0091))))
	switch {
	case scale >= 6.5 :
		output.Scale = "7"
	case scale < 6.5 && scale >= 6.0 :
		output.Scale = "6強"
	case scale < 6.0 && scale >= 5.5 :
		output.Scale = "6弱"
	case scale < 5.5 && scale >= 5.0 :
		output.Scale = "5強"
	case scale < 5.0 && scale >= 4.5 :
		output.Scale = "5弱"
	case scale < 4.5 && scale >= 3.5 :
		output.Scale = "4"
	case scale < 3.5 && scale >= 2.5 :
		output.Scale = "3"
	case scale < 2.5 && scale >= 1.5 :
		output.Scale = "2"
	case scale < 1.5 && scale >= 0.5 :
		output.Scale = "1"
	case scale < 0.5 :
		output.Scale = "0"
	}
	for i, _ := range output.Scaleranges {
		output.Scaleranges[i] = int((float32(randvalue) + 0.947802 * input.Epicenter.Mag - (float32(i) + 0.5)) / 0.004825)
		if output.Scaleranges[i] < 0 {
			output.Scaleranges[i] = 0
		}
	}

	//そのまま座標を返す
	output.Observation.Lat = input.Observation.Pos.Lat
	output.Observation.Long = input.Observation.Pos.Long
	output.Epicenter.Lat = input.Epicenter.Pos.Lat
	output.Epicenter.Long = input.Epicenter.Pos.Long

	fmt.Println(input)

	rw.WriteHeader(http.StatusOK)
}

