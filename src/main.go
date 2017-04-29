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
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)

const rowsplitnum = 10
const colsplitnum = 30
const LAT = 180
const LNG = 360

type Position struct {
	Lat float32 `json:"lat"`
	Lng float32 `json:"lng"`
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
	Tips string
}

func main() {


	//ルーティング
	router := mux.NewRouter()
	router.HandleFunc("/sim/{mode}", JsonHandler)
	// $PROROOT/template/map.html が http://localhost:8080/template/map.html でアクセスできる
	router.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("."))))

	http.Handle("/", router)
	log.Fatal(http.ListenAndServe(":8080", router))
}

func JsonHandler(rw http.ResponseWriter, req *http.Request) {
	fmt.Print("jsonHandler entered.")
	output := Output{Status: 0, Result: "default", Scale: "0", Scaleranges: []int{0, 0, 0, 0, 0, 0, 0, 0, 0}}

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

	//震度計算
	if vars["mode"] == "manual" {
		randvalue := rand.NormFloat64() - 1
		scale := float32(randvalue + float64(0.947802 * input.Epicenter.Mag) - 0.004825 * math.Sqrt(float64(((input.Epicenter.Pos.Lat- input.Observation.Pos.Lat) / 0.0111) * ((input.Epicenter.Pos.Lat - input.Observation.Pos.Lat) / 0.0111) + ((input.Epicenter.Pos.Lng - input.Observation.Pos.Lng) / 0.0091) * ((input.Epicenter.Pos.Lng - input.Observation.Pos.Lng) / 0.0091))))
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
		output.Scaleranges[8] = output.Scaleranges[6]
		output.Scaleranges[7] = (output.Scaleranges[5] + output.Scaleranges[6]) / 2
		output.Scaleranges[6] = output.Scaleranges[5]
		output.Scaleranges[5] = (output.Scaleranges[4] + output.Scaleranges[5]) / 2

		//そのまま座標を返す
		output.Observation.Lat = input.Observation.Pos.Lat
		output.Observation.Lng = input.Observation.Pos.Lng
		output.Epicenter.Lat = input.Epicenter.Pos.Lat
		output.Epicenter.Lng = input.Epicenter.Pos.Lng
	} else if vars["mode"] == "auto" {



		//データベース
		db, err := sql.Open("mysql", "root:@/seism")
		if err != nil {
			panic(err.Error())
		}
		defer db.Close() // 関数がリターンする直前に呼び出される

		rows, err := db.Query("SELECT latitude, longitude, tag FROM plate") //
		if err != nil {
			panic(err.Error())
		}

		//計算開始
		rowbit := int(LAT/colsplitnum)
		colbit := int(LNG/rowsplitnum)

		latadj := int(input.Observation.Pos.Lat + 90)
		lngadj := int(input.Observation.Pos.Lng)

		lattag := latadj/rowbit
		lngtag := lngadj/colbit

		tag := lattag * rowsplitnum + lngtag

		fmt.Print(tag)
		mind := 9999.0
		var minp Position
		minp.Lat = -90.0
		minp.Lng = -90.0

		for rows.Next() {
			var latitude float32
			var longitude float32
			var tagr int
			dist := 9999.0
			if err := rows.Scan(&latitude, &longitude, &tagr); err != nil {
				log.Fatal(err)
			}
			fmt.Println(latitude, longitude, tagr)
			if tagr == tag {
				dist = math.Sqrt(float64(((latitude - input.Observation.Pos.Lat) / 0.0111) * ((latitude - input.Observation.Pos.Lat) / 0.0111) + ((longitude - input.Observation.Pos.Lng) / 0.0091) * ((longitude - input.Observation.Pos.Lng) / 0.0091)))
				if mind > dist {
					fmt.Print("mind更新")
					mind = dist
					minp.Lat = latitude
					minp.Lng = longitude
				}
			}
		}

		fmt.Print(minp.Lat, minp.Lng)

		//columns, err := rows.Columns() // カラム名を取得
		//if err != nil {
		//	panic(err.Error())
		//}

		//values := make([]sql.RawBytes, len(columns))

		//  rows.Scan は引数に `[]interface{}`が必要.

		//scanArgs := make([]interface{}, len(values))
		//for i := range values {
		//	scanArgs[i] = &values[i]
		//}



		//for rows.Next() {
		//	err = rows.Scan(scanArgs...)
		//	if err != nil {
		//		panic(err.Error())
		//	}
		//
		//	dist := 9999.0
		//	flag := false
		//	valuest := []float32{0.0, 0.0, 0.0}
		//	for i, col := range values {
		//		valuest[i] = float32(col)
		//	}
		//	for i, col := range values {
		//		if i == 2{
		//			if int(col) == tag {
		//				flag = true
		//			}
		//		}
		//		if flag == true {
		//			dist = math.Sqrt(float64(((valuest[0] - input.Observation.Pos.Lng) / 0.0111) * ((valuest[0] - input.Observation.Pos.Lng) / 0.0111) + ((valuest[1] - input.Observation.Pos.Lat) / 0.0091) * ((valuest[1] - input.Observation.Pos.Lat) / 0.0091)))
		//			if mind > dist {
		//				mind = dist
		//				minp.Lat = valuest[0]
		//				minp.Lng = valuest[1]
		//			}
		//			flag = false
		//		}
		//	}
		//
		//}

		randvalue := rand.NormFloat64() - 1
		scale := float32(randvalue + float64(0.947802 * (5 + 2 * rand.Float32())) - 0.004825 * mind)
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
			output.Scaleranges[i] = int((float32(randvalue) + 0.947802 * (5 + 2 * rand.Float32()) - (float32(i) + 0.5)) / 0.004825)
			if output.Scaleranges[i] < 0 {
				output.Scaleranges[i] = 0
			}
		}
		output.Scaleranges[8] = output.Scaleranges[6]
		output.Scaleranges[7] = (output.Scaleranges[5] + output.Scaleranges[6]) / 2
		output.Scaleranges[6] = output.Scaleranges[5]
		output.Scaleranges[5] = (output.Scaleranges[4] + output.Scaleranges[5]) / 2

		//見つけた座標を返す
		output.Observation.Lat = input.Observation.Pos.Lat
		output.Observation.Lng = input.Observation.Pos.Lng
		output.Epicenter.Lat = minp.Lat
		output.Epicenter.Lng = minp.Lng
	} else {
		output.Status = 2
		output.Result = "API Error!"
	}




	tips := []string{
		"キッチンの火を急いで止めに行くとけがをする恐れがありますので、揺れが収まってから火を消しに行きましょう。",
		"調理中に地震が起こった場合調理器具が落ちやけどする恐れがあるので、コンロから離れましょう。",
		"揺れの合間を見て、ドアや窓を開けて出口を確保しましょう。"}

	//ティップス
	output.Tips = tips[rand.Intn(3)]

	fmt.Println(input)

	rw.WriteHeader(http.StatusOK)
}

