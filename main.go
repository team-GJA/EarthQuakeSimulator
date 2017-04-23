package main

import (
	"github.com/zenazn/goji"
	"github.com/jinzhu/gorm"
	"github.com/zenazn/goji/web"
	"github.com/zenazn/goji/web/middleware"
	_ "github.com/go-sql-driver/mysql"
)

var db *gorm.DB

//main()はルーティング情報だけ記述する。
func main() {
	user := web.New()
	goji.Handle("/user/*", user)

	user.Use(middleware.SubRouter)
	user.Use(SuperSecure)
	user.Get("/index", UserIndex)
	user.Get("/new", UserNew)
	user.Post("/new", UserCreate)
	user.Get("edit/:id", UserEdit)
	user.Post("update/:id", UserUpdate)
	user.Get("/delete/:id", UserDelete)

	goji.Serve()
}

//ここは初期化処理専用
func init() {
	db, _ = gorm.Open("mysql", "root@gorm?charset=tf&parseTime=True/earth_quake_sim")
}